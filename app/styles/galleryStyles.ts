import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const galleryStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
    paddingTop: 50, // Safe area padding from top
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff', // White background
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#f3f4f6', // Light gray
  },
  
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937', // Dark gray/black
    letterSpacing: -0.5,
  },
  
  filterButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#8b5cf6', // Purple
  },
  
  // Filter chips container
  filterChipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff', // White background
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  filterChipsScrollView: {
    flexGrow: 0,
  },
  
  // Fixed width filter buttons
  filterChip: {
    width: 85, // Fixed width
    height: 36, // Fixed height
    marginRight: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  
  filterChipActive: {
    backgroundColor: '#8b5cf6', // Purple
    borderColor: '#7c3aed', // Darker purple
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  filterChipInactive: {
    backgroundColor: '#ffffff', // White
    borderColor: '#d1d5db', // Light gray
  },
  
  filterChipTextActive: {
    color: '#ffffff', // White text
    fontSize: 14,
    fontWeight: '600',
  },
  
  filterChipTextInactive: {
    color: '#6b7280', // Gray text
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Sort section
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff', // White background
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  sortLabel: {
    color: '#6b7280', // Gray
    fontSize: 14,
    fontWeight: '500',
    marginRight: 16,
  },
  
  sortOption: {
    marginRight: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  
  sortOptionActive: {
    backgroundColor: '#f3e8ff', // Light purple
  },
  
  sortTextActive: {
    color: '#7c3aed', // Purple
    fontSize: 14,
    fontWeight: '600',
  },
  
  sortTextInactive: {
    color: '#6b7280', // Gray
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Media grid
  mediaGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#ffffff', // White background
  },
  
  mediaItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9fafb', // Very light gray
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black with transparency
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  
  videoIndicatorText: {
    color: '#ffffff', // White text
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  
  emptyStateText: {
    color: '#6b7280', // Gray
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Floating action button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8b5cf6', // Purple
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  fabText: {
    color: '#ffffff', // White text
    fontSize: 24,
    fontWeight: '300',
  },
  
  // Media viewer modal
  mediaViewerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000', // Black background
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.8)', // Purple with transparency
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mediaViewerCloseText: {
    color: '#ffffff', // White text
    fontSize: 18,
    fontWeight: '500',
  },
  
  mediaViewerCounter: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)', // Purple with transparency
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  mediaViewerCounterText: {
    color: '#ffffff', // White text
    fontSize: 14,
    fontWeight: '500',
  },
  
  mediaSlide: {
  width: screenWidth,
  flex: 1, // Use flex instead of fixed height
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 10, // Reduce horizontal padding
},

// Update swipeableMediaContainer to account for header and info panel
swipeableMediaContainer: {
  flex: 1,
  justifyContent: 'center',
  paddingTop: 100, // Space for header
  paddingBottom: 200, // Space for info panel
},

// Update fullMediaImage to ensure it displays properly
fullMediaImage: {
  width: screenWidth - 20, // Account for padding
  height: undefined, // Let height be calculated automatically
  aspectRatio: 1, // Maintain aspect ratio, adjust as needed
  maxHeight: screenHeight * 0.5, // Limit max height
  borderRadius: 12,
  resizeMode: 'contain', // Make sure this is contain, not cover
},

// Keep fullMediaVideo as is but ensure proper sizing
fullMediaVideo: {
  width: screenWidth - 20, // Account for padding
  height: screenHeight * 0.4, // Reasonable height for videos
  borderRadius: 12,
},

// Limit the info panel height
mediaInfoPanel: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  paddingHorizontal: 20,
  paddingVertical: 20,
  paddingBottom: 40,
  maxHeight: 180, // Limit the height of the info panel
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
  },
  
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#8b5cf6', // Purple
  },
  
  userName: {
    color: '#ffffff', // White text
    fontSize: 16,
    fontWeight: '600',
  },
  
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  timeText: {
    color: '#d1d5db', // Light gray
    fontSize: 12,
    marginLeft: 4,
  },
  
  mediaCaption: {
    color: '#ffffff', // White text
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  
  tag: {
    backgroundColor: 'rgba(139, 92, 246, 0.6)', // Purple with transparency
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  
  tagText: {
    color: '#ffffff', // White text
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Action buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  
  actionButton: {
    alignItems: 'center',
    minWidth: 60,
  },
  
  actionButtonText: {
    color: '#ffffff', // White text
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  
  actionButtonTextDelete: {
    color: '#ef4444', // Red for delete
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  
  likeCount: {
    color: '#ffffff', // White text
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Filter modal
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
    backgroundColor: '#ffffff', // White background
    borderRadius: 20,
    width: screenWidth * 0.85,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937', // Dark gray/black
    marginBottom: 20,
  },
  
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151', // Dark gray
    marginBottom: 12,
  },
  
  modalButtonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 12,
  },
  
  modalButtonCancel: {
    backgroundColor: '#f3f4f6', // Light gray
  },
  
  modalButtonApply: {
    backgroundColor: '#8b5cf6', // Purple
  },
  
  modalButtonTextCancel: {
    color: '#6b7280', // Gray
    fontSize: 14,
    fontWeight: '600',
  },
  
  modalButtonTextApply: {
    color: '#ffffff', // White text
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background
    paddingHorizontal: 20,
  },
  
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444', // Red
    marginBottom: 8,
    textAlign: 'center',
  },
  
  errorButton: {
    backgroundColor: '#8b5cf6', // Purple
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  
  errorButtonText: {
    color: '#ffffff', // White text
    fontSize: 16,
    fontWeight: '600',
  },

  // Video thumbnail container and overlay
  videoThumbnailContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },

  videoPlayOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Full media video player
  fullMediaVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});