import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getEventById, joinEvent, leaveEvent } from "../services/eventService";
import { Calendar, MapPin, Users, Share, ChevronLeft, UserPlus } from "lucide-react-native";
import type { Event } from "../services/eventService";
import { useAuth } from "../services/auth";
import { EventScreenStyles } from "../styles/EventScreenStyles";

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Use the auth context to get real-time auth state
  const { state: authState } = useAuth();
  const currentUser = authState.user;
  const isAuthenticated = authState.isAuthenticated;

  useEffect(() => {
    if (!id) {
      setError("Event ID is missing");
      setIsLoading(false);
      return;
    }

    // Check authentication state before fetching
    if (isAuthenticated) {
      fetchEvent();
    } else if (!authState.isLoading) {
      // Only show login prompt if we're finished checking auth state
      Alert.alert(
        "Authentication Required",
        "You need to log in to view event details",
        [
          { text: "Cancel", onPress: () => router.replace("/") },
          { text: "Login", onPress: () => router.replace("/auth") }
        ]
      );
      setIsLoading(false);
    }
  }, [id, isAuthenticated, authState.isLoading]);

  const fetchEvent = async () => {
    try {
      console.log("Fetching event with ID:", id);
      const eventData = await getEventById(id as string);
      
      if (eventData) {
        console.log("Event data received:", eventData);
        
        // Handle _id to id mapping if necessary
        const processedEvent = eventData._id && !eventData.id ? {
          ...eventData,
          id: eventData._id
        } : eventData;
        
        setEvent(processedEvent);
        
        // Check if current user is the creator
        if (currentUser) {
          const isEventCreator = currentUser.id === processedEvent.creatorId;
          setIsCreator(isEventCreator);
          
          // Check if user has joined this event
          // First check participantDetails if available
          if (eventData.participantDetails) {
            const isUserParticipant = eventData.participantDetails.some(
              participant => {
                // Handle both direct ID and object with _id
                const participantId = participant.userId._id || participant.userId;
                return participantId === currentUser.id;
              }
            );
            setIsJoined(isUserParticipant);
          } else {
            // Fallback - just assume not joined
            setIsJoined(false);
          }
        }
      } else {
        console.error("Event data is null");
        setError("Event not found");
      }
    } catch (err: any) {
      console.error("Error fetching event:", err);
      
      // Handle auth errors specifically
      if (err.response && err.response.status === 401) {
        Alert.alert(
          "Authentication Required",
          "You need to log in to view this event",
          [
            { text: "Cancel", onPress: () => router.replace("/") },
            { text: "Login", onPress: () => router.replace("/auth") }
          ]
        );
      } else if (err.response && err.response.status === 403) {
        setError("You don't have permission to view this event");
      } else {
        setError("Failed to load event");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!event || !isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to join this event");
      router.replace("/auth");
      return;
    }
    
    const eventId = event.id || event._id;
    if (!eventId) return;
    
    try {
      setIsJoining(true);
      await joinEvent(eventId);
      setIsJoined(true);
      // Refresh event data
      fetchEvent();
    } catch (err: any) {
      console.error("Error joining event:", err);
      
      // Add specific error handling
      if (err.response && err.response.status === 401) {
        Alert.alert(
          "Authentication Required", 
          "Your session has expired. Please log in again.",
          [
            { text: "OK", onPress: () => router.replace("/auth") }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to join event. Please try again.");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!event || !isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to leave this event");
      router.replace("/auth");
      return;
    }
    
    const eventId = event.id || event._id;
    if (!eventId) return;
    
    try {
      setIsJoining(true);
      await leaveEvent(eventId);
      setIsJoined(false);
      // Refresh event data
      fetchEvent();
    } catch (err: any) {
      console.error("Error leaving event:", err);
      
      // Add specific error handling
      if (err.response && err.response.status === 401) {
        Alert.alert(
          "Authentication Required", 
          "Your session has expired. Please log in again.",
          [
            { text: "OK", onPress: () => router.replace("/auth") }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to leave event. Please try again.");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = () => {
    // Navigate to share screen with the event ID
    if (event) {
      const eventId = event.id || event._id;
      router.push(`/event/share/${eventId}`);
    }
  };

  // Navigate to invitation screen
  const handleInviteUsers = () => {
    if (!event || !isAuthenticated) {
      Alert.alert("Authentication Required", "Please log in to invite users");
      router.replace("/auth");
      return;
    }
    
    const eventId = event.id || event._id;
    router.push(`/event/invitation/${eventId}`);
  };

  // Navigate to gallery
  const navigateToGallery = () => {
    if (event) {
      const eventId = event.id || event._id;
      router.push(`/event/gallery/${eventId}`);
    }
  };

  // Navigate to participants list with proper path parameter
  const navigateToParticipants = () => {
    if (event) {
      const eventId = event.id || event._id;
      router.push(`/event/participants/${eventId}`);
    }
  };

  if (isLoading) {
    return (
      <View style={EventScreenStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={EventScreenStyles.errorContainer}>
        <Text style={EventScreenStyles.errorTitle}>
          {error || "Event not found"}
        </Text>
        <Text style={EventScreenStyles.errorMessage}>
          The event you're looking for might have been removed or is not
          accessible.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={EventScreenStyles.errorButton}
        >
          <Text style={EventScreenStyles.errorButtonText}>Go to Events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const defaultImage = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80";
  const eventId = event.id || event._id;

  // Function to render event details content
  const renderEventDetails = () => (
    <View style={EventScreenStyles.detailsContainer}>
      <Text style={EventScreenStyles.eventTitle}>{event.name}</Text>
      
      <View style={EventScreenStyles.infoRow}>
        <Calendar size={20} color="#8B5CF6" />
        <Text style={EventScreenStyles.infoText}>{event.date}</Text>
        {event.time && <Text style={EventScreenStyles.timeText}> at {event.time}</Text>}
      </View>
      
      {event.location && (
        <View style={EventScreenStyles.infoRow}>
          <MapPin size={20} color="#8B5CF6" />
          <Text style={EventScreenStyles.infoText}>{event.location}</Text>
        </View>
      )}
      
      <View style={EventScreenStyles.infoRow}>
        <Users size={20} color="#8B5CF6" />
        <Text style={EventScreenStyles.infoText}>{event.participants} participants</Text>
      </View>
      
      <View style={EventScreenStyles.badgeContainer}>
        <View style={EventScreenStyles.badge}>
          <Text style={EventScreenStyles.badgeText}>
            {event.isPrivate ? "Private Event" : "Public Event"}
          </Text>
        </View>
      </View>
      
      {/* Creator Info */}
      <View style={EventScreenStyles.creatorContainer}>
        <View style={EventScreenStyles.creatorAvatar}>
          {event.creatorProfileImage ? (
            <Image
              source={{ uri: event.creatorProfileImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={EventScreenStyles.creatorAvatarFallback}>
              <Text style={EventScreenStyles.creatorAvatarText}>
                {event.creatorName?.substring(0, 1) || "U"}
              </Text>
            </View>
          )}
        </View>
        <View style={EventScreenStyles.creatorInfo}>
          <Text style={EventScreenStyles.creatorLabel}>Created by</Text>
          <Text style={EventScreenStyles.creatorName}>{event.creatorName}</Text>
        </View>
      </View>
      
      {/* Description */}
      {event.description && (
        <View style={EventScreenStyles.descriptionContainer}>
          <Text style={EventScreenStyles.descriptionTitle}>About this event</Text>
          <Text style={EventScreenStyles.descriptionText}>{event.description}</Text>
        </View>
      )}
      
      {/* Action Buttons */}
      <View style={EventScreenStyles.actionButtonsContainer}>
        <View style={EventScreenStyles.primaryButtonsRow}>
          {isCreator ? (
            <TouchableOpacity
              style={[EventScreenStyles.primaryButton, EventScreenStyles.editButton]}
              onPress={() => router.push(`/event/edit/${eventId}`)}
            >
              <Text style={EventScreenStyles.buttonText}>Edit Event</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                EventScreenStyles.primaryButton,
                isJoined ? EventScreenStyles.leaveButton : EventScreenStyles.joinButton,
                (!isAuthenticated || isJoining) && EventScreenStyles.disabledButton
              ]}
              onPress={isJoined ? handleLeaveEvent : handleJoinEvent}
              disabled={isJoining || !isAuthenticated}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[
                  EventScreenStyles.buttonText,
                  (!isAuthenticated || isJoining) && EventScreenStyles.disabledButtonText
                ]}>
                  {isJoined ? "Leave Event" : "Join Event"}
                </Text>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={EventScreenStyles.shareButton}
            onPress={handleShare}
          >
            <Share size={24} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Invitation Button - Show for creators or joined participants */}
        {(isCreator || isJoined) && (
          <TouchableOpacity
            style={[
              EventScreenStyles.inviteButton,
              !isAuthenticated && EventScreenStyles.disabledButton
            ]}
            onPress={handleInviteUsers}
            disabled={!isAuthenticated}
          >
            <UserPlus size={20} color="#8B5CF6" />
            <Text style={[
              EventScreenStyles.inviteButtonText,
              !isAuthenticated && EventScreenStyles.disabledButtonText
            ]}>
              Invite Friends
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={EventScreenStyles.container}>
      {/* Back Button */}
      <View style={EventScreenStyles.headerContainer}>
        <TouchableOpacity 
          style={EventScreenStyles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>
      
      {/* Cover Image */}
      <Image
        source={{ uri: event.coverImage || defaultImage }}
        style={EventScreenStyles.coverImage}
        resizeMode="cover"
      />
      
      {/* Tab Navigation */}
      <View style={EventScreenStyles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("details")}
          style={[
            EventScreenStyles.tabButton,
            activeTab === "details" && EventScreenStyles.activeTabButton
          ]}
        >
          <Text
            style={[
              EventScreenStyles.tabText,
              activeTab === "details" && EventScreenStyles.activeTabText
            ]}
          >
            Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigateToGallery()}
          style={[
            EventScreenStyles.tabButton,
            activeTab === "gallery" && EventScreenStyles.activeTabButton
          ]}
        >
          <Text
            style={[
              EventScreenStyles.tabText,
              activeTab === "gallery" && EventScreenStyles.activeTabText
            ]}
          >
            Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigateToParticipants()}
          style={[
            EventScreenStyles.tabButton,
            activeTab === "participants" && EventScreenStyles.activeTabButton
          ]}
        >
          <Text
            style={[
              EventScreenStyles.tabText,
              activeTab === "participants" && EventScreenStyles.activeTabText
            ]}
          >
            Participants
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content - Only render details in this component */}
      <ScrollView 
        style={EventScreenStyles.contentContainer}
        contentContainerStyle={EventScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderEventDetails()}
      </ScrollView>
    </View>
  );
}