import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const galleryStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header styles - Updated to match the gradient design
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  
  headerGradient: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  headerTitleContainer: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statsButton: {
    padding: 10,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  filterButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Filter chips container - Enhanced design
  filterChipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  
  filterChipsScrollView: {
    flexGrow: 0,
  },
  
  filterChip: {
    marginRight: 12,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
  },
  
  filterChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  filterChipActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#4f46e5',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  filterChipInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  
  filterChipTextActive: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  filterChipTextInactive: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  
  filterChipBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  
  filterChipBadgeInactive: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  
  filterChipBadgeTextActive: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  filterChipBadgeTextInactive: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Sort section - Enhanced styling
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  
  sortLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 16,
  },
  
  sortOption: {
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  sortOptionActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
  },
  
  sortTextActive: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  
  sortTextInactive: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Media grid - Improved spacing and visual hierarchy
  mediaGrid: {
    paddingHorizontal: 12,
    paddingTop: 16,
    backgroundColor: '#f8fafc',
  },
  
  mediaItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  mediaItemTouchable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  
  // Video specific styles
  videoThumbnailContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  
  videoPlayOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mediaTypeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  
  mediaGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.6))',
  },
  
  likeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 64, 129, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  
  likeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  
  mediaUserInfo: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  
  miniUserAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
    minHeight: 300,
  },
  
  emptyStateText: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  
  // Floating action button - Enhanced with animation support
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  
  fabText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  
  // Media viewer modal - Full screen experience
  mediaViewerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  
  mediaViewerHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1001,
  },
  
  mediaViewerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  mediaViewerCloseText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
  
  mediaViewerCounter: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  mediaViewerCounterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Media slide container
  mediaSlide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  
  swipeableMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 120,
    paddingBottom: 220,
  },
  
  fullMediaImage: {
    width: screenWidth - 20,
    height: undefined,
    aspectRatio: 1,
    maxHeight: screenHeight * 0.6,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  
  fullMediaVideo: {
    width: screenWidth - 20,
    height: screenHeight * 0.5,
    borderRadius: 12,
  },
  
  // Media info panel - Enhanced design
  mediaInfoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  
  mediaInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#8b5cf6',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  
  userName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  timeText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginLeft: 4,
  },
  
  mediaCaption: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  
  tag: {
    backgroundColor: 'rgba(99, 102, 241, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  
  tagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Action buttons - Enhanced interaction design
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
  
  actionButton: {
    alignItems: 'center',
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  
  actionButtonLiked: {
    backgroundColor: 'rgba(255, 64, 129, 0.2)',
  },
  
  actionButtonDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  
  actionButtonTextLiked: {
    color: '#ff4081',
  },
  
  actionButtonTextDelete: {
    color: '#ef4444',
  },
  
  // Stats modal
  statsModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: screenWidth * 0.9,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  statsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  statsModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  
  statsModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  statsModalCloseText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Filter modal - Enhanced design
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: screenWidth * 0.9,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
    marginTop: 8,
  },
  
  modalButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginLeft: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  
  modalButtonCancel: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  
  modalButtonApply: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  modalButtonTextCancel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  
  modalButtonTextApply: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  
  loadingContent: {
    alignItems: 'center',
    padding: 32,
  },
  
  loadingText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 32,
  },
  
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  errorButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  errorButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});