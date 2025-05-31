import { StyleSheet } from 'react-native';

export const uploadStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20, // Safe area padding for top spacing
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  
  headerButton: {
    marginRight: 16,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  
  eventInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  
  eventTitle: {
    fontWeight: 'bold',
    color: '#000000',
    fontSize: 16,
  },
  
  eventSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  
  // Updated media container styles (renamed from selectedImagesContainer)
  selectedMediaContainer: {
    marginBottom: 16,
  },
  
  selectedMediaTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
    fontSize: 16,
  },
  
  // Updated media scroll container (renamed from imageScrollContainer)
  mediaScrollContainer: {
    flexDirection: 'row',
  },
  
  // Updated media item styles (renamed from imageItem)
  mediaItem: {
    marginRight: 8,
    position: 'relative',
  },
  
  // Updated selected media styles (renamed from selectedImage)
  selectedMedia: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  
  // Video specific styles
  videoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Updated remove media button (renamed from removeImageButton)
  removeMediaButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 4,
  },
  
  // Keep old styles for backward compatibility
  selectedImagesContainer: {
    marginBottom: 16,
  },
  
  selectedImagesTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
    fontSize: 16,
  },
  
  imageScrollContainer: {
    flexDirection: 'row',
  },
  
  imageItem: {
    marginRight: 8,
    position: 'relative',
  },
  
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  
  removeImageButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 4,
  },
  
  uploadOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  
  uploadOption: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    minWidth: 90,
    flex: 1,
    maxWidth: 110,
  },
  
  uploadOptionText: {
    marginTop: 6,
    color: '#8b5cf6',
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center',
  },
  
  inputSection: {
    marginBottom: 16,
  },
  
  inputLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
    fontSize: 16,
  },
  
  captionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  
  tagButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  tagItem: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  
  tagText: {
    color: '#8b5cf6',
    marginRight: 4,
    fontWeight: '500',
  },
  
  uploadButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  
  uploadButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  uploadButtonEnabled: {
    backgroundColor: '#000000',
  },
  
  uploadButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  uploadButtonTextWithIcon: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    paddingTop: 50,
  },
  
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  errorButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  
  errorButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});