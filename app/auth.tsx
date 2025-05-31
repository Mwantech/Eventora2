import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { useAuth } from "./services/auth";

export default function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);
  const { state, login, register } = useAuth();
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
    } catch (error) {
      // Error handling is managed within the login function
      console.log("Login error:", error);
    }
  };

  const handleRegisterPress = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      await register(name, email, password);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error handling is managed within the register function
      console.log("Register error:", error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {showLogin ? (
        <Login
          onLogin={handleLoginPress}
          onRegisterPress={() => setShowLogin(false)}
          isLoading={state.isLoading}
          error={state.error}
        />
      ) : (
        <Register
          onRegister={handleRegisterPress}
          onLoginPress={() => setShowLogin(true)}
          isLoading={state.isLoading}
          error={state.error}
        />
      )}
    </View>
  );
}