import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, User, Calendar, Users } from "lucide-react-native";
import EventCard from "./EventCard";
import { getAllEvents, getEventsByUserId, getAuthState } from "../services/eventService";
import type { Event } from "../services/eventService";
import { styles } from "../styles/EventListStyles";

interface EventListProps {
  userId?: string;
  filter?: "all" | "created" | "joined";
  onCreateEvent?: () => void;
}

export default function EventList({
  userId,
  filter = "all",
  onCreateEvent,
}: EventListProps) {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "created" | "joined">(filter);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user data first
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user } = await getAuthState();
        console.log("Current user:", user);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data. Please try again.");
      }
    };
    
    loadUserData();
  }, []);

  // Fetch events function
  const fetchEvents = useCallback(async () => {
    if (!currentUser) {
      console.log("No current user, skipping fetch");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching events with filter:", activeFilter);
      let eventsData: Event[] = [];
      
      // Determine which userId to use - if a specific userId is provided, use that
      // Otherwise, use the current user's ID
      const userIdToUse = userId || currentUser?.id;
      
      if (userIdToUse && (activeFilter === "created" || activeFilter === "joined")) {
        // For specific user filters, use the user-specific endpoint
        console.log("Fetching user-specific events for user:", userIdToUse, "with filter:", activeFilter);
        eventsData = await getEventsByUserId(userIdToUse, activeFilter);
      } else if (userIdToUse && activeFilter === "all" && !userId) {
        // For "all" filter without specific userId, show public events + user's events
        console.log("Fetching all events (public + user's private)");
        eventsData = await getAllEvents();
      } else if (userIdToUse && activeFilter === "all" && userId) {
        // For "all" filter with specific userId, get all events for that user
        console.log("Fetching all events for specific user:", userIdToUse);
        eventsData = await getEventsByUserId(userIdToUse, "all");
      } else {
        // Fallback to public events only
        console.log("Fetching public events only");
        eventsData = await getAllEvents();
      }
      
      console.log("Events data received:", eventsData);
      
      if (!Array.isArray(eventsData)) {
        console.error("API did not return an array:", eventsData);
        setEvents([]);
        setError("Invalid response from server");
        return;
      }
      
      // Map _id to id if necessary and filter out invalid events
      const validEvents = eventsData
        .map(event => {
          // If event has _id but no id, map _id to id
          if (event && event._id && !event.id) {
            return {
              ...event,
              id: event._id
            };
          }
          return event;
        })
        .filter(event => event && (event.id || event._id));
      
      console.log("Valid events count:", validEvents.length);
      setEvents(validEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeFilter, currentUser, userId]);

  // Fetch events when user data is available
  useEffect(() => {
    if (currentUser) {
      fetchEvents();
    }
  }, [currentUser, fetchEvents]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEvents();
  };

  const handleCreateEvent = () => {
    if (onCreateEvent) {
      onCreateEvent();
    } else {
      router.push("/create");
    }
  };

  // Handle id/_id inconsistency in event data
  const renderEventCard = ({ item }: { item: Event }) => {
    if (!item) {
      console.log("Skipping invalid event item:", item);
      return null;
    }
    
    // Use id or _id, whichever is available
    const eventId = item.id || item._id;
    if (!eventId) {
      console.log("Skipping event without id:", item);
      return null;
    }
    
    return (
      <EventCard
        id={eventId}
        name={item.name || "Unnamed Event"}
        date={item.date || "No date specified"}
        participants={item.participants || 0}
        coverImage={item.coverImage}
        location={item.location}
        isPrivate={item.isPrivate}
      />
    );
  };

  // Safe keyExtractor that handles both id and _id
  const keyExtractor = (item: Event, index: number) => {
    return (item && (item.id || item._id)) ? (item.id || item._id).toString() : `fallback-key-${index}`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Calendar size={32} color="#9333ea" />
      </View>
      <Text style={styles.emptyTitle}>
        {error ? "Something went wrong" : "No events yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {error 
          ? "We couldn't load your events. Please try again." 
          : activeFilter === "all" 
            ? "Create your first event to get started!" 
            : `No ${activeFilter} events found. Try a different filter or create a new event.`
        }
      </Text>
      <TouchableOpacity
        onPress={handleCreateEvent}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>Eventora</Text>
            <Text style={styles.headerTitle}>My Events</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={styles.headerButton}
            >
              <User size={20} color="#9333ea" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreateEvent}
              style={styles.headerButton}
            >
              <Plus size={20} color="#9333ea" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modern Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setActiveFilter("all")}
          style={[
            styles.filterTab,
            activeFilter === "all" && styles.activeFilterTab,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "all" && styles.activeFilterText,
            ]}
          >
            All Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter("created")}
          style={[
            styles.filterTab,
            activeFilter === "created" && styles.activeFilterTab,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "created" && styles.activeFilterText,
            ]}
          >
            Created
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter("joined")}
          style={[
            styles.filterTab,
            activeFilter === "joined" && styles.activeFilterTab,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "joined" && styles.activeFilterText,
            ]}
          >
            Joined
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchEvents}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9333ea" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#9333ea"]}
                tintColor="#9333ea"
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </View>
  );
}