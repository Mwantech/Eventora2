import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Share,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserPlus, 
  ExternalLink, 
  Share2,
  Lock,
  Globe,
  User
} from 'lucide-react-native';
import apiClient from '../../../utils/apiClient';
import { useAuth } from '../../../services/auth';

// Event interface
interface Event {
  id?: string;
  _id?: string;
  name: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  isPrivate: boolean;
  creatorId: string;
  participants: number;
  createdAt: string;
  creatorName?: string;
  creatorProfileImage?: string;
  coverImage?: string;
  accessedViaShareLink?: boolean;
  canJoin?: boolean;
  participantDetails?: Array<{
    userId: {
      _id: string;
      name: string;
      profileImage?: string;
    };
    role: string;
    uploads: number;
    joinedAt: string;
    isCreator: boolean;
  }>;
  [key: string]: any;
}

export default function SharedEventScreen() {
  const { id, token } = useLocalSearchParams<{ id: string; token: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const { state: authState } = useAuth();
  
  useEffect(() => {
    if (!id || !token) {
      setError('Invalid event link - missing parameters');
      setIsLoading(false);
      return;
    }
    
    loadSharedEvent();
  }, [id, token]);
  
  const loadSharedEvent = async () => {
    try {
      console.log(`Loading shared event: id=${id}, token=${token}`);
      
      const response = await apiClient.get(`/events/share/${id}/${token}`);
      const eventData = response.data?.data;
      
      console.log('Shared event data received:', eventData ? 'SUCCESS' : 'EMPTY');
      
      if (eventData) {
        const processedEvent = {
          ...eventData,
          id: eventData.id || eventData._id
        };
        
        setEvent(processedEvent);
      } else {
        setError('Event not found or link is invalid');
      }
    } catch (err: any) {
      console.error('Error loading shared event:', err);
      
      if (err.response) {
        console.log('Error response status:', err.response.status);
        console.log('Error response data:', err.response.data);
        
        if (err.response.status === 404) {
          setError('This event link is no longer valid');
        } else if (err.response.status === 401) {
          setError('Authentication required to view this event');
        } else {
          setError(`Error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`);
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!event || !id || !token) {
      Alert.alert('Error', 'No valid event found');
      return;
    }

    if (!authState.isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'You need to be logged in to join events.',
        [
          { text: 'Login', onPress: () => router.push('/auth') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setIsJoining(true);
      
      const response = await apiClient.post(`/events/share/${id}/${token}/join`);
      
      if (response.data?.success) {
        Alert.alert(
          'Success!',
          `You have successfully joined "${event.name}"`,
          [
            {
              text: 'View Event',
              onPress: () => router.push(`/event/${id}`)
            },
            {
              text: 'Stay Here',
              style: 'cancel'
            }
          ]
        );
        
        // Update participant count locally
        setEvent(prev => prev ? { ...prev, participants: prev.participants + 1 } : null);
      }
    } catch (error: any) {
      console.error('Error joining event:', error);
      let errorMessage = 'Failed to join event';
      
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('already joined')) {
            errorMessage = 'You have already joined this event';
            Alert.alert(
              'Already Joined',
              errorMessage,
              [
                {
                  text: 'View Event',
                  onPress: () => router.push(`/event/${id}`)
                },
                { text: 'OK', style: 'cancel' }
              ]
            );
            return;
          } else if (error.response.data?.message?.includes('creator')) {
            errorMessage = 'You are the creator of this event';
            Alert.alert(
              'Event Creator',
              errorMessage,
              [
                {
                  text: 'View Event',
                  onPress: () => router.push(`/event/${id}`)
                },
                { text: 'OK', style: 'cancel' }
              ]
            );
            return;
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.response.status === 404) {
          errorMessage = 'Event link is invalid or expired';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      Alert.alert('Join Error', errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleShareEvent = async () => {
    try {
      const shareUrl = `${process.env.EXPO_PUBLIC_CLIENT_URL || 'http://localhost:8081'}/event/share/${id}/${token}`;
      await Share.share({
        message: `Join me at "${event?.name}"! ${shareUrl}`,
        url: shareUrl,
        title: event?.name
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Handle various time formats
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView 
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20
        }}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
            marginTop: 16,
            textAlign: 'center'
          }}>
            Loading shared event...
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            marginTop: 8,
            textAlign: 'center'
          }}>
            Please wait while we fetch the event details
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView 
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb'
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#8b5cf6" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
            marginLeft: 12
          }}>
            Shared Event
          </Text>
        </View>

        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#ef4444',
            marginBottom: 8,
            textAlign: 'center'
          }}>
            {error}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 20
          }}>
            The shared event link may be invalid or has expired.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={{
              backgroundColor: '#8b5cf6',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8
            }}
          >
            <Text style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Browse Events
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <SafeAreaView 
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
      }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#8b5cf6" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
            marginLeft: 12,
            flex: 1
          }} numberOfLines={1}>
            {event.name}
          </Text>
        </View>
        <TouchableOpacity onPress={handleShareEvent} style={{ marginLeft: 12 }}>
          <Share2 size={22} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Share Link Banner */}
        <View style={{
          backgroundColor: '#f0f9ff',
          borderBottomWidth: 1,
          borderBottomColor: '#e0f2fe',
          paddingHorizontal: 16,
          paddingVertical: 12
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ExternalLink size={16} color="#0ea5e9" />
            <Text style={{
              fontSize: 14,
              color: '#0369a1',
              fontWeight: '500',
              marginLeft: 8
            }}>
              Accessed via shared link
            </Text>
            {event.isPrivate && (
              <View style={{
                backgroundColor: '#fef3c7',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
                marginLeft: 8
              }}>
                <Text style={{
                  fontSize: 10,
                  color: '#92400e',
                  fontWeight: '500'
                }}>
                  PRIVATE
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Event Header */}
        <View style={{ padding: 20 }}>
          {/* Cover Image */}
          {event.coverImage && (
            <Image
              source={{ uri: event.coverImage }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 12,
                marginBottom: 16
              }}
              resizeMode="cover"
            />
          )}

          {/* Event Title and Privacy Status */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#111827',
                lineHeight: 32
              }}>
                {event.name}
              </Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              {event.isPrivate ? (
                <Lock size={20} color="#6b7280" />
              ) : (
                <Globe size={20} color="#6b7280" />
              )}
            </View>
          </View>

          {/* Event Details */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            {/* Date */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={18} color="#8b5cf6" />
              <Text style={{
                fontSize: 16,
                color: '#374151',
                marginLeft: 12,
                fontWeight: '500'
              }}>
                {formatDate(event.date)}
              </Text>
            </View>

            {/* Time */}
            {event.time && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={18} color="#8b5cf6" />
                <Text style={{
                  fontSize: 16,
                  color: '#374151',
                  marginLeft: 12,
                  fontWeight: '500'
                }}>
                  {formatTime(event.time)}
                </Text>
              </View>
            )}

            {/* Location */}
            {event.location && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={18} color="#8b5cf6" />
                <Text style={{
                  fontSize: 16,
                  color: '#374151',
                  marginLeft: 12,
                  fontWeight: '500'
                }}>
                  {event.location}
                </Text>
              </View>
            )}

            {/* Participants */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users size={18} color="#8b5cf6" />
              <Text style={{
                fontSize: 16,
                color: '#374151',
                marginLeft: 12,
                fontWeight: '500'
              }}>
                {event.participants} participant{event.participants !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Creator */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <User size={18} color="#8b5cf6" />
              <Text style={{
                fontSize: 16,
                color: '#374151',
                marginLeft: 12,
                fontWeight: '500'
              }}>
                Created by {event.creatorName || 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={{
              backgroundColor: '#f9fafb',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#111827',
                marginBottom: 8
              }}>
                Description
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#374151',
                lineHeight: 20
              }}>
                {event.description}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            {/* Join Button */}
            <TouchableOpacity
              style={{
                backgroundColor: authState.isAuthenticated ? '#8b5cf6' : '#9ca3af',
                borderRadius: 8,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={handleJoinEvent}
              disabled={!authState.isAuthenticated || isJoining}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <UserPlus size={18} color="#ffffff" />
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 8
                  }}>
                    {authState.isAuthenticated ? 'Join Event' : 'Login to Join'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* View in App Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#8b5cf6',
                borderRadius: 8,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => router.push(`/event/${id}`)}
            >
              <ExternalLink size={18} color="#8b5cf6" />
              <Text style={{
                color: '#8b5cf6',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8
              }}>
                View in App
              </Text>
            </TouchableOpacity>
          </View>

          {/* Authentication Notice */}
          {!authState.isAuthenticated && (
            <View style={{
              backgroundColor: '#fef3c7',
              borderRadius: 8,
              padding: 16,
              marginTop: 16
            }}>
              <Text style={{
                fontSize: 14,
                color: '#92400e',
                textAlign: 'center',
                lineHeight: 18
              }}>
                You need to log in to join events and access full features
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f59e0b',
                  borderRadius: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginTop: 8,
                  alignSelf: 'center'
                }}
                onPress={() => router.push('/auth')}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: '600'
                }}>
                  Login / Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Participants Preview */}
          {event.participantDetails && event.participantDetails.length > 0 && (
            <View style={{
              backgroundColor: '#f9fafb',
              borderRadius: 8,
              padding: 16,
              marginTop: 20
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#111827',
                marginBottom: 12
              }}>
                Participants ({event.participantDetails.length})
              </Text>
              <View style={{ gap: 8 }}>
                {event.participantDetails.slice(0, 5).map((participant, index) => (
                  <View
                    key={participant.userId._id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 4
                    }}
                  >
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#e5e7eb',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {participant.userId.profileImage ? (
                        <Image
                          source={{ uri: participant.userId.profileImage }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16
                          }}
                        />
                      ) : (
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#6b7280'
                        }}>
                          {participant.userId.name?.charAt(0).toUpperCase() || '?'}
                        </Text>
                      )}
                    </View>
                    <Text style={{
                      fontSize: 14,
                      color: '#374151',
                      marginLeft: 12,
                      flex: 1
                    }}>
                      {participant.userId.name}
                      {participant.isCreator && (
                        <Text style={{ color: '#8b5cf6', fontWeight: '500' }}> (Creator)</Text>
                      )}
                    </Text>
                  </View>
                ))}
                {event.participantDetails.length > 5 && (
                  <Text style={{
                    fontSize: 12,
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    And {event.participantDetails.length - 5} more...
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}