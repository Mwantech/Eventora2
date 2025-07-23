import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, User, Calendar, Users, UserPlus, QrCode, MessageCircle, Send, X, Search, TrendingUp } from "lucide-react-native";
import EventCard from "./EventCard";
import { getAllEvents, getEventsByUserId, getAuthState } from "../services/eventService";
import apiClient from "../utils/apiClient"; // Import your API client
import type { Event } from "../services/eventService";
import { styles } from "../styles/EventListStyles";

interface EventListProps {
  userId?: string;
  filter?: "all" | "created" | "joined" | "popular";
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
  const [activeFilter, setActiveFilter] = useState<"all" | "created" | "joined" | "popular">(filter);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  
  // Feedback modal state
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "general">("general");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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

  // Function to get popular events (sorted by participant count)
  const getPopularEvents = useCallback(async () => {
    try {
      console.log("Fetching popular events...");
      
      // Get all public events
      const allEvents = await getAllEvents();
      
      if (!Array.isArray(allEvents)) {
        console.error("API did not return an array for popular events:", allEvents);
        return [];
      }
      
      // Filter for public events only and sort by participant count
      const popularEvents = allEvents
        .filter(event => !event.isPrivate) // Only public events
        .sort((a, b) => {
          const participantsA = a.participants || 0;
          const participantsB = b.participants || 0;
          return participantsB - participantsA; // Sort in descending order
        })
        .slice(0, 20); // Limit to top 20 popular events
      
      console.log("Popular events found:", popularEvents.length);
      return popularEvents;
    } catch (error) {
      console.error("Error fetching popular events:", error);
      throw error;
    }
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
      
      if (activeFilter === "popular") {
        // Fetch popular public events
        eventsData = await getPopularEvents();
      } else if (userIdToUse && (activeFilter === "created" || activeFilter === "joined")) {
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
  }, [activeFilter, currentUser, userId, getPopularEvents]);

  // Fetch events when user data is available
  useEffect(() => {
    if (currentUser) {
      fetchEvents();
    }
  }, [currentUser, fetchEvents]);

  // Search functionality with memoization for performance
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return events;
    }

    const query = searchQuery.toLowerCase().trim();
    return events.filter(event => {
      const name = event.name?.toLowerCase() || "";
      const location = event.location?.toLowerCase() || "";
      const description = event.description?.toLowerCase() || "";
      
      return name.includes(query) || 
             location.includes(query) || 
             description.includes(query);
    });
  }, [events, searchQuery]);

  // Search suggestions - show top 5 matching events when typing
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    return filteredEvents.slice(0, 5);
  }, [filteredEvents, searchQuery]);

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSearchSuggestions(text.length >= 2);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (event: Event) => {
    setSearchQuery(event.name || "");
    setShowSearchSuggestions(false);
    setSearchInputFocused(false);
    
    // Navigate to event details
    const eventId = event.id || event._id;
    if (eventId) {
      router.push(`/event/${eventId}`);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchSuggestions(false);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    setSearchInputFocused(true);
    if (searchQuery.length >= 2) {
      setShowSearchSuggestions(true);
    }
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for tap selection
    setTimeout(() => {
      setSearchInputFocused(false);
      setShowSearchSuggestions(false);
    }, 200);
  };

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

  const handleJoinEvent = () => {
    router.push("/join");
  };

  // Feedback functions
  const openFeedbackModal = () => {
    setFeedbackModalVisible(true);
    setFeedbackText("");
    setFeedbackType("general");
  };

  const closeFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setFeedbackText("");
    setIsSubmittingFeedback(false);
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert("Error", "Please enter your feedback before submitting.");
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const feedbackData = {
        message: feedbackText.trim(),
        type: feedbackType,
        userId: currentUser?.id || currentUser?._id,
        userEmail: currentUser?.email,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        appVersion: "1.0.0", // You can make this dynamic
      };

      console.log("Submitting feedback:", feedbackData);

      const response = await apiClient.post('/feedback', feedbackData);
      
      console.log("Feedback submitted successfully:", response.data);
      
      Alert.alert(
        "Thank you!",
        "Your feedback has been submitted successfully. We appreciate your input!",
        [{ text: "OK", onPress: closeFeedbackModal }]
      );
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      
      let errorMessage = "Failed to submit feedback. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmittingFeedback(false);
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
        showPopularityBadge={activeFilter === "popular"} // Show badge for popular events
      />
    );
  };

  // Render search suggestion item
  const renderSearchSuggestion = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.searchSuggestionItem}
      onPress={() => handleSuggestionSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.searchSuggestionContent}>
        <Text style={styles.searchSuggestionTitle} numberOfLines={1}>
          {item.name || "Unnamed Event"}
        </Text>
        {item.location && (
          <Text style={styles.searchSuggestionSubtitle} numberOfLines={1}>
            📍 {item.location}
          </Text>
        )}
        <View style={styles.searchSuggestionMeta}>
          {item.date && (
            <Text style={styles.searchSuggestionDate} numberOfLines={1}>
              📅 {new Date(item.date).toLocaleDateString()}
            </Text>
          )}
          {item.participants && item.participants > 0 && (
            <Text style={styles.searchSuggestionParticipants} numberOfLines={1}>
              👥 {item.participants} attending
            </Text>
          )}
        </View>
      </View>
      <View style={styles.searchSuggestionArrow}>
        <Text style={styles.searchSuggestionArrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );

  // Safe keyExtractor that handles both id and _id
  const keyExtractor = (item: Event, index: number) => {
    return (item && (item.id || item._id)) ? (item.id || item._id).toString() : `fallback-key-${index}`;
  };

  // Get filter display text and description
  const getFilterInfo = () => {
    switch (activeFilter) {
      case "popular":
        return {
          title: "Popular Events",
          subtitle: "Most attended public events",
          emptyMessage: "No popular events found. Popular events will appear here as more people join public events.",
        };
      case "created":
        return {
          title: "Created Events",
          subtitle: "Events you've created",
          emptyMessage: "You haven't created any events yet. Create your first event to get started!",
        };
      case "joined":
        return {
          title: "Joined Events",
          subtitle: "Events you're attending",
          emptyMessage: "You haven't joined any events yet. Browse popular events or search for events to join!",
        };
      default:
        return {
          title: "All Events",
          subtitle: "Discover amazing events",
          emptyMessage: "No events available. Create your first event or check back later!",
        };
    }
  };

  const filterInfo = getFilterInfo();

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        {activeFilter === "popular" ? (
          <TrendingUp size={32} color="#9333ea" />
        ) : (
          <Calendar size={32} color="#9333ea" />
        )}
      </View>
      <Text style={styles.emptyTitle}>
        {error ? "Something went wrong" : searchQuery ? "No matching events" : filterInfo.title}
      </Text>
      <Text style={styles.emptySubtitle}>
        {error 
          ? "We couldn't load your events. Please try again." 
          : searchQuery
            ? `No events found matching "${searchQuery}". Try a different search term.`
            : filterInfo.emptyMessage
        }
      </Text>
      {searchQuery ? (
        <TouchableOpacity
          onPress={clearSearch}
          style={styles.clearSearchButton}
        >
          <Text style={styles.clearSearchButtonText}>Clear Search</Text>
        </TouchableOpacity>
      ) : activeFilter !== "popular" ? (
        <TouchableOpacity
          onPress={handleCreateEvent}
          style={styles.createButton}
        >
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setActiveFilter("all")}
          style={styles.createButton}
        >
          <Text style={styles.createButtonText}>Browse All Events</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Modern Header with Integrated Search */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>EventiJam</Text>
            <Text style={styles.headerSubtitle}>{filterInfo.subtitle}</Text>
          </View>
          
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={styles.profileButton}
            >
              <User size={22} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact Search Bar in Header */}
        <View style={styles.headerSearchContainer}>
          <View style={[
            styles.headerSearchInputContainer,
            searchInputFocused && styles.headerSearchInputContainerFocused
          ]}>
            <Search size={18} color="#6b7280" style={styles.headerSearchIcon} />
            <TextInput
              style={styles.headerSearchInput}
              placeholder="Search events..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={handleSearchFocus}
              //onBlur={handleSearchBlur}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.headerSearchClearButton}
              >
                <X size={14} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            onPress={handleJoinEvent}
            style={styles.secondaryActionButton}
          >
            <QrCode size={18} color="#6366f1" />
            <Text style={styles.secondaryActionButtonText}>Join Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleCreateEvent}
            style={styles.primaryActionButton}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Suggestions (positioned below header) */}
      {showSearchSuggestions && searchSuggestions.length > 0 && (
        <View style={styles.searchSuggestionsContainer}>
          <FlatList
            data={searchSuggestions}
            renderItem={renderSearchSuggestion}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Enhanced Filter Tabs with Popular */}
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
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter("popular")}
          style={[
            styles.filterTab,
            activeFilter === "popular" && styles.activeFilterTab,
            activeFilter === "popular" && styles.popularFilterTab,
          ]}
        >
          <View style={styles.filterTabContent}>
            <TrendingUp size={14} color={activeFilter === "popular" ? "#ffffff" : "#f59e0b"} />
            <Text
              style={[
                styles.filterText,
                activeFilter === "popular" && styles.activeFilterText,
                activeFilter === "popular" && styles.popularFilterText,
              ]}
            >
              Popular
            </Text>
          </View>
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

      {/* Search Results Count */}
      {searchQuery && (
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsText}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </Text>
        </View>
      )}

      {/* Popular Events Header Info */}
      {activeFilter === "popular" && !searchQuery && !isLoading && (
        <View style={styles.popularEventsHeader}>
          <Text style={styles.popularEventsHeaderText}>
            🔥 Trending events with the most attendees
          </Text>
        </View>
      )}

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
            <Text style={styles.loadingText}>
              {activeFilter === "popular" ? "Finding popular events..." : "Loading events..."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
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
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      {/* Floating Feedback Button */}
      <TouchableOpacity
        onPress={openFeedbackModal}
        style={styles.floatingFeedbackButton}
        activeOpacity={0.8}
      >
        <MessageCircle size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeFeedbackModal}
      >
        <KeyboardAvoidingView 
          style={styles.feedbackModalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.feedbackModalContent}>
            {/* Modal Header */}
            <View style={styles.feedbackModalHeader}>
              <Text style={styles.feedbackModalTitle}>Send Feedback</Text>
              <TouchableOpacity
                onPress={closeFeedbackModal}
                style={styles.feedbackCloseButton}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Feedback Type Selection */}
            <View style={styles.feedbackTypeContainer}>
              <Text style={styles.feedbackTypeLabel}>Feedback Type:</Text>
              <View style={styles.feedbackTypeButtons}>
                {[
                  { key: "general", label: "General" },
                  { key: "bug", label: "Bug Report" },
                  { key: "feature", label: "Feature Request" }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    onPress={() => setFeedbackType(type.key as any)}
                    style={[
                      styles.feedbackTypeButton,
                      feedbackType === type.key && styles.feedbackTypeButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.feedbackTypeButtonText,
                      feedbackType === type.key && styles.feedbackTypeButtonTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Feedback Text Input */}
            <View style={styles.feedbackTextContainer}>
              <Text style={styles.feedbackTextLabel}>Your Feedback:</Text>
              <TextInput
                style={styles.feedbackTextInput}
                multiline
                numberOfLines={6}
                placeholder="Tell us what you think! Your feedback helps us improve the app."
                placeholderTextColor="#9ca3af"
                value={feedbackText}
                onChangeText={setFeedbackText}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={submitFeedback}
              disabled={isSubmittingFeedback || !feedbackText.trim()}
              style={[
                styles.feedbackSubmitButton,
                (isSubmittingFeedback || !feedbackText.trim()) && styles.feedbackSubmitButtonDisabled
              ]}
            >
              {isSubmittingFeedback ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send size={16} color="#FFFFFF" />
                  <Text style={styles.feedbackSubmitButtonText}>Send Feedback</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}