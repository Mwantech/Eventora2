import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color palette - Purple, Black, and White theme
export const colors = {
  // Primary colors
  primary: '#8B35C9',         // Main purple
  primaryDark: '#6B2A9D',     // Darker purple
  primaryLight: '#A855F7',    // Lighter purple
  
  // Background colors
  background: '#FFFFFF',      // White background
  backgroundSecondary: '#F8F9FA', // Light gray background
  backgroundDark: '#1A1A1A',  // Dark background for contrast
  
  // Text colors
  text: '#1A1A1A',           // Primary text (dark)
  textLight: '#FFFFFF',      // Light text for dark backgrounds
  textSecondary: '#6B7280',  // Secondary text (gray)
  textMuted: '#9CA3AF',      // Muted text
  
  // Status colors
  success: '#10B981',        // Success green
  error: '#EF4444',          // Error red
  warning: '#F59E0B',        // Warning amber
  
  // Border and separator colors
  border: '#E5E7EB',         // Light border
  borderDark: '#374151',     // Dark border
  separator: '#F3F4F6',      // Separator line
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
  
  // Purple variations for different states
  purpleOpacity10: 'rgba(139, 53, 201, 0.1)',
  purpleOpacity20: 'rgba(139, 53, 201, 0.2)',
  purpleOpacity30: 'rgba(139, 53, 201, 0.3)',
};

export const editProfileStyles = StyleSheet.create({
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
    paddingHorizontal: 20,
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  
  saveButtonDisabled: {
    backgroundColor: colors.backgroundSecondary,
  },
  
  saveButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },

  // Content styles
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Profile image section
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.separator,
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    shadowColor: colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    shadowColor: colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  changePhotoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },

  // Form section
  formSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  
  fieldContainer: {
    marginBottom: 24,
  },
  
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  
  inputContainerError: {
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  
  inputContainerDisabled: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.separator,
  },
  
  inputIcon: {
    marginRight: 12,
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 4,
    fontWeight: '400',
  },
  
  textInputDisabled: {
    color: colors.textSecondary,
  },
  
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  
  fieldNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    marginLeft: 4,
    lineHeight: 16,
  },

  // Password section
  passwordSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },
  
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  
  changePasswordButtonDisabled: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 8,
  },
  
  changePasswordButtonTextDisabled: {
    color: colors.textSecondary,
  },

  // Save section (mobile-friendly)
  saveSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  primarySaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  primarySaveButtonDisabled: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  primarySaveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 8,
  },
  
  primarySaveButtonTextDisabled: {
    color: colors.textSecondary,
  },
  
  discardButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  
  discardButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
  },

  // Additional utility styles
  spacer: {
    height: 16,
  },
  
  largeSpacer: {
    height: 32,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  
  // Responsive adjustments for smaller screens
  compactFieldContainer: {
    marginBottom: 16,
  },
  
  compactInputContainer: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  
  compactText: {
    fontSize: 14,
  },
  
  // Focus states
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.purpleOpacity10,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Success states
  inputContainerSuccess: {
    borderColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  
  successText: {
    fontSize: 14,
    color: colors.success,
    marginTop: 6,
    marginLeft: 4,
  },

  // Animation states
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0.5,
  },
  
  // Accessibility improvements
  accessibilityLabel: {
    fontSize: 0, // Hide from visual display but keep for screen readers
    position: 'absolute',
    left: -10000,
  },
  
  // Platform-specific adjustments
  iosSpecific: {
    paddingTop: 44, // iOS status bar height
  },
  
  androidSpecific: {
    paddingTop: 24, // Android status bar height
  },
});