import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  useColorScheme,
} from "react-native";
import { getAuthStyles } from "../../styles/authStyles";

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onLoginPress: () => void;
  onTermsPress: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// Password strength checking function
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  let strength = 'weak';
  let color = '#ff4c4c';
  let percentage = 0;

  if (passedChecks >= 5) {
    strength = 'very strong';
    color = '#4caf50';
    percentage = 100;
  } else if (passedChecks >= 4) {
    strength = 'strong';
    color = '#8bc34a';
    percentage = 80;
  } else if (passedChecks >= 3) {
    strength = 'moderate';
    color = '#ffc107';
    percentage = 60;
  } else if (passedChecks >= 2) {
    strength = 'fair';
    color = '#ff9800';
    percentage = 40;
  } else if (passedChecks >= 1) {
    strength = 'weak';
    color = '#ff5722';
    percentage = 20;
  }

  return { checks, strength, color, percentage, score: passedChecks };
};

export default function Register({
  onRegister,
  onLoginPress,
  onTermsPress,
  isLoading = false,
  error = null,
}: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  const authStyles = getAuthStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Check password strength in real-time
  useEffect(() => {
    if (password.length > 0) {
      const strength = checkPasswordStrength(password);
      setPasswordStrength(strength);
      setShowPasswordStrength(true);
    } else {
      setShowPasswordStrength(false);
      setPasswordStrength(null);
    }
  }, [password]);

  // Check if passwords match
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [password, confirmPassword]);

  const validateForm = () => {
    if (!name.trim()) {
      setLocalError("Name is required");
      return false;
    }
    if (!email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!password.trim()) {
      setLocalError("Password is required");
      return false;
    }
    if (passwordStrength && passwordStrength.score < 3) {
      setLocalError("Password is too weak. Please create a stronger password.");
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }
    if (!acceptedTerms) {
      setLocalError("You must accept the Terms and Conditions");
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      try {
        await onRegister(name, email, password);
      } catch (err) {
        // Error is handled by parent component
      }
    }
  };

  const handleTermsCheckboxPress = () => {
    setAcceptedTerms(!acceptedTerms);
  };

  const isFormValid = () => {
    return name.trim() && 
           email.trim() && 
           password.trim() && 
           confirmPassword.trim() &&
           passwordStrength && 
           passwordStrength.score >= 3 &&
           passwordsMatch &&
           acceptedTerms;
  };

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#1a1a1a" : "#f9f9fc"} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
        >
          <View style={authStyles.logoContainer}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={authStyles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={authStyles.headerContainer}>
            <Text style={authStyles.subtitle}>Create your account</Text>
          </View>

          <View style={authStyles.formCard}>
            {(error || localError) && (
              <View style={authStyles.errorBox}>
                <Text style={authStyles.errorText}>{error || localError}</Text>
              </View>
            )}

            <View>
              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Name</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    focusedInput === 'name' && authStyles.inputFocused
                  ]}
                  placeholder="Enter your name"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Email</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    focusedInput === 'email' && authStyles.inputFocused
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Password</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    focusedInput === 'password' && authStyles.inputFocused
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  textContentType="newPassword"
                  autoComplete="password-new"
                />
                
                {/* Password Strength Indicator */}
                {showPasswordStrength && passwordStrength && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthHeader}>
                      <Text style={[styles.strengthText, { color: isDark ? '#e0e0e0' : '#333' }]}>
                        Password Strength: 
                      </Text>
                      <Text style={[styles.strengthLevel, { color: passwordStrength.color }]}>
                        {passwordStrength.strength}
                      </Text>
                    </View>
                    
                    <View style={[styles.strengthBar, { backgroundColor: isDark ? '#404040' : '#e0e0e0' }]}>
                      <View 
                        style={[
                          styles.strengthBarFill, 
                          { 
                            width: `${passwordStrength.percentage}%`,
                            backgroundColor: passwordStrength.color 
                          }
                        ]} 
                      />
                    </View>
                    
                    <View style={styles.requirementsContainer}>
                      <Text style={[styles.requirementsTitle, { color: isDark ? '#e0e0e0' : '#333' }]}>
                        Requirements:
                      </Text>
                      <Text style={[styles.requirement, { color: passwordStrength.checks.length ? '#4caf50' : (isDark ? '#888' : '#999') }]}>
                        {passwordStrength.checks.length ? '✓' : '○'} At least 8 characters
                      </Text>
                      <Text style={[styles.requirement, { color: passwordStrength.checks.uppercase ? '#4caf50' : (isDark ? '#888' : '#999') }]}>
                        {passwordStrength.checks.uppercase ? '✓' : '○'} One uppercase letter
                      </Text>
                      <Text style={[styles.requirement, { color: passwordStrength.checks.lowercase ? '#4caf50' : (isDark ? '#888' : '#999') }]}>
                        {passwordStrength.checks.lowercase ? '✓' : '○'} One lowercase letter
                      </Text>
                      <Text style={[styles.requirement, { color: passwordStrength.checks.numbers ? '#4caf50' : (isDark ? '#888' : '#999') }]}>
                        {passwordStrength.checks.numbers ? '✓' : '○'} One number
                      </Text>
                      <Text style={[styles.requirement, { color: passwordStrength.checks.symbols ? '#4caf50' : (isDark ? '#888' : '#999') }]}>
                        {passwordStrength.checks.symbols ? '✓' : '○'} One special character
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Confirm Password</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    focusedInput === 'confirmPassword' && authStyles.inputFocused,
                    passwordsMatch === false && styles.inputError,
                    passwordsMatch === true && styles.inputSuccess
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  textContentType="newPassword"
                  autoComplete="password-new"
                />
                
                {/* Password Match Indicator */}
                {passwordsMatch !== null && (
                  <View style={styles.passwordMatchContainer}>
                    <Text style={[
                      styles.matchText,
                      { color: passwordsMatch ? '#4caf50' : '#ff4c4c' }
                    ]}>
                      {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Terms and Conditions Checkbox */}
              <View style={[
                styles.termsContainer,
                { borderColor: isDark ? '#333333' : '#e0e0e0' }
              ]}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={handleTermsCheckboxPress}
                  disabled={isLoading}
                >
                  <View style={[
                    styles.checkbox,
                    { 
                      borderColor: isDark ? '#555555' : '#cccccc',
                      backgroundColor: acceptedTerms ? '#007AFF' : (isDark ? '#2a2a2a' : '#ffffff')
                    }
                  ]}>
                    {acceptedTerms && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.termsTextContainer}>
                    <Text style={[
                      styles.termsText,
                      { color: isDark ? '#cccccc' : '#666666' }
                    ]}>
                      I agree to the{' '}
                      <Text 
                        style={[
                          styles.termsLink,
                          { color: '#007AFF' }
                        ]}
                        onPress={onTermsPress}
                      >
                        Terms and Conditions
                      </Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  authStyles.button,
                  (!isFormValid() || isLoading) && authStyles.buttonDisabled
                ]}
                onPress={handleRegister}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={authStyles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={authStyles.divider} />
              
              <View style={authStyles.linkContainer}>
                <Text style={authStyles.linkText}>Already have an account?</Text>
                <TouchableOpacity onPress={onLoginPress} disabled={isLoading}>
                  <Text style={authStyles.link}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>© 2025 Eventora. All rights reserved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  termsContainer: {
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Password Strength Styles
  passwordStrengthContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(94, 53, 177, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(94, 53, 177, 0.1)',
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  strengthLevel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  requirementsContainer: {
    marginTop: 4,
  },
  requirementsTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  requirement: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '500',
  },
  // Password Match Styles
  passwordMatchContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Input State Styles
  inputError: {
    borderColor: '#ff4c4c',
    borderWidth: 1.5,
  },
  inputSuccess: {
    borderColor: '#4caf50',
    borderWidth: 1.5,
  },
};