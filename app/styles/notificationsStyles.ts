import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Base container styles
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  compactContainer: {
    backgroundColor: 'transparent',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },

  offlineIndicator: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },

  offlineText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },

  viewAllText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Scroll view
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Compact notification container
  compactNotificationContainer: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },

  // Compact notification header (always visible)
  compactNotificationHeader: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },

  pendingNotificationHeader: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  expandedNotificationHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  compactEventImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },

  compactNotificationInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  compactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  compactEventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },

  compactHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  compactStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },

  compactStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  chevronIcon: {
    marginLeft: 4,
  },

  compactSecondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  compactInviterName: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },

  compactTimeText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Quick actions for compact view
  compactQuickActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },

  compactActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Expanded content styles
  expandedContent: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  expandedInner: {
    padding: 16,
    paddingTop: 0,
  },

  // Message section
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },

  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },

  messageText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Event details in expanded view
  eventDetailsExpanded: {
    marginBottom: 16,
  },

  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  eventDetailTextExpanded: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },

  eventDescriptionExpanded: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
  },

  // Expanded action buttons
  expandedActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  expandedActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },

  expandedDeclineButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  expandedDeclineText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },

  expandedAcceptButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  expandedAcceptText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },

  // View event button for non-pending invitations
  expandedViewEventButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    gap: 6,
  },

  expandedViewEventText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },

  // View all button at bottom
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },

  viewAllButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },

  // Additional responsive styles
  '@media (max-width: 375)': {
    compactEventName: {
      fontSize: 14,
    },
    compactInviterName: {
      fontSize: 11,
    },
    compactTimeText: {
      fontSize: 9,
    },
  },

  // Dark mode support (optional)
  darkContainer: {
    backgroundColor: '#1F2937',
  },

  darkHeader: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },

  darkHeaderTitle: {
    color: '#F9FAFB',
  },

  darkNotificationContainer: {
    backgroundColor: '#374151',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },

  darkNotificationHeader: {
    backgroundColor: '#374151',
  },

  darkEventName: {
    color: '#F9FAFB',
  },

  darkInviterName: {
    color: '#9CA3AF',
  },

  darkTimeText: {
    color: '#6B7280',
  },

  darkMessageContainer: {
    backgroundColor: '#1F2937',
    borderLeftColor: '#8B5CF6',
  },

  darkMessageText: {
    color: '#D1D5DB',
  },

  darkEventDetailText: {
    color: '#E5E7EB',
  },

  darkEventDescription: {
    color: '#9CA3AF',
  },
});