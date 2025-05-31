import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getEventById } from "../../services/eventService";
import { ChevronLeft } from "lucide-react-native";
import { useAuth } from "../../services/auth";
import { participantsStyles } from "../../styles/ParticipantsStyles";

// Helper function to format dates in a user-friendly way
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Recently";
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (e) {
    console.error("Date formatting error:", e);
    return "Recently";
  }
};

interface Participant {
  userId: string | { _id: string };
  name: string;
  profileImage?: string;
  joinedAt: string;
  uploads?: number;
  isCreator?: boolean;
}

export default function ParticipantsScreen() {
  // Note the change here - using query parameters
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Use auth context
  const { state: authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;

  useEffect(() => {
    if (!id) {
      setError("Event ID is missing");
      setIsLoading(false);
      return;
    }

    if (isAuthenticated) {
      fetchParticipants();
    } else if (!authState.isLoading) {
      router.replace("/auth");
    }
  }, [id, isAuthenticated, authState.isLoading]);

  // Update the fetchParticipants function in your ParticipantsScreen component
const fetchParticipants = async () => {
  try {
    console.log("Fetching event with ID:", id);
    const eventData = await getEventById(id as string);
    
    if (eventData) {
      // If participantDetails exists, use it directly
      if (eventData.participantDetails && Array.isArray(eventData.participantDetails)) {
        setParticipants(eventData.participantDetails.map((participant: any) => {
          // Extract userId correctly depending on structure
          let userId = "";
          if (participant.userId) {
            userId = typeof participant.userId === 'object' && participant.userId._id
              ? participant.userId._id
              : participant.userId;
          } else if (participant._id) {
            userId = participant._id;
          }
          
          // Get user name from the right place
          let userName = "Unknown User";
          if (participant.userId && typeof participant.userId === 'object' && participant.userId.name) {
            userName = participant.userId.name;
          } else if (participant.name) {
            userName = participant.name;
          }
          
          return {
            userId: userId,
            name: userName,
            profileImage: participant.profileImage || 
              (participant.userId && typeof participant.userId === 'object' 
                ? participant.userId.profileImage 
                : null),
            joinedAt: formatDate(participant.joinedAt || participant.createdAt || new Date().toISOString()),
            uploads: participant.uploads || 0, // This will now have the actual count from backend
            isCreator: participant.isCreator || participant.role === 'creator' || userId === eventData.creatorId
          };
        }));
      } else if (eventData.participants) {
        // Create a fallback participant list if we only have participant IDs
        const mockParticipants = Array.isArray(eventData.participants) 
          ? eventData.participants 
          : new Array(parseInt(eventData.participants) || 0).fill(null);
            
        setParticipants(mockParticipants.map((p: any, index: number) => ({
          userId: p?.userId || p || `user-${index}`,
          name: p?.name || `User ${index + 1}`,
          profileImage: p?.profileImage,
          joinedAt: formatDate(p?.joinedAt || new Date().toISOString()),
          uploads: p?.uploads || 0, // Will be 0 for mock data
          isCreator: index === 0 // Assume first participant is creator (mock data)
        })));
      } else {
        setParticipants([]);
      }
    } else {
      setError("Event not found");
    }
  } catch (err: any) {
    console.error("Error fetching participants:", err);
    setError("Failed to load participants");
  } finally {
    setIsLoading(false);
  }
};

  if (isLoading) {
    return (
      <View style={participantsStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={participantsStyles.errorContainer}>
        <Text style={participantsStyles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={participantsStyles.goBackButton}
        >
          <Text style={participantsStyles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={participantsStyles.container}>
      {/* Header */}
      <View style={participantsStyles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={participantsStyles.backButton}
        >
          <ChevronLeft size={24} color="#7c3aed" />
        </TouchableOpacity>
        <Text style={participantsStyles.headerTitle}>Event Participants</Text>
      </View>

      {/* Participants List */}
      <ScrollView style={participantsStyles.scrollContainer}>
        {participants.length === 0 ? (
          <View style={participantsStyles.emptyContainer}>
            <Text style={participantsStyles.emptyText}>No participants found</Text>
          </View>
        ) : (
          participants.map((participant, index) => (
            <View
              key={index}
              style={participantsStyles.participantItem}
            >
              <View style={participantsStyles.avatarContainer}>
                {participant.profileImage ? (
                  <Image
                    source={{ uri: participant.profileImage }}
                    style={participantsStyles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={participantsStyles.avatarPlaceholder}>
                    <Text style={participantsStyles.avatarText}>
                      {participant.name && participant.name.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={participantsStyles.participantInfo}>
                <Text style={participantsStyles.participantName}>{participant.name}</Text>
                <View style={participantsStyles.participantDetails}>
                  {participant.isCreator ? (
                    <View style={participantsStyles.creatorBadge}>
                      <Text style={participantsStyles.creatorBadgeText}>Creator</Text>
                    </View>
                  ) : (
                    <View style={participantsStyles.participantBadge}>
                      <Text style={participantsStyles.participantBadgeText}>Participant</Text>
                    </View>
                  )}
                  <Text style={participantsStyles.joinedText}>
                    Joined {participant.joinedAt}
                  </Text>
                </View>
              </View>
              {participant.uploads !== undefined && (
                <View style={participantsStyles.uploadsContainer}>
                  <Text style={participantsStyles.uploadsText}>{participant.uploads}</Text>
                  <Text style={participantsStyles.uploadsLabel}>uploads</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}