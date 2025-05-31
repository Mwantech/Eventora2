import { StyleSheet } from 'react-native';

// Color palette
const colors = {
  primary: '#8B35C9', // Purple
  primaryDark: '#6B21A8', // Darker purple
  primaryLight: '#A855F7', // Lighter purple
  accent: '#000000', // Black
  background: '#FFFFFF', // White
  surface: '#F8FAFC', // Light gray/white
  text: '#000000', // Black text
  textSecondary: '#6B7280', // Gray text
  textLight: '#FFFFFF', // White text
  border: '#E5E7EB', // Light gray border
  error: '#EF4444', // Red for logout
  overlay: 'rgba(139, 53, 201, 0.1)', // Purple overlay
};

export const profileStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
  },

  // Header styles
  header: {
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  backButton: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButtonText: {
    color: colors.textLight,
    marginLeft: 4,
    fontSize: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: 'bold',
  },

  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },

  // Profile info styles
  profileSection: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },

  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },

  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
  },

  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: colors.background,
  },

  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text,
  },

  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  emailText: {
    color: colors.textSecondary,
    marginLeft: 4,
    fontSize: 16,
  },

  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  editProfileText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 16,
  },

  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },

  statLabel: {
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 14,
  },

  // Recent activity styles
  activitySection: {
    padding: 16,
    backgroundColor: colors.background,
  },

  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },

  activityPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  activityPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 16,
  },

  // Button styles
  logoutSection: {
    padding: 16,
    backgroundColor: colors.background,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 12,
  },

  logoutButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },

  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  signInButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },

  notFoundText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  // Add these styles to your existing profileStyles StyleSheet.create({...}) object:

// Modal styles
modalContainer: {
  flex: 1,
  backgroundColor: colors.background,
},

modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  backgroundColor: colors.background,
},

modalCloseButton: {
  padding: 8,
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: colors.text,
},

modalSaveButton: {
  padding: 8,
},

modalContent: {
  flex: 1,
  paddingHorizontal: 16,
  paddingTop: 16,
},

modalImageSection: {
  alignItems: 'center',
  marginBottom: 24,
},

modalSectionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: colors.text,
  marginBottom: 8,
  alignSelf: 'flex-start',
  width: '100%',
},

modalImageContainer: {
  position: 'relative',
  marginTop: 8,
},

modalProfileImage: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.surface,
  borderWidth: 2,
  borderColor: colors.primary,
},

modalCameraButton: {
  position: 'absolute',
  bottom: -4,
  right: -4,
  backgroundColor: colors.primary,
  borderRadius: 16,
  padding: 6,
  borderWidth: 2,
  borderColor: colors.background,
},

modalInputSection: {
  marginBottom: 20,
},

modalTextInput: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  color: colors.text,
  backgroundColor: colors.background,
},

modalEmailContainer: {
  backgroundColor: colors.surface,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderWidth: 1,
  borderColor: colors.border,
},

modalEmailText: {
  fontSize: 16,
  color: colors.textSecondary,
  marginBottom: 4,
},

modalEmailNote: {
  fontSize: 12,
  color: colors.textSecondary,
  fontStyle: 'italic',
},
modalTextInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  
  modalErrorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  
  modalImageNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Loading states
  statsLoadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Refresh control
  refreshControlContainer: {
    flex: 1,
  },
  
  // Profile image container improvements
  profileImageError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  
  // Button disabled states
  buttonDisabled: {
    opacity: 0.5,
  },
  
  // Activity indicator colors
  activityIndicatorPrimary: {
    color: colors.primary,
  },
  
  activityIndicatorSecondary: {
    color: colors.textSecondary,
  },
});

// Export colors for use in components
export { colors };