import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./services/auth";
import EventList from "./components/EventList";

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const { isAuthenticated, isLoading, user } = state;

  // Handle navigation when auth state changes
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // If authenticated, show the event list
  if (isAuthenticated && user) {
    return <EventList />;
  }

  // This is a fallback that shouldn't normally be seen
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text>Loading events...</Text>
    </View>
  );
}