import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color palette
export const colors = {
  // Purple shades
  primary: '#8B5CF6', // Vibrant purple
  primaryDark: '#7C3AED', // Darker purple
  primaryLight: '#A78BFA', // Lighter purple
  primaryUltraLight: '#F3F4F6', // Very light purple background
  
  // Accent colors
  secondary: '#EC4899', // Pink accent
  accent: '#10B981', // Green accent for success
  warning: '#F59E0B', // Amber for warnings
  danger: '#EF4444', // Red for errors
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Background gradients
  gradientStart: '#8B5CF6',
  gradientEnd: '#EC4899',
  
  // Card backgrounds
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(139, 92, 246, 0.1)',
};

// Typography
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.gray[900],
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.gray[800],
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.gray[800],
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.gray[700],
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.gray[600],
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.gray[500],
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const shadows = {
  small: {
    shadowColor: colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Common styles
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    paddingTop: 50, // Safe area top margin for mobile screens
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 50,
  },
  
  // Headers
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  
  headerTitle: {
    ...typography.h2,
    marginLeft: spacing.sm,
  },
  
  // Cards
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  
  primaryButtonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  
  secondaryButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  buttonText: {
    ...typography.button,
  },
  
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  
  // Form elements
  formGroup: {
    marginBottom: spacing.md,
  },
  
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.gray[800],
    backgroundColor: colors.white,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  textArea: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.gray[800],
    backgroundColor: colors.white,
    height: 96,
    textAlignVertical: 'top',
  },
  
  // Image upload
  imageUploadContainer: {
    height: 160,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  
  imageUploadContent: {
    alignItems: 'center',
  },
  
  imageUploadText: {
    ...typography.bodySmall,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  
  // Privacy toggle
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  
  privacyLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray[800],
  },
  
  // Event card specific styles
  eventImage: {
    width: '100%',
    height: 160,
  },
  
  eventCardContent: {
    padding: spacing.md,
  },
  
  eventTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  
  eventDetailText: {
    ...typography.bodySmall,
    marginLeft: spacing.xs,
  },
  
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  privacyBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  
  privacyBadgeText: {
    ...typography.caption,
    color: colors.gray[700],
    fontWeight: '600',
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  
  errorTitle: {
    ...typography.h3,
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  // Scroll view
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  
  // Back button
  backButton: {
    marginRight: spacing.sm,
  },
  
  // Utility classes
  flexRow: {
    flexDirection: 'row',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  marginBottom: {
    marginBottom: spacing.md,
  },
});

// Gradient styles (for libraries that support gradients)
export const gradientStyles = {
  primaryGradient: {
    colors: [colors.gradientStart, colors.gradientEnd],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
  gradientStyles,
};