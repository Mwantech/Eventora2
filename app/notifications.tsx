import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import NotificationsComponent from "./components/Notification";
import { useAuth } from "./services/auth";

export default function NotificationsScreen() {
  const router = useRouter();
  const { state } = useAuth();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50, // Adjust for status bar
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5'
      }}>
        <TouchableOpacity
          onPress={handleBack}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 16
          }}
        >
          <ChevronLeft size={24} color="#666" />
          <Text style={{ marginLeft: 4, color: '#666' }}>Back</Text>
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#333'
        }}>
          All Notifications
        </Text>
      </View>

      {/* Notifications */}
      <NotificationsComponent
        userId={state.user?.id}
        showHeader={false}
      />
    </View>
  );
}