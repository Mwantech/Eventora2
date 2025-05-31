import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Clock, MapPin, Upload } from 'lucide-react-native';
import { getEventById, updateEvent } from '../../services/eventService';
import { useAuth } from '../../services/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { editStyles, screenBreakpoints, iconColors } from '../../styles/EditStyles';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state: authState } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  // Date and time objects for pickers
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Focus states for inputs
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Fetch event data
  useEffect(() => {
    if (!authState.isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "You need to log in to edit events",
        [
          { text: "OK", onPress: () => router.replace("/auth") }
        ]
      );
      return;
    }
    
    if (id) {
      fetchEvent();
    } else {
      setError("Event ID is missing");
      setIsLoading(false);
    }
  }, [id, authState.isAuthenticated]);

  const fetchEvent = async () => {
    try {
      const eventData = await getEventById(id as string);
      
      if (eventData) {
        // Set form data
        setName(eventData.name || '');
        setDescription(eventData.description || '');
        setDate(eventData.date || '');
        setTime(eventData.time || '');
        setLocation(eventData.location || '');
        setIsPrivate(eventData.isPrivate || false);
        setCoverImage(eventData.coverImage || null);
        
        // If we have a date string, try to parse it for the date picker
        if (eventData.date) {
          try {
            const parsedDate = new Date(eventData.date);
            if (!isNaN(parsedDate.getTime())) {
              setSelectedDate(parsedDate);
            }
          } catch (err) {
            console.error("Error parsing date:", err);
          }
        }
        
        // If we have a time string, try to parse it for the time picker
        if (eventData.time) {
          try {
            // Parse time like "7:00 PM"
            const timeRegex = /(\d+):(\d+)\s*(AM|PM)?/i;
            const match = eventData.time.match(timeRegex);
            
            if (match) {
              const hours = parseInt(match[1]);
              const minutes = parseInt(match[2]);
              const period = match[3]?.toUpperCase();
              
              const timeDate = new Date();
              let adjustedHours = hours;
              
              // Handle 12-hour format if AM/PM is provided
              if (period) {
                if (period === 'PM' && hours < 12) {
                  adjustedHours += 12;
                } else if (period === 'AM' && hours === 12) {
                  adjustedHours = 0;
                }
              }
              
              timeDate.setHours(adjustedHours, minutes);
              setSelectedTime(timeDate);
            }
          } catch (err) {
            console.error("Error parsing time:", err);
          }
        }
      } else {
        setError("Event not found");
      }
    } catch (err: any) {
      console.error("Error fetching event:", err);
      setError(err.message || "Failed to load event");
    } finally {
      setIsLoading(false);
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
      
      setDate(formattedDate);
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
      
      setTime(formattedTime);
    }
  };

  const handleSave = async () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert("Error", "Event name is required");
      return;
    }
    
    try {
      setIsSaving(true);
      
      const updatedEvent = {
        name,
        description,
        date,
        time,
        location,
        isPrivate,
        coverImage
      };
      
      await updateEvent(id as string, updatedEvent);
      
      // Show success message with proper redirection
      Alert.alert(
        "Success",
        "Event updated successfully",
        [
          { 
            text: "OK", 
            onPress: () => {
              // First navigate to the event view screen
              // Use replace instead of push to prevent stacking screens
              router.replace(`/event/${id}`);
            }
          }
        ]
      );
    } catch (err: any) {
      console.error("Error updating event:", err);
      
      if (err.response && err.response.status === 401) {
        Alert.alert(
          "Authentication Required",
          "Your session has expired. Please log in again.",
          [
            { text: "OK", onPress: () => router.replace("/auth") }
          ]
        );
      } else {
        Alert.alert(
          "Error",
          err.message || "Failed to update event"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Placeholder for image upload - would need to implement with proper image picker
  const handleImageUpload = () => {
    Alert.alert(
      "Upload Image",
      "Image upload functionality would be implemented here",
      [{ text: "OK" }]
    );
  };

  if (isLoading) {
    return (
      <View style={editStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={editStyles.errorContainer}>
        <Text style={editStyles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={editStyles.errorButton}
        >
          <Text style={editStyles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={editStyles.container}>
      {/* Header */}
      <View style={editStyles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={editStyles.backButton}
        >
          <ChevronLeft size={24} color="#8b5cf6" />
        </TouchableOpacity>
        <Text style={editStyles.headerTitle}>Edit Event</Text>
      </View>
      
      <ScrollView style={editStyles.scrollContainer}>
        {/* Cover Image */}
        <View style={editStyles.coverImageContainer}>
          <Text style={editStyles.label}>Cover Image</Text>
          <TouchableOpacity
            onPress={handleImageUpload}
            style={editStyles.coverImageButton}
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                style={editStyles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={editStyles.uploadPlaceholder}>
                <Upload size={32} color="#8b5cf6" />
                <Text style={editStyles.uploadText}>Tap to upload image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Event Name */}
        <View style={editStyles.formSection}>
          <Text style={editStyles.requiredLabel}>Event Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter event name"
            placeholderTextColor="#9ca3af"
            style={[
              editStyles.textInput,
              focusedInput === 'name' && editStyles.textInputFocused
            ]}
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
        
        {/* Description */}
        <View style={editStyles.formSection}>
          <Text style={editStyles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your event"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            style={[
              editStyles.textInputMultiline,
              focusedInput === 'description' && editStyles.textInputFocused
            ]}
            onFocus={() => setFocusedInput('description')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
        
        {/* Date */}
        <View style={editStyles.formSection}>
          <Text style={editStyles.label}>Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={editStyles.dateTimeButton}
          >
            <Calendar size={20} color="#6b7280" />
            <Text style={date ? editStyles.dateTimeText : editStyles.dateTimePlaceholder}>
              {date || "Select date"}
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
        
        {/* Time */}
        <View style={editStyles.formSection}>
          <Text style={editStyles.label}>Time</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={editStyles.dateTimeButton}
          >
            <Clock size={20} color="#6b7280" />
            <Text style={time ? editStyles.dateTimeText : editStyles.dateTimePlaceholder}>
              {time || "Select time"}
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
        
        {/* Location */}
        <View style={editStyles.formSection}>
          <Text style={editStyles.label}>Location</Text>
          <View style={editStyles.locationContainer}>
            <MapPin size={20} color="#6b7280" />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Add location"
              placeholderTextColor="#9ca3af"
              style={editStyles.locationInput}
            />
          </View>
        </View>
        
        {/* Privacy Setting */}
        <View style={editStyles.privacyContainer}>
          <Text style={editStyles.privacyLabel}>Private Event</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#d1d5db"
          />
        </View>
        
        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={[
            editStyles.saveButton,
            isSaving && editStyles.saveButtonDisabled
          ]}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={editStyles.saveButtonText}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}