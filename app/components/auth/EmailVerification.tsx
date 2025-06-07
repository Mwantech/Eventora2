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
  Alert,
} from "react-native";
import apiClient from "../../utils/apiClient";
import verificationStyles from "../../styles/verificationStyles";

interface EmailVerificationProps {
  email: string;
  onVerify: (email: string, code: string) => Promise<void>;
  onVerificationSuccess: () => void;
  onBackToRegister: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function EmailVerification({
  email,
  onVerify,
  onVerificationSuccess,
  onBackToRegister,
  isLoading = false,
  error = null,
}: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateForm = () => {
    if (!verificationCode.trim()) {
      setLocalError("Verification code is required");
      return false;
    }
    if (verificationCode.length !== 6) {
      setLocalError("Verification code must be 6 digits");
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleVerification = async () => {
    if (!validateForm()) return;

    setIsVerifying(true);
    setLocalError(null);

    try {
      await onVerify(email, verificationCode);
      
      Alert.alert(
        "Success!",
        "Your email has been verified successfully. Welcome aboard!",
        [{ text: "Continue", onPress: onVerificationSuccess }]
      );
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "Network error. Please try again.";
      setLocalError(errorMessage);
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setLocalError(null);

    try {
      const response = await apiClient.post('/auth/resend-verification', {
        email
      });

      if (response.data.success) {
        Alert.alert("Success", "Verification code sent! Please check your email.");
        setResendCooldown(600); // 10 minutes cooldown
        setVerificationCode(""); // Clear the input
      } else {
        setLocalError(response.data.message || "Failed to resend code");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Network error. Please try again.";
      setLocalError(errorMessage);
      console.error("Resend error:", err);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    
    const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
  };

  const currentIsLoading = isLoading || isVerifying;

  return (
    <SafeAreaView style={verificationStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9fc" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={verificationStyles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={verificationStyles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
        >
          <View style={verificationStyles.logoContainer}>
            <Image
              source={require("../../../assets/images/Eventora.png")}
              style={verificationStyles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={verificationStyles.headerContainer}>
            <Text style={verificationStyles.title}>Verify your email</Text>
            <Text style={verificationStyles.subtitle}>
              We've sent a 6-digit verification code to{"\n"}
              <Text style={verificationStyles.emailText}>{maskEmail(email)}</Text>
            </Text>
          </View>

          <View style={verificationStyles.formCard}>
            {(error || localError) && (
              <View style={verificationStyles.errorContainer}>
                <Text style={verificationStyles.errorText}>{error || localError}</Text>
              </View>
            )}

            <View style={verificationStyles.inputSection}>
              <View style={verificationStyles.inputContainer}>
                <Text style={verificationStyles.label}>Verification Code</Text>
                <TextInput
                  style={[
                    verificationStyles.codeInput,
                    focusedInput === 'code' && verificationStyles.codeInputFocused,
                    (error || localError) && verificationStyles.codeInputError
                  ]}
                  placeholder="000000"
                  value={verificationCode}
                  onChangeText={(text) => {
                    // Only allow numbers and limit to 6 digits
                    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                    setVerificationCode(numericText);
                    if (localError) setLocalError(null);
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!currentIsLoading}
                  placeholderTextColor="#999"
                  onFocus={() => setFocusedInput('code')}
                  onBlur={() => setFocusedInput(null)}
                  autoFocus={true}
                />
              </View>

              <TouchableOpacity
                style={[
                  verificationStyles.verifyButton,
                  (currentIsLoading || verificationCode.length !== 6) && verificationStyles.verifyButtonDisabled
                ]}
                onPress={handleVerification}
                disabled={currentIsLoading || verificationCode.length !== 6}
              >
                {currentIsLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={verificationStyles.verifyButtonText}>Verify Email</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={verificationStyles.divider} />
            
            <View style={verificationStyles.actionsContainer}>
              <Text style={verificationStyles.resendLabel}>
                Didn't receive the code?
              </Text>
              
              <TouchableOpacity 
                onPress={handleResendCode} 
                disabled={isResending || resendCooldown > 0}
                style={[
                  verificationStyles.resendButton,
                  (isResending || resendCooldown > 0) && verificationStyles.resendButtonDisabled
                ]}
              >
                {isResending ? (
                  <View style={verificationStyles.resendLoadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" style={{ marginRight: 8 }} />
                    <Text style={verificationStyles.resendButtonText}>Sending...</Text>
                  </View>
                ) : resendCooldown > 0 ? (
                  <Text style={verificationStyles.resendButtonTextDisabled}>
                    Resend in {formatTime(resendCooldown)}
                  </Text>
                ) : (
                  <Text style={verificationStyles.resendButtonText}>
                    Resend Code
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={onBackToRegister} 
                disabled={currentIsLoading}
                style={verificationStyles.backButton}
              >
                <Text style={verificationStyles.backButtonText}>
                  Wrong email? <Text style={verificationStyles.backButtonLink}>Go back</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={verificationStyles.footer}>
            <Text style={verificationStyles.footerText}>© 2025 Eventora. All rights reserved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}