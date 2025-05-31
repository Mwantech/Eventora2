import { StyleSheet } from 'react-native';

// Color palette - matching the profile styles
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
  inputBackground: '#FFFFFF', // White input background
  placeholder: '#9CA3AF', // Placeholder text color
  overlay: 'rgba(139, 53, 201, 0.1)', // Purple overlay
  disabled: 'rgba(139, 53, 201, 0.7)', // Disabled state
};

export const eventCreationStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },

  innerContainer: {
    flex: 1,
    backgroundColor: colors.background,
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

  headerTitle: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Scroll view styles
  scrollView: {
    flex: 1,
    padding: 16,
  },

  // Cover image styles
  coverImageContainer: {
    height: 192,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },

  coverImage: {
    width: '100%',
    height: '100%',
  },

  coverImagePlaceholder: {
    alignItems: 'center',
  },

  coverImagePlaceholderText: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },

  // Form field styles
  fieldContainer: {
    marginBottom: 16,
  },

  fieldLabel: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 16,
  },

  requiredAsterisk: {
    color: colors.primary,
  },

  // Input styles
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.inputBackground,
    color: colors.text,
  },

  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.inputBackground,
  },

  inputWithIconText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },

  multilineInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },

  // Privacy toggle styles
  privacyContainer: {
    marginBottom: 24,
  },

  privacyTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },

  privacyToggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },

  privacyToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },

  privacyToggleButtonActive: {
    backgroundColor: colors.primary,
  },

  privacyToggleButtonInactive: {
    backgroundColor: colors.surface,
  },

  privacyToggleText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '500',
  },

  privacyToggleTextActive: {
    color: colors.textLight,
  },

  privacyToggleTextInactive: {
    color: colors.text,
  },

  // Button styles
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },

  createButtonDisabled: {
    backgroundColor: colors.disabled,
  },

  createButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Loading indicator
  loadingIndicator: {
    color: colors.textLight,
  },
});

// Export colors for use in components
export { colors };