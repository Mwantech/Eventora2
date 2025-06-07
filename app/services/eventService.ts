import apiClient from '../utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Event interface
export interface Event {
  id?: string;
  _id?: string; // Include _id field to handle MongoDB/backend response format
  name: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  isPrivate: boolean;
  coverImage?: string;
  creatorId: string;
  creatorName: string;
  creatorProfileImage?: string;
  participants: number;
  shareLink: string;
  qrCodeUrl: string;
  createdAt: string;
  participantDetails?: any[]; // Add this to store participant information
}

// Helper function to properly handle image URLs
const processImageUrl = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  
  // If it's already a full URL (http/https or Cloudinary URL), return as is
  if (imageUrl.startsWith('http://') || 
      imageUrl.startsWith('https://') || 
      imageUrl.includes('cloudinary.com') ||
      imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }
  
  // For backward compatibility with local uploads, construct full URL
  const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.161.217:5500';
  
  // Handle relative paths
  if (imageUrl.startsWith('/uploads')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  if (imageUrl.startsWith('uploads')) {
    return `${API_BASE_URL}/${imageUrl}`;
  }
  
  // For any other relative path, add both / and base URL
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Get current user info
export const getAuthState = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userJson = await AsyncStorage.getItem('user');
    
    if (!token || !userJson) {
      return { user: null };
    }
    
    const user = JSON.parse(userJson);
    return { user };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return { user: null };
  }
};

// Map MongoDB _id to id for frontend consistency and process image URLs
const mapEventIds = (event: any): Event => {
  if (!event) return event;
  
  // If event has _id but no id, create an id property from _id
  const mappedEvent = event._id && !event.id ? { ...event, id: event._id } : event;
  
  // Process cover image URL
  if (mappedEvent.coverImage) {
    const originalUrl = mappedEvent.coverImage;
    mappedEvent.coverImage = processImageUrl(mappedEvent.coverImage);
    console.log(`Cover image URL: ${originalUrl} -> ${mappedEvent.coverImage}`);
  }
  
  // Process creator profile image URL
  if (mappedEvent.creatorProfileImage) {
    const originalUrl = mappedEvent.creatorProfileImage;
    mappedEvent.creatorProfileImage = processImageUrl(mappedEvent.creatorProfileImage);
    console.log(`Creator profile image URL: ${originalUrl} -> ${mappedEvent.creatorProfileImage}`);
  }
  
  // Process participant profile images if they exist
  if (mappedEvent.participantDetails && Array.isArray(mappedEvent.participantDetails)) {
    mappedEvent.participantDetails = mappedEvent.participantDetails.map((participant: any) => ({
      ...participant,
      userId: participant.userId ? {
        ...participant.userId,
        profileImage: processImageUrl(participant.userId.profileImage)
      } : participant.userId
    }));
  }
  
  return mappedEvent;
};

// Upload event image
export const uploadEventImage = async (imageUri: string): Promise<string> => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Extract filename from URI or create a unique one
    const filename = imageUri.split('/').pop() || `event_image_${Date.now()}.jpg`;
    
    // Get the file extension from the original filename
    const fileExtension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Determine MIME type based on file extension
    let mimeType = 'image/jpeg';
    if (fileExtension === 'png') {
      mimeType = 'image/png';
    } else if (fileExtension === 'gif') {
      mimeType = 'image/gif';
    } else if (fileExtension === 'webp') {
      mimeType = 'image/webp';
    }
    
    // Append the image file to FormData
    formData.append('eventImage', {
      uri: imageUri,
      type: mimeType,
      name: filename,
    } as any);

    console.log('Uploading image:', { uri: imageUri, type: mimeType, name: filename });

    const response = await apiClient.post('/events/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Upload response:', response.data);

    // Return the Cloudinary URL directly (it's already a full URL)
    const imageUrl = response.data.data.imageUrl;
    console.log('Uploaded image URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error uploading event image:', error);
    throw error;
  }
};

// Get all events
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const response = await apiClient.get('/events');
    const events = response.data.data;
    
    console.log('Raw events data:', events);
    
    // Map _id to id for all events and process image URLs
    const mappedEvents = Array.isArray(events) ? events.map(mapEventIds) : [];
    
    console.log('Mapped events with processed image URLs:', mappedEvents);
    
    return mappedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error; // Propagate the error for better handling
  }
};

// Get events by user ID
export const getEventsByUserId = async (
  userId: string,
  filter?: 'created' | 'joined' | 'all',
): Promise<Event[]> => {
  try {
    // Check if userId is valid before making the request
    if (!userId) {
      console.error('Error: userId is undefined or null');
      return [];
    }
    
    const response = await apiClient.get(`/events/user/${userId}`, {
      params: { filter: filter || 'all' }
    });
    const events = response.data.data;
    
    console.log('Raw user events data:', events);
    
    // Map _id to id for all events and process image URLs
    const mappedEvents = Array.isArray(events) ? events.map(mapEventIds) : [];
    
    console.log('Mapped user events with processed image URLs:', mappedEvents);
    
    return mappedEvents;
  } catch (error) {
    console.error('Error fetching events by user ID:', error);
    throw error; // Propagate the error for better handling
  }
};

// Get event by ID
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    // Check if eventId is valid before making the request
    if (!eventId) {
      console.error('Error: eventId is undefined or null');
      return null;
    }
    
    const response = await apiClient.get(`/events/${eventId}`);
    const event = response.data.data;
    
    console.log('Raw event data:', event);
    
    // Map _id to id for the event and process image URLs
    const mappedEvent = event ? mapEventIds(event) : null;
    
    console.log('Mapped event with processed image URLs:', mappedEvent);
    
    return mappedEvent;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error; // Propagate the error for better handling
  }
};

/**
 * Generates a unique shareable link for an event
 * @param {string} eventId - The ID of the event to generate a share link for
 * @returns {Promise<{ token: string }>} - Object containing the share token
 */
export const generateShareLink = async (eventId: string): Promise<{ token: string }> => {
  try {
    const response = await apiClient.post(`/events/${eventId}/share`);
    return response.data.data;
  } catch (error) {
    console.error("Error generating share link:", error);
    throw error;
  }
};

// Get event by share link
export const getEventByShareLink = async (eventId: string, token: string): Promise<Event | null> => {
  try {
    // Check if eventId and token are valid before making the request
    if (!eventId || !token) {
      console.error('Error: eventId or token is undefined or null');
      return null;
    }
    
    const response = await apiClient.get(`/events/share/${eventId}/${token}`);
    const event = response.data.data;
    
    console.log('Raw shared event data:', event);
    
    // Map _id to id for the event and process image URLs
    const mappedEvent = event ? mapEventIds(event) : null;
    
    console.log('Mapped shared event with processed image URLs:', mappedEvent);
    
    return mappedEvent;
  } catch (error) {
    console.error('Error fetching event by share link:', error);
    throw error; // Propagate the error for better handling
  }
};

// Create a new event
export const createEvent = async (
  eventData: Omit<Event, 'id' | '_id' | 'createdAt' | 'participants' | 'shareLink' | 'qrCodeUrl' | 'creatorName' | 'creatorProfileImage'>,
): Promise<Event> => {
  try {
    console.log('Creating event with data:', eventData);
    
    const response = await apiClient.post('/events', eventData);
    
    console.log('Created event response:', response.data);
    
    // Map _id to id for the created event and process image URLs
    const mappedEvent = mapEventIds(response.data.data);
    
    console.log('Mapped created event with processed image URLs:', mappedEvent);
    
    return mappedEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (
  eventId: string,
  eventData: Partial<Event>,
): Promise<Event> => {
  try {
    // Check if eventId is valid before making the request
    if (!eventId) {
      throw new Error('Event ID is required for updating an event');
    }
    
    // Get current user info for debugging
    const userJson = await AsyncStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    console.log('Updating event as user:', user ? {
      id: user.id,
      _id: user._id
    } : 'No user found');
    
    // Ensure user data is available
    if (!user) {
      throw new Error('You must be logged in to update events');
    }
    
    // Log event ID being updated
    console.log('Updating event with ID:', eventId);
    console.log('Update data:', eventData);
    
    // First fetch the current event to verify ownership
    const currentEvent = await getEventById(eventId);
    if (currentEvent) {
      console.log('Event creator ID:', currentEvent.creatorId);
      console.log('Current user ID:', user.id || user._id);
    }
    
    // Make the update request
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    
    console.log('Updated event response:', response.data);
    
    // Map _id to id for the updated event and process image URLs
    const mappedEvent = mapEventIds(response.data.data);
    
    console.log('Mapped updated event with processed image URLs:', mappedEvent);
    
    return mappedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    // Check if eventId is valid before making the request
    if (!eventId) {
      throw new Error('Event ID is required for deleting an event');
    }
    
    await apiClient.delete(`/events/${eventId}`);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Join an event
export const joinEvent = async (eventId: string): Promise<void> => {
  try {
    // Check if eventId is valid before making the request
    if (!eventId) {
      throw new Error('Event ID is required for joining an event');
    }
    
    await apiClient.post(`/events/${eventId}/join`);
  } catch (error) {
    console.error('Error joining event:', error);
    throw error;
  }
};

// Leave an event
export const leaveEvent = async (eventId: string): Promise<void> => {
  try {
    // Check if eventId is valid before making the request
    if (!eventId) {
      throw new Error('Event ID is required for leaving an event');
    }
    
    await apiClient.delete(`/events/${eventId}/leave`);
  } catch (error) {
    console.error('Error leaving event:', error);
    throw error;
  }
};

// Join event via share link
export const joinEventViaShareLink = async (eventId: string, token: string): Promise<Event> => {
  try {
    if (!eventId || !token) {
      throw new Error('Event ID and token are required for joining via share link');
    }
    
    const response = await apiClient.post(`/events/share/${eventId}/${token}/join`);
    
    // Map _id to id for the event and process image URLs
    const mappedEvent = mapEventIds(response.data.data.event);
    
    return mappedEvent;
  } catch (error) {
    console.error('Error joining event via share link:', error);
    throw error;
  }
};