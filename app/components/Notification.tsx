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
  AppState,
  AppStateStatus,
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
  Settings,
  BellOff,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  getReceivedInvitations,
  acceptInvitation,
  declineInvitation,
  type Invitation,
} from '../services/invitationService';
import { useNotification } from '../services/NotificationProvider';
import { styles } from '../styles/notificationsStyles';

const STORAGE_KEY = '@notifications_cache';
const EXPANDED_NOTIFICATIONS_KEY = '@expanded_notifications';
const LAST_NOTIFICATION_CHECK_KEY = '@last_notification_check';

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
  const {
    isNotificationEnabled,
    requestPermissions,
    clearAllNotifications,
    badgeCount,
    setBadgeCount,
  } = useNotification();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [cachedInvitations, setCachedInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationCheck, setLastNotificationCheck] = useState<Date | null>(null);
  
  // Animation refs for each notification
  const animationRefs = useRef<Map<string, Animated.Value>>(new Map());
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

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
    loadLastNotificationCheck();
    setupPushNotificationListeners();
    
    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      cleanupPushNotificationListeners();
    };
  }, [userId]);

  // Setup push notification listeners
  const setupPushNotificationListeners = () => {
    // Listen for notifications received while app is running
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );
  };

  // Cleanup push notification listeners
  const cleanupPushNotificationListeners = () => {
    if (notificationListener.current) {
      Notifications.removeNotificationSubscription(notificationListener.current);
    }
    if (responseListener.current) {
      Notifications.removeNotificationSubscription(responseListener.current);
    }
  };

  // Handle notification received while app is running
  const handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('Notification received in component:', notification);
    
    const data = notification.request.content.data;
    
    // If it's an invitation notification, refresh the invitations
    if (data?.type === 'invitation') {
      loadInvitations(true);
      // Update badge count
      setUnreadCount(prev => prev + 1);
      setBadgeCount(badgeCount + 1);
    }
  };

  // Handle notification response (when user taps notification)
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('Notification response in component:', response);
    
    const data = response.notification.request.content.data;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'invitation':
        if (data.invitationId) {
          // Mark as read and navigate
          markNotificationAsRead(data.invitationId);
          router.push('/notifications');
        }
        break;
      case 'media_upload':
        if (data.eventId) {
          router.push(`/event/${data.eventId}`);
        }
        break;
    }
  };

  // Handle app state changes
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // Refresh notifications when app becomes active
      await loadInvitations(true);
      // Update last check time
      const now = new Date();
      setLastNotificationCheck(now);
      await AsyncStorage.setItem(LAST_NOTIFICATION_CHECK_KEY, now.toISOString());
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (invitationId: string) => {
    try {
      // Update local state to mark as read
      const updatedInvitations = invitations.map(inv => 
        (inv.id || inv._id) === invitationId 
          ? { ...inv, isRead: true }
          : inv
      );
      
      setInvitations(updatedInvitations);
      setCachedInvitations(updatedInvitations);
      await saveCachedData(updatedInvitations);
      
      // Update unread count
      const newUnreadCount = updatedInvitations.filter(inv => !inv.isRead).length;
      setUnreadCount(newUnreadCount);
      await setBadgeCount(newUnreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Load cached notifications from AsyncStorage
  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        setCachedInvitations(parsedCache);
        
        // Calculate unread count
        const unread = parsedCache.filter((inv: Invitation) => !inv.isRead).length;
        setUnreadCount(unread);
        
        // If we have cached data and we're loading, show cached data first
        if (isLoading) {
          setInvitations(parsedCache.slice(0, limit || maxItems));
        }
      }
    } catch (error) {
      console.error('Error loading cached notifications:', error);
    }
  };

  // Load last notification check time
  const loadLastNotificationCheck = async () => {
    try {
      const lastCheck = await AsyncStorage.getItem(LAST_NOTIFICATION_CHECK_KEY);
      if (lastCheck) {
        setLastNotificationCheck(new Date(lastCheck));
      }
    } catch (error) {
      console.error('Error loading last notification check:', error);
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

      // Mark notifications as read/unread based on last check
      const processedInvitations = uniqueInvitations.map(inv => {
        const invitationDate = new Date(inv.createdAt);
        const isRead = lastNotificationCheck ? invitationDate <= lastNotificationCheck : false;
        return { ...inv, isRead };
      });

      setInvitations(processedInvitations);
      setCachedInvitations(processedInvitations);
      
      // Calculate unread count
      const unread = processedInvitations.filter(inv => !inv.isRead).length;
      setUnreadCount(unread);
      await setBadgeCount(unread);
      
      // Save to cache
      await saveCachedData(processedInvitations);
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

  // Handle notification settings
  const handleNotificationSettings = async () => {
    if (!isNotificationEnabled) {
      Alert.alert(
        'Push Notifications Disabled',
        'Enable push notifications to receive real-time updates about event invitations and media uploads.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const granted = await requestPermissions();
              if (!granted) {
                Alert.alert(
                  'Permission Required',
                  'Please enable notifications in your device settings to receive updates.'
                );
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Notification Settings',
        'Push notifications are enabled. You can manage notification preferences in your device settings.',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              await clearAllNotifications();
              await setBadgeCount(0);
              setUnreadCount(0);
            }
          }
        ]
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const updatedInvitations = invitations.map(inv => ({ ...inv, isRead: true }));
      setInvitations(updatedInvitations);
      setCachedInvitations(updatedInvitations);
      await saveCachedData(updatedInvitations);
      
      setUnreadCount(0);
      await setBadgeCount(0);
      
      const now = new Date();
      setLastNotificationCheck(now);
      await AsyncStorage.setItem(LAST_NOTIFICATION_CHECK_KEY, now.toISOString());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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
    
    // Mark as read when expanded
    if (!isExpanded) {
      await markNotificationAsRead(invitationId);
    }
    
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
          ? { ...inv, status: 'accepted', respondedAt: new Date().toISOString(), isRead: true }
          : inv
      );
      
      setInvitations(updatedInvitations);
      setCachedInvitations(updatedInvitations);
      await saveCachedData(updatedInvitations);

      // Update unread count
      const newUnreadCount = updatedInvitations.filter(inv => !inv.isRead).length;
      setUnreadCount(newUnreadCount);
      await setBadgeCount(newUnreadCount);

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
                  ? { ...inv, status: 'declined', respondedAt: new Date().toISOString(), isRead: true }
                  : inv
              );
              
              setInvitations(updatedInvitations);
              setCachedInvitations(updatedInvitations);
              await saveCachedData(updatedInvitations);

              // Update unread count
              const newUnreadCount = updatedInvitations.filter(inv => !inv.isRead).length;
              setUnreadCount(newUnreadCount);
              await setBadgeCount(newUnreadCount);
              
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
    const isRead = invitation.isRead;
    const animValue = getAnimationValue(invitationId);

    return (
      <View key={invitationId} style={styles.compactNotificationContainer}>
        {/* Compact Header - Always Visible */}
        <TouchableOpacity
          style={[
            styles.compactNotificationHeader,
            isPending && styles.pendingNotificationHeader,
            isExpanded && styles.expandedNotificationHeader,
            !isRead && styles.unreadNotificationHeader
          ]}
          onPress={() => toggleNotificationExpansion(invitationId)}
          activeOpacity={0.7}
        >
          <View style={styles.notificationImageContainer}>
            <Image
              source={{
                uri: invitation.eventId.coverImage || 
                     'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80'
              }}
              style={styles.compactEventImage}
            />
            {!isRead && <View style={styles.unreadIndicator} />}
          </View>

          <View style={styles.compactNotificationInfo}>
            <View style={styles.compactHeaderRow}>
              <Text style={[styles.compactEventName, !isRead && styles.unreadEventName]} numberOfLines={1}>
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
              <Text style={[styles.compactInviterName, !isRead && styles.unreadInviterName]} numberOfLines={1}>
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
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleNotificationSettings}>
              {isNotificationEnabled ? (
                <Bell size={20} color="#8B5CF6" />
              ) : (
                <BellOff size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
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
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.markAllReadButton}>
                <Text style={styles.markAllReadText}>Mark All Read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleNotificationSettings}>
              {isNotificationEnabled ? (
                <Bell size={20} color="#8B5CF6" />
              ) : (
                <BellOff size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
            {showViewAll && invitations.length > 0 && (
              <TouchableOpacity onPress={handleViewAllNotifications}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {invitations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>
            You'll see event invitations and updates here when they arrive.
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
              tintColor="#8B5CF6"
              colors={['#8B5CF6']}
            />
          }
        >
          {invitations.map((invitation) => renderCompactNotificationItem(invitation))}
          
          {showViewAll && invitations.length >= maxItems && (
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