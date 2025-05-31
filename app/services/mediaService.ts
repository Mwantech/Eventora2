import apiClient from '../utils/apiClient';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { VideoExportPreset } from 'expo-video-thumbnails';

// Media interface
export interface MediaItem {
  id?: string;
  _id?: string;
  eventId: string;
  userId: string;
  type: 'image' | 'video';
  filename: string;
  filepath: string;
  url?: string; // Made optional since we'll construct it
  caption?: string;
  tags?: string[];
  likes: number;
  likedBy?: string[];
  uploadedBy?: string;
  uploaderProfileImage?: string;
  createdAt: string;
}

// Map MongoDB _id to id for frontend consistency and add URL
const mapMediaIds = (media: any): MediaItem => {
  if (!media) return media;
  
  // If media has _id but no id, create an id property from _id
  const mappedMedia = media._id && !media.id ? { ...media, id: media._id } : media;
  
  // Construct URL if not provided or if it's incomplete
  if (!mappedMedia.url || !mappedMedia.url.startsWith('http')) {
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:5500';
    // Remove /api from baseURL for static file serving and ensure protocol
    const staticBaseURL = baseURL.replace('/api', '');
    const fullBaseURL = staticBaseURL.startsWith('http') ? staticBaseURL : `http://${staticBaseURL}`;
    mappedMedia.url = `${fullBaseURL}/uploads/media/${mappedMedia.filename}`;
  }
  
  return mappedMedia;
};

// Format timestamp to "X hours/days ago" format
export const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'Just now';
  }
};

// Get all media for an event
export const getEventMedia = async (
  eventId: string, 
  filter?: string,
  sort?: string
): Promise<MediaItem[]> => {
  try {
    // Construct query params for filtering and sorting
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (sort) params.append('sort', sort);
    
    const queryString = params.toString();
    const url = `/events/${eventId}/media${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    const media = response.data.data;
    
    // Map _id to id and add formatted timestamp
    return Array.isArray(media) 
      ? media.map(item => ({
          ...mapMediaIds(item),
          timestamp: formatTimestamp(item.createdAt)
        }))
      : [];
  } catch (error) {
    console.error('Error fetching event media:', error);
    throw error;
  }
};

// Get a single media item by ID
export const getMediaById = async (mediaId: string): Promise<MediaItem | null> => {
  try {
    const response = await apiClient.get(`/media/${mediaId}`);
    const media = response.data.data;
    
    if (media) {
      // Map _id to id and add formatted timestamp
      return {
        ...mapMediaIds(media),
        timestamp: formatTimestamp(media.createdAt)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching media by ID:', error);
    throw error;
  }
};

// Prepare image for upload - resize and compress to reduce upload size
const prepareImageForUpload = async (uri: string): Promise<string> => {
  try {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    // If file is small enough (< 1MB), use it as is
    if (fileInfo.size && fileInfo.size < 1024 * 1024) {
      return uri;
    }
    
    // Resize and compress the image
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Resize to max width of 1200px (keeps aspect ratio)
      { compress: 0.7, format: SaveFormat.JPEG } // 70% quality JPEG
    );
    
    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error preparing image:', error);
    // Return original uri if preparation fails
    return uri;
  }
};

// Prepare video for upload - check size and potentially compress
const prepareVideoForUpload = async (uri: string): Promise<string> => {
  try {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    // If file is too large (> 50MB), we might want to warn the user
    // For now, we'll just return the original URI
    // Video compression is more complex and might require additional libraries
    if (fileInfo.size && fileInfo.size > 50 * 1024 * 1024) {
      console.warn('Video file is large (>50MB). Upload might take some time.');
    }
    
    return uri;
  } catch (error) {
    console.error('Error preparing video:', error);
    // Return original uri if preparation fails
    return uri;
  }
};

// Determine if URI is an image or video based on file extension
const getMediaType = (uri: string): 'image' | 'video' => {
  const extension = uri.split('.').pop()?.toLowerCase();
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic'];
  
  if (extension && videoExtensions.includes(extension)) {
    return 'video';
  } else if (extension && imageExtensions.includes(extension)) {
    return 'image';
  }
  
  // Default to image if we can't determine
  return 'image';
};

// Upload media to an event (supports both images and videos)
export const uploadMedia = async (
  eventId: string,
  mediaUris: string[],
  caption?: string,
  tags?: string[]
): Promise<MediaItem[]> => {
  try {
    // Prepare form data for multipart upload
    const formData = new FormData();
    
    // Add each media file to form data
    for (let i = 0; i < mediaUris.length; i++) {
      const originalUri = mediaUris[i];
      const mediaType = getMediaType(originalUri);
      
      // Prepare the media based on type
      const uri = mediaType === 'image' 
        ? await prepareImageForUpload(originalUri)
        : await prepareVideoForUpload(originalUri);
      
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Get filename from URI
      const filename = uri.split('/').pop() || `${mediaType}-${i}.${fileType}`;
      
      // Determine MIME type
      let mimeType = '';
      if (mediaType === 'image') {
        mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
      } else {
        // Common video MIME types
        const videoMimeTypes: { [key: string]: string } = {
          'mp4': 'video/mp4',
          'mov': 'video/quicktime',
          'avi': 'video/x-msvideo',
          'mkv': 'video/x-matroska',
          'wmv': 'video/x-ms-wmv',
          'flv': 'video/x-flv',
          'webm': 'video/webm',
          'm4v': 'video/x-m4v'
        };
        mimeType = videoMimeTypes[fileType] || 'video/mp4';
      }
      
      // Add to form data (need to handle differences between platforms)
      const file = {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: mimeType
      };
      
      // @ts-ignore - FormData.append expects specific types but React Native's type is different
      formData.append('files', file);
    }
    
    // Add caption if provided
    if (caption) {
      formData.append('caption', caption);
    }
    
    // Add tags if provided
    if (tags && tags.length > 0) {
      // For backend processing, join tags array into a string
      formData.append('tags', tags.join(','));
    }
    
    const response = await apiClient.post(`/events/${eventId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      // Increase timeout for video uploads
      timeout: 120000, // 2 minutes
    });
    
    const uploadedMedia = response.data.data;
    
    // Map _id to id and add formatted timestamp
    return Array.isArray(uploadedMedia)
      ? uploadedMedia.map(media => ({
          ...mapMediaIds(media),
          timestamp: formatTimestamp(media.createdAt)
        }))
      : [];
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

// Like or unlike a media item
export const toggleMediaLike = async (mediaId: string): Promise<MediaItem> => {
  try {
    const response = await apiClient.post(`/media/${mediaId}/like`);
    const media = response.data.data;
    
    return {
      ...mapMediaIds(media),
      timestamp: formatTimestamp(media.createdAt)
    };
  } catch (error) {
    console.error('Error toggling media like:', error);
    throw error;
  }
};

// Update media caption or tags
export const updateMedia = async (
  mediaId: string,
  data: { caption?: string; tags?: string[] }
): Promise<MediaItem> => {
  try {
    const response = await apiClient.put(`/media/${mediaId}`, data);
    const media = response.data.data;
    
    return {
      ...mapMediaIds(media),
      timestamp: formatTimestamp(media.createdAt)
    };
  } catch (error) {
    console.error('Error updating media:', error);
    throw error;
  }
};

// Delete a media item
export const deleteMedia = async (mediaId: string): Promise<void> => {
  try {
    await apiClient.delete(`/media/${mediaId}`);
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
};