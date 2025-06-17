import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bell,
  Calendar,
  Users,
  Check,
  X,
  Clock,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  getReceivedInvitations,
  acceptInvitation,
  declineInvitation,
  type Invitation,
} from '../services/invitationService';
import { styles } from '../styles/notificationsStyles';

const STORAGE_KEY = '@notifications_cache';
const EXPANDED_NOTIFICATIONS_KEY = '@expanded_notifications';

interface NotificationsProps {
  maxItems?: number;
  showViewAll?: boolean;
  compact?: boolean;
  userId?: string;
  limit?: number;
  showHeader?: boolean;
}

export default function NotificationsComponent({ 
  maxItems = 5, 
  showViewAll = true,
  compact = false,
  userId,
  limit,
  showHeader = true
}: NotificationsProps) {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [cachedInvitations, setCachedInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(true);
  
  // Animation refs for each notification
  const animationRefs = useRef<Map<string, Animated.Value>>(new Map());

  // Configure layout animation
  useEffect(() => {
    if (Platform.OS === 'ios') {
      LayoutAnimation.setAnimationTypes({
        create: LayoutAnimation.Types.easeInEaseOut,
        update: LayoutAnimation.Types.easeInEaseOut,
        delete: LayoutAnimation.Types.easeInEaseOut,
      });
    }
  }, []);

  useEffect(() => {
    loadCachedData();
    loadInvitations();
    loadExpandedState();
  }, [userId]);

  // Load cached notifications from AsyncStorage
  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        setCachedInvitations(parsedCache);
        
        // If we have cached data and we're loading, show cached data first
        if (isLoading) {
          setInvitations(parsedCache.slice(0, limit || maxItems));
        }
      }
    } catch (error) {
      console.error('Error loading cached notifications:', error);
    }
  };

  // Save notifications to AsyncStorage
  const saveCachedData = async (notifications: Invitation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to cache:', error);
    }
  };

  // Load expanded state from AsyncStorage
  const loadExpandedState = async () => {
    try {
      const expandedState = await AsyncStorage.getItem(EXPANDED_NOTIFICATIONS_KEY);
      if (expandedState) {
        setExpandedNotifications(new Set(JSON.parse(expandedState)));
      }
    } catch (error) {
      console.error('Error loading expanded state:', error);
    }
  };

  // Save expanded state to AsyncStorage
  const saveExpandedState = async (expandedSet: Set<string>) => {
    try {
      await AsyncStorage.setItem(
        EXPANDED_NOTIFICATIONS_KEY, 
        JSON.stringify(Array.from(expandedSet))
      );
    } catch (error) {
      console.error('Error saving expanded state:', error);
    }
  };

  const loadInvitations = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Get pending invitations first, then mix with recent accepted/declined
      const { invitations: pendingInvitations } = await getReceivedInvitations('pending', 1, limit || maxItems);
      const { invitations: recentInvitations } = await getReceivedInvitations('all', 1, (limit || maxItems) * 2);

      // Combine and sort by date, prioritizing pending invitations
      const combinedInvitations = [
        ...pendingInvitations,
        ...recentInvitations.filter(inv => inv.status !== 'pending')
      ];

      // Remove duplicates and sort by creation date
      const uniqueInvitations = combinedInvitations
        .filter((invitation, index, self) => 
          index === self.findIndex(i => (i.id || i._id) === (invitation.id || invitation._id))
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit || maxItems);

      setInvitations(uniqueInvitations);
      setCachedInvitations(uniqueInvitations);
      
      // Save to cache
      await saveCachedData(uniqueInvitations);
      setIsOnline(true);
      
    } catch (error) {
      console.error('Error loading invitations:', error);
      setIsOnline(false);
      
      // If we have cached data, use it
      if (cachedInvitations.length > 0) {
        setInvitations(cachedInvitations.slice(0, limit || maxItems));
      } else if (!refresh) {
        Alert.alert('Error', 'Failed to load notifications. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadInvitations(true);
  };

  // Get or create animation value for a notification
  const getAnimationValue = (invitationId: string) => {
    if (!animationRefs.current.has(invitationId)) {
      animationRefs.current.set(invitationId, new Animated.Value(0));
    }
    return animationRefs.current.get(invitationId)!;
  };

  // Toggle notification expansion with animation
  const toggleNotificationExpansion = async (invitationId: string) => {
    const isExpanded = expandedNotifications.has(invitationId);
    const animValue = getAnimationValue(invitationId);
    
    // Configure layout animation
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    let newExpandedSet: Set<string>;
    if (isExpanded) {
      // Collapse
      newExpandedSet = new Set(expandedNotifications);
      newExpandedSet.delete(invitationId);
      
      Animated.timing(animValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Expand
      newExpandedSet = new Set(expandedNotifications);
      newExpandedSet.add(invitationId);
      
      Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    
    setExpandedNotifications(newExpandedSet);
    await saveExpandedState(newExpandedSet);
  };

  const handleAcceptInvitation = async (invitation: Invitation) => {
    const invitationId = invitation.id || invitation._id;
    
    try {
      setProcessingInvitations(prev => new Set(prev).add(invitationId));
      
      const result = await acceptInvitation(invitationId);
      
      // Update local state
      const updatedInvitations = invitations.map(inv => 
        (inv.id || inv._id) === invitationId 
          ? { ...inv, status: 'accepted', respondedAt: new Date().toISOString() }
          : inv
      );
      
      setInvitations(updatedInvitations);
      setCachedInvitations(updatedInvitations);
      await saveCachedData(updatedInvitations);

      Alert.alert(
        'Invitation Accepted', 
        `You've successfully joined "${invitation.eventId.name}"!`,
        [
          {
            text: 'View Event',
            onPress: () => router.push(`/event/${invitation.eventId._id}`)
          },
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'Failed to accept invitation. Please try again.');
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    const invitationId = invitation.id || invitation._id;
    
    Alert.alert(
      'Decline Invitation',
      `Are you sure you want to decline the invitation to "${invitation.eventId.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingInvitations(prev => new Set(prev).add(invitationId));
              
              await declineInvitation(invitationId);
              
              // Update local state
              const updatedInvitations = invitations.map(inv => 
                (inv.id || inv._id) === invitationId 
                  ? { ...inv, status: 'declined', respondedAt: new Date().toISOString() }
                  : inv
              );
              
              setInvitations(updatedInvitations);
              setCachedInvitations(updatedInvitations);
              await saveCachedData(updatedInvitations);
              
              Alert.alert('Invitation Declined', 'You have declined the invitation.');
            } catch (error) {
              console.error('Error declining invitation:', error);
              Alert.alert('Error', 'Failed to decline invitation. Please try again.');
            } finally {
              setProcessingInvitations(prev => {
                const newSet = new Set(prev);
                newSet.delete(invitationId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleViewAllNotifications = () => {
    router.push('/notifications');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'accepted': return '#10B981';
      case 'declined': return '#EF4444';
      case 'expired': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const renderCompactNotificationItem = (invitation: Invitation) => {
    const invitationId = invitation.id || invitation._id;
    const isProcessing = processingInvitations.has(invitationId);
    const isPending = invitation.status === 'pending';
    const isExpanded = expandedNotifications.has(invitationId);
    const animValue = getAnimationValue(invitationId);

    return (
      <View key={invitationId} style={styles.compactNotificationContainer}>
        {/* Compact Header - Always Visible */}
        <TouchableOpacity
          style={[
            styles.compactNotificationHeader,
            isPending && styles.pendingNotificationHeader,
            isExpanded && styles.expandedNotificationHeader
          ]}
          onPress={() => toggleNotificationExpansion(invitationId)}
          activeOpacity={0.7}
        >
          <Image
            source={{
              uri: invitation.eventId.coverImage || 
                   'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80'
            }}
            style={styles.compactEventImage}
          />

          <View style={styles.compactNotificationInfo}>
            <View style={styles.compactHeaderRow}>
              <Text style={styles.compactEventName} numberOfLines={1}>
                {invitation.eventId.name}
              </Text>
              <View style={styles.compactHeaderRight}>
                <View style={[styles.compactStatusBadge, { backgroundColor: getStatusColor(invitation.status) }]}>
                  <Text style={styles.compactStatusText}>{getStatusText(invitation.status)}</Text>
                </View>
                {isExpanded ? (
                  <ChevronUp size={16} color="#64748B" style={styles.chevronIcon} />
                ) : (
                  <ChevronDown size={16} color="#64748B" style={styles.chevronIcon} />
                )}
              </View>
            </View>
            
            <View style={styles.compactSecondRow}>
              <Text style={styles.compactInviterName} numberOfLines={1}>
                by {invitation.inviterId.name}
              </Text>
              <Text style={styles.compactTimeText}>{formatTime(invitation.createdAt)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Content - Animated */}
        <Animated.View
          style={[
            styles.expandedContent,
            {
              maxHeight: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300], // Adjust based on your content height
              }),
              opacity: animValue,
            }
          ]}
        >
          {isExpanded && (
            <View style={styles.expandedInner}>
              {invitation.message && (
                <View style={styles.messageContainer}>
                  <Text style={styles.messageLabel}>Message:</Text>
                  <Text style={styles.messageText}>"{invitation.message}"</Text>
                </View>
              )}
              
              <View style={styles.eventDetailsExpanded}>
                <View style={styles.eventDetailRow}>
                  <Calendar size={16} color="#64748B" />
                  <Text style={styles.eventDetailTextExpanded}>{invitation.eventId.date}</Text>
                </View>
                
                {invitation.eventId.location && (
                  <View style={styles.eventDetailRow}>
                    <MapPin size={16} color="#64748B" />
                    <Text style={styles.eventDetailTextExpanded} numberOfLines={2}>
                      {invitation.eventId.location}
                    </Text>
                  </View>
                )}

                {invitation.eventId.description && (
                  <View style={styles.eventDetailRow}>
                    <Text style={styles.eventDescriptionExpanded} numberOfLines={3}>
                      {invitation.eventId.description}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons for Expanded View */}
              {isPending && (
                <View style={styles.expandedActionButtons}>
                  <TouchableOpacity
                    style={[styles.expandedActionButton, styles.expandedDeclineButton]}
                    onPress={() => handleDeclineInvitation(invitation)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <>
                        <X size={16} color="#EF4444" />
                        <Text style={styles.expandedDeclineText}>Decline</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.expandedActionButton, styles.expandedAcceptButton]}
                    onPress={() => handleAcceptInvitation(invitation)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#10B981" />
                    ) : (
                      <>
                        <Check size={16} color="#10B981" />
                        <Text style={styles.expandedAcceptText}>Accept</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* View Event Button for non-pending invitations */}
              {!isPending && (
                <TouchableOpacity
                  style={styles.expandedViewEventButton}
                  onPress={() => router.push(`/event/${invitation.eventId._id}`)}
                >
                  <Text style={styles.expandedViewEventText}>View Event</Text>
                  <ChevronRight size={16} color="#8B5CF6" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>

        {/* Quick Actions for Compact View - Only for Pending */}
        {isPending && !isExpanded && (
          <View style={styles.compactQuickActions}>
            <TouchableOpacity
              style={styles.compactActionButton}
              onPress={() => handleDeclineInvitation(invitation)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <X size={14} color="#EF4444" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.compactActionButton}
              onPress={() => handleAcceptInvitation(invitation)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <Check size={14} color="#10B981" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && invitations.length === 0) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        {showHeader && !compact && (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Bell size={20} color="#1F2937" />
              <Text style={styles.headerTitle}>Notifications</Text>
            </View>
          </View>
        )}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {showHeader && !compact && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bell size={20} color="#1F2937" />
            <Text style={styles.headerTitle}>Notifications</Text>
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
          {showViewAll && invitations.length > 0 && (
            <TouchableOpacity onPress={handleViewAllNotifications}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {invitations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>
            {!isOnline ? 'Connect to internet to load notifications' : 'You don\'t have any notifications at the moment'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#8B5CF6']}
              tintColor="#8B5CF6"
            />
          }
        >
          {invitations.map(renderCompactNotificationItem)}
          
          {showViewAll && !compact && invitations.length >= (limit || maxItems) && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleViewAllNotifications}
            >
              <Text style={styles.viewAllButtonText}>View All Notifications</Text>
              <ChevronRight size={16} color="#8B5CF6" />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}