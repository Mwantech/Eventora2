import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import UserProfile from "./components/UserProfile";

export default function ProfileScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <UserProfile isCurrentUser={true} />
    </View>
  );
}
