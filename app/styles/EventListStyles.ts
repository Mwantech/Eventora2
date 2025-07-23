import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Modern Header Styles
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  logoContainer: {
    flex: 1,
  },
  
  appName: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  
  headerActions: {
    alignItems: 'center',
  },
  
  profileButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  // Action Buttons Container
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  
  primaryActionButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  primaryActionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  
  secondaryActionButtonText: {
    color: '#8b5cf6',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  headerSearchContainer: {
    marginTop: 16,
    marginBottom: 16,
    zIndex: 1, // Ensure search stays above other elements
  },

  headerSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  headerSearchInputContainerFocused: {
    backgroundColor: '#ffffff',
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },

  headerSearchIcon: {
    marginRight: 8,
  },

  headerSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4, // Better cross-platform padding
    paddingHorizontal: 8,
    includeFontPadding: false, // Prevent extra padding on Android
    textAlignVertical: 'center', // Better vertical alignment
  },

  headerSearchClearButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginLeft: 4, // Add some spacing from the input
  },
  
  searchSuggestionsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: -8,
    borderRadius: 16,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  searchSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  searchSuggestionContent: {
    flex: 1,
  },

  searchSuggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },

  searchSuggestionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },

  searchSuggestionMeta: {
    flexDirection: 'row',
    gap: 12,
  },

  searchSuggestionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },

  searchSuggestionParticipants: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },

  searchSuggestionArrow: {
    marginLeft: 12,
  },

  searchSuggestionArrowText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },

  // Search Results Header
  searchResultsHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginTop: 8,
  },

  searchResultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Popular Events Header
  popularEventsHeader: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },

  popularEventsHeaderText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Clear Search Button
  clearSearchButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  clearSearchButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Enhanced Filter Tabs Styles with Popular Tab
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 2,
    transition: 'all 0.2s ease',
  },
  
  activeFilterTab: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  // Special styling for Popular tab
  popularFilterTab: {
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
  },

  filterTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.2,
  },
  
  activeFilterText: {
    color: '#ffffff',
    fontWeight: '700',
  },

  popularFilterText: {
    fontSize: 12,
  },
  
  // Content Styles
  contentContainer: {
    flex: 1,
    marginTop: 16,
  },
  
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Extra padding for floating button
  },
  
  // Floating Feedback Button
  floatingFeedbackButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  
  // Error Styles
  errorContainer: {
    margin: 24,
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  
  errorText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 22,
  },
  
  retryButton: {
    backgroundColor: '#fecaca',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  retryButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  loadingText: {
    marginTop: 16,
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  
  createButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Feedback Modal Styles - Enhanced
  feedbackModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  feedbackModalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  
  feedbackModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 28,
  },
  
  feedbackModalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  
  feedbackCloseButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  feedbackTypeContainer: {
    marginBottom: 28,
  },
  
  feedbackTypeLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  
  feedbackTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  feedbackTypeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  
  feedbackTypeButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  
  feedbackTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.2,
  },
  
  feedbackTypeButtonTextActive: {
    color: '#8b5cf6',
  },
  
  feedbackTextContainer: {
    flex: 1,
    marginBottom: 28,
  },
  
  feedbackTextLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  
  feedbackTextInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    minHeight: 140,
    textAlignVertical: 'top',
  },
  
  feedbackSubmitButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  feedbackSubmitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  feedbackSubmitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Additional Modern Touches
  sectionDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
  },
  
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  
  modernButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  
  modernButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  modernButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  modernButtonSecondaryText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Utility Styles
  textPrimary: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  
  textSecondary: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  
  textMuted: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '400',
  },
  
  // Card Variations
  cardElevated: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  
  cardFlat: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  
  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  
  textInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  
  textInputFocused: {
    borderColor: '#8b5cf6',
    backgroundColor: '#ffffff',
  },
  
  // Badge Styles
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  
  badgePrimary: {
    backgroundColor: '#ede9fe',
  },
  
  badgeSuccess: {
    backgroundColor: '#d1fae5',
  },
  
  badgeWarning: {
    backgroundColor: '#fef3c7',
  },
  
  badgeDanger: {
    backgroundColor: '#fecaca',
  },
  
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  
  badgeTextPrimary: {
    color: '#7c3aed',
  },
  
  badgeTextSuccess: {
    color: '#059669',
  },
  
  badgeTextWarning: {
    color: '#d97706',
  },
  
  badgeTextDanger: {
    color: '#dc2626',
  },
  
  // Animation Helpers
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0,
  },
  
  // Responsive Helpers
  fullWidth: {
    width: '100%',
  },
  
  halfWidth: {
    width: '50%',
  },
  
  // Spacing Utilities
  marginSmall: {
    margin: 8,
  },
  
  marginMedium: {
    margin: 16,
  },
  
  marginLarge: {
    margin: 24,
  },
  
  paddingSmall: {
    padding: 8,
  },
  
  paddingMedium: {
    padding: 16,
  },
  
  paddingLarge: {
    padding: 24,
  },
});