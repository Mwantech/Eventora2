import React, { useState } from "react";
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
import { getAuthStyles } from "../../styles/authStyles"; // Import the adaptive auth styles

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onLoginPress: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function Register({
  onRegister,
  onLoginPress,
  isLoading = false,
  error = null,
}: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Get adaptive styles based on current color scheme
  const authStyles = getAuthStyles();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
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
              source={require("../../../assets/images/logo.png")} // Replace with your actual logo path
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
                  // These props help ensure password dots are visible
                  textContentType="newPassword"
                  autoComplete="password-new"
                />
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Confirm Password</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    focusedInput === 'confirmPassword' && authStyles.inputFocused
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  // These props help ensure password dots are visible
                  textContentType="newPassword"
                  autoComplete="password-new"
                />
              </View>

              <TouchableOpacity
                style={[
                  authStyles.button,
                  isLoading && authStyles.buttonDisabled
                ]}
                onPress={handleRegister}
                disabled={isLoading}
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