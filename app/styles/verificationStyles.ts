import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const verificationStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9fc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9fc',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoImage: {
    width: 120,
    height: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeInputFocused: {
    borderColor: '#8A2BE2',
    backgroundColor: '#fff',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  codeInputError: {
    borderColor: '#ff3b30',
    backgroundColor: '#fff5f5',
  },
  verifyButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e5e9',
    marginVertical: 24,
  },
  actionsContainer: {
    alignItems: 'center',
    gap: 16,
  },
  resendLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonText: {
  color: '#8A2BE2', // Purple
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},

resendButtonTextDisabled: {
  color: '#B39DDB', // lighter purple for disabled
  fontSize: 16,
  fontWeight: '500',
  textAlign: 'center',
},
  backButton: {
    marginTop: 8,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  backButtonLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default verificationStyles;