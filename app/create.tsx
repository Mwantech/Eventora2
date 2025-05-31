import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import EventCreation from "./components/EventCreation";

export default function CreateEventScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <EventCreation />
    </View>
  );
}
