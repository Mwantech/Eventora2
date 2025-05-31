import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '../../../utils/apiClient';
import { useAuth } from '../../../services/auth';

// Event interface for TypeScript
interface Event {
  id?: string;
  _id?: string;
  name: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  isPrivate: boolean;
  creatorId: string;
  participants: number;
  createdAt: string;
  creatorName?: string;
  [key: string]: any; // For other properties
}

export default function SharedEventScreen() {
  const { id, token } = useLocalSearchParams<{ id: string; token: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuth();
  
  useEffect(() => {
    // Check if we have the necessary parameters
    if (!id || !token) {
      setError('Invalid event link - missing parameters');
      setIsLoading(false);
      return;
    }
    
    loadSharedEvent();
  }, [id, token]);
  
  const loadSharedEvent = async () => {
    try {
      console.log(`Loading shared event: id=${id}, token=${token}`);
      
      // IMPORTANT: Use direct API call with the correct endpoint path
      // Note we're using /events/share/ instead of /event/share/ as per your backend controller
      const response = await apiClient.get(`/events/share/${id}/${token}`);
      const eventData = response.data?.data;
      
      console.log('Shared event data received:', eventData ? 'SUCCESS' : 'EMPTY');
      
      if (eventData) {
        // Process the event data - normalize ID
        const processedEvent = {
          ...eventData,
          id: eventData.id || eventData._id
        };
        
        setEvent(processedEvent);
        
        // Give feedback before redirecting
        Alert.alert(
          "Event Found",
          `You're being redirected to "${processedEvent.name}"`,
          [{ text: "OK" }],
          { cancelable: false }
        );
        
        // Short delay before redirect for better UX
        setTimeout(() => {
          // Navigate to the regular event view
          router.replace(`/event/${processedEvent.id || processedEvent._id}`);
        }, 1000);
      } else {
        setError('Event not found or link is invalid');
      }
    } catch (err: any) {
      console.error('Error loading shared event:', err);
      
      if (err.response) {
        console.log('Error response status:', err.response.status);
        console.log('Error response data:', err.response.data);
        
        if (err.response.status === 404) {
          setError('This event link is no longer valid');
        } else if (err.response.status === 401) {
          setError('Authentication required to view this event');
        } else {
          setError(`Error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`);
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg mb-4">Opening shared event...</Text>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-gray-500 mt-4">ID: {id}</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-xl font-bold text-red-500 mb-2">{error}</Text>
        <Text className="text-gray-600 text-center mb-6">
          The shared event link may be invalid or has expired.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          className="bg-blue-500 py-2 px-4 rounded-lg"
        >
          <Text className="text-white font-bold">Browse Events</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // This is just a fallback display
  // In most cases, the router.replace above will navigate away
  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-xl font-bold mb-2">Event Found!</Text>
      <Text className="text-gray-600 text-center mb-6">
        Redirecting you to view {event?.name}...
      </Text>
      <ActivityIndicator size="small" color="#3b82f6" />
    </View>
  );
}