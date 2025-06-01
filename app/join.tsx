import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import JoinEvent from "./components/JoinEvent";

export default function JoinScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <JoinEvent />
    </View>
  );
}