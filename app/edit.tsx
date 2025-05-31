
import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import EditProfileComponent from "./components/EditProfile";

export default function EditProfileScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <EditProfileComponent />
    </View>
  );
}