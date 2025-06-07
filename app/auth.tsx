import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import EmailVerification from "./components/auth/EmailVerification";
import { useAuth } from "./services/auth";

type AuthScreenState = 'login' | 'register' | 'verification';

export default function AuthScreen() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreenState>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');
  const { state, login, register, verifyEmail } = useAuth();
  const router = useRouter();

  // If we're already authenticated, navigate to home screen
  useEffect(() => {
    if (state.isAuthenticated) {
      router.replace("/");
    }
  }, [state.isAuthenticated, router]);

  const handleLoginPress = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      // Check if email verification is required
      if (error.message.includes('verify your email') || error.message.includes('Please verify')) {
        setPendingVerificationEmail(email);
        setCurrentScreen('verification');
      }
      console.log("Login error:", error);
    }
  };

  const handleRegisterPress = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      const result = await register(name, email, password);
      
      if (result.success) {
        // Set the email for verification and navigate to verification screen
        setPendingVerificationEmail(result.email);
        setCurrentScreen('verification');
      }
    } catch (error) {
      // Error handling is managed within the register function
      console.log("Register error:", error);
    }
  };

  const handleEmailVerification = async (email: string, code: string) => {
    try {
      await verifyEmail(email, code);
      // After successful verification, user is authenticated and useEffect will handle navigation
    } catch (error) {
      console.log("Verification error:", error);
      throw error; // Re-throw so EmailVerification component can handle it
    }
  };

  const handleVerificationSuccess = () => {
    // Reset the screen state
    setCurrentScreen('login');
    setPendingVerificationEmail('');
    // Navigation to home will be handled by the useEffect since user is now authenticated
  };

  const handleBackToRegister = () => {
    setCurrentScreen('register');
    setPendingVerificationEmail('');
  };

  const handleSwitchToLogin = () => {
    setCurrentScreen('login');
    setPendingVerificationEmail('');
  };

  const handleSwitchToRegister = () => {
    setCurrentScreen('register');
    setPendingVerificationEmail('');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <Login
            onLogin={handleLoginPress}
            onRegisterPress={handleSwitchToRegister}
            isLoading={state.isLoading}
            error={state.error}
          />
        );
      
      case 'register':
        return (
          <Register
            onRegister={handleRegisterPress}
            onLoginPress={handleSwitchToLogin}
            isLoading={state.isLoading}
            error={state.error}
          />
        );
      
      case 'verification':
        return (
          <EmailVerification
            email={pendingVerificationEmail}
            onVerify={handleEmailVerification}
            onVerificationSuccess={handleVerificationSuccess}
            onBackToRegister={handleBackToRegister}
            isLoading={state.isLoading}
            error={state.error}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderCurrentScreen()}
    </View>
  );
}