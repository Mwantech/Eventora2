import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Image as ImageIcon,
  ChevronLeft,
  Lock,
  Globe,
  QrCode,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent, uploadEventImage } from "../services/eventService";
import { eventCreationStyles, colors } from "../styles/eventCreationStyles";

interface EventCreationProps {
  onBack?: () => void;
  onEventCreated?: (eventId: string) => void;
}

export default function EventCreation({
  onBack,
  onEventCreated,
}: EventCreationProps) {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Date and time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleSelectCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setSelectedDate(selectedDate);
      
      // Format date for display
      const formattedDate = selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      setEventDate(formattedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    
    if (selectedTime) {
      setSelectedTime(selectedTime);
      
      // Format time for display
      const formattedTime = selectedTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      setEventTime(formattedTime);
    }
  };

  const handleCreateEvent = async () => {
    // Basic validation
    if (!eventName) {
      Alert.alert("Error", "Please enter an event name");
      return;
    }

    if (!eventDate) {
      Alert.alert("Error", "Please enter an event date");
      return;
    }

    setIsLoading(true);

    try {
      let uploadedImageUrl = null;

      // Upload cover image first if selected
      if (coverImage) {
        try {
          uploadedImageUrl = await uploadEventImage(coverImage);
          console.log("Image uploaded:", uploadedImageUrl);
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          Alert.alert("Warning", "Failed to upload cover image, but event will be created without it.");
        }
      }

      // Create event data object
      const eventData = {
        name: eventName,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        description: eventDescription,
        isPrivate,
        coverImage: uploadedImageUrl, // Use the uploaded image URL
      };

      // Create the event using the service
      const newEvent = await createEvent(eventData);
      console.log("Event created:", newEvent);

      // Show success message
      Alert.alert(
        "Success",
        "Event created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Call the onEventCreated callback if provided
              if (onEventCreated) {
                onEventCreated(newEvent.id);
              } else {
                // Navigate to the event page
                router.push(`/event/${newEvent.id}`);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={eventCreationStyles.container}
    >
      <View style={eventCreationStyles.innerContainer}>
        {/* Header */}
        <View style={eventCreationStyles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={eventCreationStyles.backButton}
          >
            <ChevronLeft size={24} color={colors.textLight} />
            <Text style={eventCreationStyles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={eventCreationStyles.headerTitle}>Create Event</Text>
        </View>

        <ScrollView style={eventCreationStyles.scrollView}>
          {/* Cover Image */}
          <TouchableOpacity
            onPress={handleSelectCoverImage}
            style={eventCreationStyles.coverImageContainer}
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                style={eventCreationStyles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={eventCreationStyles.coverImagePlaceholder}>
                <ImageIcon size={40} color={colors.primary} />
                <Text style={eventCreationStyles.coverImagePlaceholderText}>
                  Add Cover Image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Event Name */}
          <View style={eventCreationStyles.fieldContainer}>
            <Text style={eventCreationStyles.fieldLabel}>
              Event Name<Text style={eventCreationStyles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={eventCreationStyles.textInput}
              placeholder="Enter event name"
              placeholderTextColor={colors.placeholder}
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          {/* Event Date */}
          <View style={eventCreationStyles.fieldContainer}>
            <Text style={eventCreationStyles.fieldLabel}>
              Date<Text style={eventCreationStyles.requiredAsterisk}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={eventCreationStyles.inputWithIcon}
            >
              <Calendar size={20} color={colors.primary} />
              <Text style={[
                eventCreationStyles.inputWithIconText,
                { color: eventDate ? colors.text : colors.placeholder }
              ]}>
                {eventDate || "Select date"}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Event Time */}
          <View style={eventCreationStyles.fieldContainer}>
            <Text style={eventCreationStyles.fieldLabel}>Time</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={eventCreationStyles.inputWithIcon}
            >
              <Clock size={20} color={colors.primary} />
              <Text style={[
                eventCreationStyles.inputWithIconText,
                { color: eventTime ? colors.text : colors.placeholder }
              ]}>
                {eventTime || "Select time"}
              </Text>
            </TouchableOpacity>
            
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>

          {/* Event Location */}
          <View style={eventCreationStyles.fieldContainer}>
            <Text style={eventCreationStyles.fieldLabel}>Location</Text>
            <View style={eventCreationStyles.inputWithIcon}>
              <MapPin size={20} color={colors.primary} />
              <TextInput
                style={eventCreationStyles.inputWithIconText}
                placeholder="Enter location"
                placeholderTextColor={colors.placeholder}
                value={eventLocation}
                onChangeText={setEventLocation}
              />
            </View>
          </View>

          {/* Event Description */}
          <View style={eventCreationStyles.fieldContainer}>
            <Text style={eventCreationStyles.fieldLabel}>Description</Text>
            <TextInput
              style={eventCreationStyles.multilineInput}
              placeholder="Describe your event"
              placeholderTextColor={colors.placeholder}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Privacy Setting */}
          <View style={eventCreationStyles.privacyContainer}>
            <Text style={eventCreationStyles.privacyTitle}>Privacy</Text>
            <View style={eventCreationStyles.privacyToggleContainer}>
              <TouchableOpacity
                onPress={() => setIsPrivate(true)}
                style={[
                  eventCreationStyles.privacyToggleButton,
                  isPrivate 
                    ? eventCreationStyles.privacyToggleButtonActive 
                    : eventCreationStyles.privacyToggleButtonInactive
                ]}
              >
                <Lock 
                  size={16} 
                  color={isPrivate ? colors.textLight : colors.primary} 
                />
                <Text
                  style={[
                    eventCreationStyles.privacyToggleText,
                    isPrivate 
                      ? eventCreationStyles.privacyToggleTextActive 
                      : eventCreationStyles.privacyToggleTextInactive
                  ]}
                >
                  Private
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsPrivate(false)}
                style={[
                  eventCreationStyles.privacyToggleButton,
                  !isPrivate 
                    ? eventCreationStyles.privacyToggleButtonActive 
                    : eventCreationStyles.privacyToggleButtonInactive
                ]}
              >
                <Globe 
                  size={16} 
                  color={!isPrivate ? colors.textLight : colors.primary} 
                />
                <Text
                  style={[
                    eventCreationStyles.privacyToggleText,
                    !isPrivate 
                      ? eventCreationStyles.privacyToggleTextActive 
                      : eventCreationStyles.privacyToggleTextInactive
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleCreateEvent}
            style={[
              eventCreationStyles.createButton,
              isLoading && eventCreationStyles.createButtonDisabled
            ]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator 
                color={colors.textLight} 
                style={eventCreationStyles.loadingIndicator}
              />
            ) : (
              <Text style={eventCreationStyles.createButtonText}>
                Create Event
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}