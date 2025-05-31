import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const EventScreenStyles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 44, // Safe area padding for status bar
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6', // Purple
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Header with Back Button
  headerContainer: {
    position: 'absolute',
    top: 54, // Adjusted for safe area
    left: 16,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backdropFilter: 'blur(10px)',
  },

  // Cover Image
  coverImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#F3F4F6',
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '700',
  },

  // Content Container
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Event Details
  detailsContainer: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 36,
  },

  // Info Row Styles
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },

  // Badge Container
  badgeContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#F3E8FF', // Light purple
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  badgeText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },

  // Creator Info
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  creatorAvatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
  },
  creatorAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  creatorInfo: {
    marginLeft: 16,
    flex: 1,
  },
  creatorLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Description Section
  descriptionContainer: {
    marginBottom: 32,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 52,
  },
  joinButton: {
    backgroundColor: '#8B5CF6',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  editButton: {
    backgroundColor: '#1F2937',
    shadowColor: '#1F2937',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },

  // Share Button
  shareButton: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 52,
  },

  // Modern Gradient Overlay (for future use)
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // Typography Variants
  heading1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 40,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 20,
  },

  // Color Variants
  textPrimary: {
    color: '#1F2937',
  },
  textSecondary: {
    color: '#6B7280',
  },
  textPurple: {
    color: '#8B5CF6',
  },
  textWhite: {
    color: '#FFFFFF',
  },

  // Background Variants
  bgPrimary: {
    backgroundColor: '#FFFFFF',
  },
  bgSecondary: {
    backgroundColor: '#FAFAFA',
  },
  bgPurple: {
    backgroundColor: '#8B5CF6',
  },
  bgBlack: {
    backgroundColor: '#1F2937',
  },

  // Spacing Utilities
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mt32: { marginTop: 32 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mb32: { marginBottom: 32 },
  mx16: { marginHorizontal: 16 },
  mx20: { marginHorizontal: 20 },
  px16: { paddingHorizontal: 16 },
  px20: { paddingHorizontal: 20 },
  py8: { paddingVertical: 8 },
  py12: { paddingVertical: 12 },
  py16: { paddingVertical: 16 },

  // Modern Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  // Animated Elements (for future enhancement)
  fadeIn: {
    opacity: 1,
  },
  slideUp: {
    transform: [{ translateY: 0 }],
  },
});