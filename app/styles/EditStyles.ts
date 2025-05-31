import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const editStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background like upload styles
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
  
  backButton: {
    marginRight: 16,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', // Black text like upload styles
  },
  
  scrollContainer: {
    flex: 1,
    padding: 16,
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
  
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  errorButton: {
    backgroundColor: '#8b5cf6', // Purple like upload styles
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  
  errorButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // Form sections
  formSection: {
    marginBottom: 16,
  },
  
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000', // Black text like upload styles
    fontSize: 16,
  },
  
  requiredLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000', // Black text
    fontSize: 16,
  },
  
  // Cover Image
  coverImageContainer: {
    marginBottom: 16,
  },
  
  coverImageButton: {
    height: 160,
    backgroundColor: '#f8fafc', // Light gray background like upload styles
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8b5cf6', // Purple border
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  coverImage: {
    width: '100%',
    height: '100%',
  },
  
  uploadPlaceholder: {
    alignItems: 'center',
  },
  
  uploadText: {
    color: '#8b5cf6', // Purple text like upload styles
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Text Inputs
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db', // Gray border like upload styles
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000', // Black text
    backgroundColor: '#ffffff', // White background
    minHeight: 50,
  },
  
  textInputMultiline: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    height: 80,
    textAlignVertical: 'top',
  },
  
  textInputFocused: {
    borderColor: '#8b5cf6', // Purple focus border
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Date and Time Buttons
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    minHeight: 50,
  },
  
  dateTimeButtonPressed: {
    backgroundColor: '#f8fafc',
    borderColor: '#8b5cf6',
  },
  
  dateTimeText: {
    color: '#000000',
    fontSize: 16,
    marginLeft: 12,
  },
  
  dateTimePlaceholder: {
    color: '#6b7280', // Gray placeholder text like upload styles
    fontSize: 16,
    marginLeft: 12,
  },
  
  // Location Input
  locationContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    minHeight: 50,
  },
  
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  
  // Privacy Switch
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', // Light gray background like upload styles
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6', // Purple left border like upload styles
    marginBottom: 16,
  },
  
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  
  // Save Button
  saveButton: {
    backgroundColor: '#000000', // Black background like upload styles
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  saveButtonDisabled: {
    backgroundColor: '#9ca3af', // Gray when disabled like upload styles
  },
  
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Additional utility styles
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

// Export responsive breakpoints separately
export const screenBreakpoints = {
  isSmallScreen: width < 375,
  isMediumScreen: width >= 375 && width < 414,
  isLargeScreen: width >= 414,
};

// Export icon colors separately
export const iconColors = {
  primary: '#6b7280', // Gray icons like upload styles
  secondary: '#8b5cf6', // Purple icons
  accent: '#000000', // Black accent
};