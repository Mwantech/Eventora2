import apiClient from '../utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Profile interfaces
export interface UserProfile {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  profileImage?: string;
  profileImagePublicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  eventsCount: number;
  uploadsCount: number;
}

export interface UpdateProfileData {
  name?: string;
  profileImage?: string;
}

// Helper function to validate Cloudinary URLs
const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

// Helper function to handle profile image URLs
const processProfileImageUrl = (imagePath: string | undefined): string | undefined => {
  if (!imagePath) return undefined;
  
  // If it's already a Cloudinary URL, return as is
  if (isCloudinaryUrl(imagePath)) {
    console.log('Using Cloudinary URL:', imagePath);
    return imagePath;
  }
  
  // If it's a full HTTP/HTTPS URL (but not Cloudinary), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Using external URL:', imagePath);
    return imagePath;
  }
  
  // Legacy support for local file paths (shouldn't happen with Cloudinary)
  console.warn('Received non-Cloudinary image path:', imagePath);
  
  // For backwards compatibility with old local uploads
  const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.161.217:5500';
  
  if (imagePath.startsWith('/uploads')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  if (imagePath.startsWith('uploads')) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Get current user info from storage
export const getAuthState = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userJson = await AsyncStorage.getItem('user');
    
    console.log('Auth token available:', !!token);
    console.log('User data available:', !!userJson);
    
    if (!token || !userJson) {
      return { user: null, token: null, isAuthenticated: false };
    }
    
    const user = JSON.parse(userJson);
    return { user, token, isAuthenticated: true };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return { user: null, token: null, isAuthenticated: false };
  }
};

// Map MongoDB _id to id for frontend consistency and process image URLs
const mapUserProfile = (user: any): UserProfile => {
  if (!user) return user;
  
  // If user has _id but no id, create an id property from _id
  const mappedUser = user._id && !user.id ? { ...user, id: user._id } : user;
  
  // Process profile image URL
  if (mappedUser.profileImage) {
    const originalUrl = mappedUser.profileImage;
    mappedUser.profileImage = processProfileImageUrl(mappedUser.profileImage);
    
    // Log URL processing for debugging
    if (originalUrl !== mappedUser.profileImage) {
      console.log(`Profile image URL processed: ${originalUrl} -> ${mappedUser.profileImage}`);
    }
  }
  
  return mappedUser;
};

// Upload profile image to Cloudinary via backend
export const uploadProfileImage = async (imageUri: string): Promise<string> => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Extract filename from URI or create a unique one
    const filename = imageUri.split('/').pop() || `profile_image_${Date.now()}.jpg`;
    
    // Get the file extension from the original filename
    const fileExtension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Determine MIME type based on file extension
    let mimeType = 'image/jpeg';
    switch (fileExtension) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      default:
        mimeType = 'image/jpeg';
    }
    
    // Append the image file to FormData
    formData.append('profileImage', {
      uri: imageUri,
      type: mimeType,
      name: filename,
    } as any);

    console.log('Uploading profile image to Cloudinary:', { 
      uri: imageUri, 
      type: mimeType, 
      name: filename 
    });

    const response = await apiClient.post('/auth/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Profile image upload response:', response.data);

    // Extract the Cloudinary URL from response
    const cloudinaryUrl = response.data.profileImageUrl || response.data.imageUrl || response.data.url;
    
    if (!cloudinaryUrl) {
      throw new Error('No image URL returned from server');
    }

    console.log('Profile image uploaded to Cloudinary:', cloudinaryUrl);
    return cloudinaryUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    // Provide more specific error messages
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

// Delete profile image from Cloudinary
export const deleteProfileImage = async (): Promise<void> => {
  try {
    console.log('Deleting profile image from Cloudinary');
    
    const response = await apiClient.delete('/auth/profile-image');
    
    console.log('Profile image deletion response:', response.data);
    
    // Update local storage to remove profile image
    const authState = await getAuthState();
    if (authState.user) {
      const updatedUser = { ...authState.user, profileImage: undefined };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  } catch (error) {
    console.error('Error deleting profile image:', error);
    throw error;
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    console.log('Fetching current user profile');
    
    const response = await apiClient.get('/auth/me');
    const user = response.data.data || response.data;
    
    console.log('Raw current user profile data:', user);
    
    // Map _id to id for the user profile and process image URLs
    const mappedUser = user ? mapUserProfile(user) : null;
    
    console.log('Mapped current user profile:', mappedUser);
    
    return mappedUser;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

// Get user profile by ID
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    // Backend only has /api/auth/me endpoint, not individual user profiles
    if (!userId) {
      return await getCurrentUserProfile();
    }
    
    // If requesting current user's profile
    const authState = await getAuthState();
    if (authState.user && (userId === authState.user.id || userId === authState.user._id)) {
      return await getCurrentUserProfile();
    }
    
    // For other users, we don't have an endpoint yet
    console.warn('Backend does not support fetching other users profiles yet');
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Get user stats
export const getUserStats = async (userId?: string): Promise<UserStats> => {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const authState = await getAuthState();
      if (!authState.user) {
        console.error('No authenticated user found for stats');
        throw new Error('Authentication required');
      }
      userId = authState.user.id || authState.user._id;
    }
    
    // Check if userId is valid before making the request
    if (!userId) {
      console.error('Error: userId is undefined or null');
      throw new Error('User ID is required');
    }
    
    console.log('Fetching stats for user ID:', userId);
    
    // Use correct backend endpoint
    const response = await apiClient.get(`/auth/${userId}/stats`);
    
    // FIX: Access the nested data object from the response
    const responseData = response.data;
    console.log('Raw API response:', responseData);
    
    // Check if the response has the expected structure
    if (!responseData.success || !responseData.data) {
      throw new Error('Invalid response format from server');
    }
    
    const statsData = responseData.data; // This contains the actual user data with stats
    console.log('Extracted stats data:', statsData);
    
    // Map to match backend response structure
    const mappedStats: UserStats = {
      eventsCount: statsData.eventsCount || 0,
      uploadsCount: statsData.uploadsCount || 0,
    };
    
    console.log('Mapped user stats:', mappedStats);
    
    return mappedStats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    // If stats endpoint doesn't exist, return mock data for development
    if (error.response?.status === 404) {
      console.log('Stats endpoint not found, returning mock data');
      return {
        eventsCount: Math.floor(Math.random() * 10),
        uploadsCount: Math.floor(Math.random() * 50),
      };
    }
    
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (updateData: UpdateProfileData): Promise<UserProfile> => {
  try {
    console.log('Updating user profile with data:', updateData);
    
    const response = await apiClient.put('/auth/updateprofile', updateData);
    const user = response.data.data || response.data;
    
    console.log('Updated user profile response:', user);
    
    // Map _id to id for the updated user profile and process image URLs
    const mappedUser = mapUserProfile(user);
    
    console.log('Mapped updated user profile:', mappedUser);
    
    // Update local storage with new user data
    await AsyncStorage.setItem('user', JSON.stringify(mappedUser));
    
    return mappedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    console.log('Logging out user');
    
    // Call backend logout endpoint
    await apiClient.get('/auth/logout');
    
    // Clear local storage
    await AsyncStorage.multiRemove(['token', 'user']);
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error logging out:', error);
    
    // Even if backend fails, clear local storage
    await AsyncStorage.multiRemove(['token', 'user']);
    
    throw error;
  }
};

// Get user's activity/recent actions
export const getUserActivity = async (userId?: string, limit: number = 10): Promise<any[]> => {
  try {
    console.log('Backend does not have user activity endpoint yet');
    
    // Return empty array since endpoint doesn't exist
    return [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
};

// Change user password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    console.log('Changing user password');
    
    await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    
    console.log('Password changed successfully');
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Refresh auth token
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    console.log('Backend does not have token refresh endpoint yet');
    return null;
  } catch (error) {
    console.error('Error refreshing auth token:', error);
    
    // If refresh fails, clear stored token
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    
    throw error;
  }
};

// Utility function to generate optimized image URLs from Cloudinary
export const getOptimizedImageUrl = (imageUrl: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
} = {}): string => {
  if (!imageUrl || !isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  try {
    // Extract the public ID from the Cloudinary URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return imageUrl;
    }

    // Build transformation string
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    // Add default optimizations if none specified
    if (transformations.length === 0) {
      transformations.push('q_auto', 'f_auto');
    }

    // Insert transformations into URL
    const beforeUpload = urlParts.slice(0, uploadIndex + 1);
    const afterUpload = urlParts.slice(uploadIndex + 1);
    
    const optimizedUrl = [
      ...beforeUpload,
      transformations.join(','),
      ...afterUpload
    ].join('/');

    console.log('Generated optimized image URL:', optimizedUrl);
    return optimizedUrl;
  } catch (error) {
    console.error('Error generating optimized image URL:', error);
    return imageUrl;
  }
};

// Generate thumbnail URL for profile images
export const getProfileImageThumbnail = (imageUrl: string, size: number = 150): string => {
  return getOptimizedImageUrl(imageUrl, {
    width: size,
    height: size,
    quality: 'auto',
    format: 'auto'
  });
};