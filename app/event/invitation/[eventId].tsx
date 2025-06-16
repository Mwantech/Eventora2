import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Search,
  Send,
  UserPlus,
  X,
  Users,
} from 'lucide-react-native';
import { useAuth } from '../../services/auth';
import { getEventById } from '../../services/eventService';
import type { Event } from '../../services/eventService';

// Types for invitation functionality
interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface InvitationData {
  eventId: string;
  inviteeId: string;
  message?: string;
}

// Invitation service functions (you'll need to implement these)
import apiClient from '../../utils/apiClient';

const searchUsers = async (query: string, eventId: string, limit = 10): Promise<User[]> => {
  try {
    const response = await apiClient.get('/invitations/available-users', {
      params: { query, eventId, limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

const sendInvitation = async (invitationData: InvitationData): Promise<void> => {
  try {
    const response = await apiClient.post('/invitations', invitationData);
    return response.data.data;
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw error;
  }
};

export default function EventInvitationScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { state: authState } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!eventId) {
      Alert.alert('Error', 'Event ID is missing');
      router.back();
      return;
    }

    if (!authState.isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to invite users');
      router.replace('/auth');
      return;
    }

    fetchEvent();
  }, [eventId, authState.isAuthenticated]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchForUsers();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const eventData = await getEventById(eventId as string);
      if (eventData) {
        setEvent(eventData);
        setInvitationMessage(`You're invited to join "${eventData.name}"!`);
      } else {
        Alert.alert('Error', 'Event not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to load event details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const searchForUsers = async () => {
    if (!eventId || searchQuery.trim().length < 2) return;

    try {
      setIsSearching(true);
      const users = await searchUsers(searchQuery.trim(), eventId as string);
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    const userId = user.id || user._id;
    const isAlreadySelected = selectedUsers.some(
      selectedUser => (selectedUser.id || selectedUser._id) === userId
    );

    if (!isAlreadySelected) {
      setSelectedUsers(prev => [...prev, user]);
    }

    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (user: User) => {
    const userId = user.id || user._id;
    setSelectedUsers(prev => 
      prev.filter(selectedUser => (selectedUser.id || selectedUser._id) !== userId)
    );
  };

  const handleSendInvitations = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Users Selected', 'Please select at least one user to invite');
      return;
    }

    try {
      setIsSending(true);
      
      // Send invitations to all selected users
      const invitationPromises = selectedUsers.map(user => 
        sendInvitation({
          eventId: eventId as string,
          inviteeId: user.id || user._id,
          message: invitationMessage.trim() || undefined,
        })
      );

      await Promise.all(invitationPromises);

      Alert.alert(
        'Invitations Sent',
        `Successfully sent ${selectedUsers.length} invitation${selectedUsers.length > 1 ? 's' : ''}!`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error sending invitations:', error);
      Alert.alert('Error', 'Failed to send some invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const renderSearchResult = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSelectUser(item)}
    >
      <Image
        source={{
          uri: item.profileImage || 
               `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=8B35C9&color=ffffff`
        }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <UserPlus size={20} color="#8B5CF6" />
    </TouchableOpacity>
  );

  const renderSelectedUser = ({ item }: { item: User }) => (
    <View style={styles.selectedUserChip}>
      <Image
        source={{
          uri: item.profileImage || 
               `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=8B35C9&color=ffffff`
        }}
        style={styles.chipAvatar}
      />
      <Text style={styles.chipText}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => handleRemoveUser(item)}
        style={styles.removeButton}
      >
        <X size={14} color="#64748B" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite to Event</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Event Info */}
      {event && (
        <View style={styles.eventInfo}>
          <Image
            source={{ uri: event.coverImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80' }}
            style={styles.eventImage}
          />
          <View style={styles.eventDetails}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDate}>{event.date}</Text>
            <View style={styles.participantInfo}>
              <Users size={16} color="#64748B" />
              <Text style={styles.participantText}>{event.participants} participants</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Users</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isSearching && (
              <ActivityIndicator size="small" color="#8B5CF6" />
            )}
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id || item._id}
                renderItem={renderSearchResult}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>
              Selected Users ({selectedUsers.length})
            </Text>
            <FlatList
              data={selectedUsers}
              keyExtractor={(item) => item.id || item._id}
              renderItem={renderSelectedUser}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectedUsersList}
            />
          </View>
        )}

        {/* Message Section */}
        <View style={styles.messageSection}>
          <Text style={styles.sectionTitle}>Invitation Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Add a personal message (optional)"
            value={invitationMessage}
            onChangeText={setInvitationMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            (selectedUsers.length === 0 || isSending) && styles.disabledButton
          ]}
          onPress={handleSendInvitations}
          disabled={selectedUsers.length === 0 || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>
                Send {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ''}Invitation{selectedUsers.length !== 1 ? 's' : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  eventInfo: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  eventDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  searchResults: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  selectedSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  selectedUsersList: {
    marginTop: 8,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C3AED',
    marginLeft: 8,
    marginRight: 4,
  },
  removeButton: {
    padding: 2,
  },
  messageSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
};