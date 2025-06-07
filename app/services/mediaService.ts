import apiClient from '../utils/apiClient';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Media interface
export interface MediaItem {
  id?: string;
  _id?: string;
  eventId: string;
  userId: string;
  type: 'image' | 'video';
  filename: string;
  filepath: string;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  url?: string; // This will be the Cloudinary URL
  caption?: string;
  tags?: string[];
  likes: number;
  likedBy?: string[];
  uploadedBy?: string;
  uploaderProfileImage?: string;
  createdAt: string;
  timestamp?: string;
}

// Map MongoDB _id to id for frontend consistency and use Cloudinary URL
const mapMediaIds = (media: any): MediaItem => {
  if (!media) return media;
  
  // If media has _id but no id, create an id property from _id
  const mappedMedia = media._id && !media.id ? { ...media, id: media._id } : media;
  
  // Use Cloudinary URL if available, otherwise use filepath
  // Priority: cloudinaryUrl > filepath > constructed URL
  if (mappedMedia.cloudinaryUrl) {
    mappedMedia.url = mappedMedia.cloudinaryUrl;
  } else if (mappedMedia.filepath && mappedMedia.filepath.startsWith('http')) {
    // filepath is already a full URL (likely Cloudinary)
    mappedMedia.url = mappedMedia.filepath;
  } else if (mappedMedia.filepath) {
    // Fallback to filepath if it exists
    mappedMedia.url = mappedMedia.filepath;
  } else {
    // Last resort: construct URL from filename (shouldn't happen with Cloudinary)
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:5500';
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
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else if (weeks > 0) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (days > 0) {
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
  filter?: 'images' | 'videos' | string,
  sort?: 'newest' | 'oldest' | 'popular' | string
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
    
    // If file is small enough (< 2MB), use it as is
    if (fileInfo.size && fileInfo.size < 2 * 1024 * 1024) {
      return uri;
    }
    
    // Resize and compress the image
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 1920 } }], // Resize to max width of 1920px (keeps aspect ratio)
      { compress: 0.8, format: SaveFormat.JPEG } // 80% quality JPEG
    );
    
    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error preparing image:', error);
    // Return original uri if preparation fails
    return uri;
  }
};

// Prepare video for upload - check size and provide warnings
const prepareVideoForUpload = async (uri: string): Promise<string> => {
  try {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    // Check file size and provide warnings
    if (fileInfo.size) {
      const sizeInMB = fileInfo.size / (1024 * 1024);
      
      if (sizeInMB > 50) {
        console.warn(`Video file is ${sizeInMB.toFixed(1)}MB. This exceeds the 50MB limit and may fail to upload.`);
        throw new Error(`Video file is too large (${sizeInMB.toFixed(1)}MB). Maximum size is 50MB.`);
      } else if (sizeInMB > 25) {
        console.warn(`Video file is ${sizeInMB.toFixed(1)}MB. Upload might take some time.`);
      }
    }
    
    return uri;
  } catch (error) {
    console.error('Error preparing video:', error);
    throw error;
  }
};

// Determine if URI is an image or video based on file extension
const getMediaType = (uri: string): 'image' | 'video' => {
  const extension = uri.split('.').pop()?.toLowerCase();
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v', '3gp'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'];
  
  if (extension && videoExtensions.includes(extension)) {
    return 'video';
  } else if (extension && imageExtensions.includes(extension)) {
    return 'image';
  }
  
  // Default to image if we can't determine
  return 'image';
};

// Get file size in a human readable format
const getReadableFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Upload media to an event (supports both images and videos)
export const uploadMedia = async (
  eventId: string,
  mediaUris: string[],
  caption?: string,
  tags?: string[],
  onProgress?: (progress: number) => void
): Promise<MediaItem[]> => {
  try {
    if (!mediaUris || mediaUris.length === 0) {
      throw new Error('No media files provided for upload');
    }

    if (mediaUris.length > 10) {
      throw new Error('Maximum 10 files can be uploaded at once');
    }

    // Prepare form data for multipart upload
    const formData = new FormData();
    
    // Validate and prepare each media file
    const preparedFiles = [];
    for (let i = 0; i < mediaUris.length; i++) {
      const originalUri = mediaUris[i];
      const mediaType = getMediaType(originalUri);
      
      try {
        // Prepare the media based on type
        const uri = mediaType === 'image' 
          ? await prepareImageForUpload(originalUri)
          : await prepareVideoForUpload(originalUri);
        
        preparedFiles.push({ uri, mediaType, originalUri });
      } catch (error) {
        console.error(`Error preparing file ${i + 1}:`, error);
        throw new Error(`Failed to prepare file ${i + 1}: ${error.message}`);
      }
    }
    
    // Add each prepared file to form data
    for (let i = 0; i < preparedFiles.length; i++) {
      const { uri, mediaType } = preparedFiles[i];
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'unknown';
      
      // Get filename from URI
      const filename = uri.split('/').pop() || `${mediaType}-${Date.now()}-${i}.${fileType}`;
      
      // Determine MIME type
      let mimeType = '';
      if (mediaType === 'image') {
        const imageTypes: { [key: string]: string } = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'bmp': 'image/bmp',
          'webp': 'image/webp',
          'heic': 'image/heic',
          'heif': 'image/heif'
        };
        mimeType = imageTypes[fileType.toLowerCase()] || 'image/jpeg';
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
          'm4v': 'video/x-m4v',
          '3gp': 'video/3gpp'
        };
        mimeType = videoMimeTypes[fileType.toLowerCase()] || 'video/mp4';
      }
      
      // Create file object for React Native
      const file = {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: mimeType
      };
      
      // Add to form data
      // @ts-ignore - FormData.append expects specific types but React Native's type is different
      formData.append('files', file);
    }
    
    // Add caption if provided
    if (caption && caption.trim()) {
      formData.append('caption', caption.trim());
    }
    
    // Add tags if provided
    if (tags && tags.length > 0) {
      // Filter out empty tags and join into comma-separated string
      const validTags = tags.filter(tag => tag && tag.trim().length > 0);
      if (validTags.length > 0) {
        formData.append('tags', validTags.join(','));
      }
    }
    
    const response = await apiClient.post(
      `/events/${eventId}/media`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Increase timeout for large uploads
        timeout: 300000, // 5 minutes
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      }
    );
    
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
    
    // Provide more specific error messages
    if (error.response?.status === 413) {
      throw new Error('File size too large. Please reduce file size and try again.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid file format or request');
    } else if (error.response?.status === 403) {
      throw new Error('Not authorized to upload media to this event');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout. Please check your connection and try again.');
    }
    
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
    // Clean up the data before sending
    const cleanData: { caption?: string; tags?: string[] } = {};
    
    if (data.caption !== undefined) {
      cleanData.caption = data.caption.trim();
    }
    
    if (data.tags !== undefined && Array.isArray(data.tags)) {
      // Filter out empty tags
      cleanData.tags = data.tags.filter(tag => tag && tag.trim().length > 0);
    }
    
    const response = await apiClient.put(`/media/${mediaId}`, cleanData);
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

// Check if a URL is accessible (useful for testing Cloudinary URLs)
export const checkMediaUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking media URL:', error);
    return false;
  }
};

// Get media statistics for an event
export const getMediaStats = async (eventId: string): Promise<{
  total: number;
  images: number;
  videos: number;
  totalLikes: number;
}> => {
  try {
    const allMedia = await getEventMedia(eventId);
    
    const stats = {
      total: allMedia.length,
      images: allMedia.filter(m => m.type === 'image').length,
      videos: allMedia.filter(m => m.type === 'video').length,
      totalLikes: allMedia.reduce((sum, m) => sum + (m.likes || 0), 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting media stats:', error);
    return { total: 0, images: 0, videos: 0, totalLikes: 0 };
  }
};