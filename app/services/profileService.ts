import apiClient from '../utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Profile interfaces
export interface UserProfile {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  profileImage?: string;
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

// FIXED: Use proper API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.161.217:5500';

// FIXED: Helper function to convert relative image URLs to absolute URLs
const getFullImageUrl = (imagePath: string | undefined): string | undefined => {
  if (!imagePath) return undefined;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // FIXED: Handle relative paths properly
  // If it starts with /uploads, just prepend base URL
  if (imagePath.startsWith('/uploads')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // If it starts with uploads (without /), prepend base URL with /
  if (imagePath.startsWith('uploads')) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  
  // For any other relative path, add both / and base URL
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

// FIXED: Map MongoDB _id to id for frontend consistency and fix image URLs
const mapUserProfile = (user: any): UserProfile => {
  if (!user) return user;
  
  // If user has _id but no id, create an id property from _id
  const mappedUser = user._id && !user.id ? { ...user, id: user._id } : user;
  
  // FIXED: Fix profile image URL with proper logging
  if (mappedUser.profileImage) {
    const originalUrl = mappedUser.profileImage;
    mappedUser.profileImage = getFullImageUrl(mappedUser.profileImage);
    console.log(`Profile image URL mapping: ${originalUrl} -> ${mappedUser.profileImage}`);
  }
  
  return mappedUser;
};

// Upload profile image - UPDATED to match backend endpoint
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
    if (fileExtension === 'png') {
      mimeType = 'image/png';
    } else if (fileExtension === 'gif') {
      mimeType = 'image/gif';
    } else if (fileExtension === 'webp') {
      mimeType = 'image/webp';
    }
    
    // Append the image file to FormData
    formData.append('profileImage', {
      uri: imageUri,
      type: mimeType,
      name: filename,
    } as any);

    console.log('Uploading profile image:', { uri: imageUri, type: mimeType, name: filename });

    const response = await apiClient.post('/auth/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Profile image upload response:', response.data);

    // FIXED: Return the full image URL
    const imageUrl = response.data.profileImageUrl || response.data.imageUrl || response.data.url;
    const fullImageUrl = getFullImageUrl(imageUrl) || imageUrl;
    console.log('Final profile image URL:', fullImageUrl);
    return fullImageUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Get current user profile - UPDATED to match backend endpoint /api/auth/me
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    console.log('Fetching current user profile');
    
    const response = await apiClient.get('/auth/me');
    const user = response.data.data || response.data;
    
    console.log('Raw current user profile data:', user);
    
    // Map _id to id for the user profile and fix image URLs
    const mappedUser = user ? mapUserProfile(user) : null;
    
    console.log('Mapped current user profile with image URLs:', mappedUser);
    
    return mappedUser;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

// Get user profile by ID - Note: Backend doesn't have this endpoint, using current user
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    // Backend only has /api/auth/me endpoint, not individual user profiles
    // So we'll use getCurrentUserProfile for now
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

// Get user stats - UPDATED to match backend endpoint
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
    
    // UPDATED: Use correct backend endpoint /api/users/:userId/stats
    const response = await apiClient.get(`/auth/${userId}/stats`);
    const stats = response.data;
    
    console.log('Raw user stats data:', stats);
    
    // UPDATED: Map to match backend response structure
    const mappedStats: UserStats = {
      eventsCount: stats.eventsCount || 0,
      uploadsCount: stats.uploadsCount || 0,
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

// Update user profile - UPDATED to match backend endpoint
export const updateUserProfile = async (updateData: UpdateProfileData): Promise<UserProfile> => {
  try {
    console.log('Updating user profile with data:', updateData);
    
    // UPDATED: Use correct backend endpoint /api/auth/updateprofile
    const response = await apiClient.put('/auth/updateprofile', updateData);
    const user = response.data.data || response.data;
    
    console.log('Updated user profile response:', user);
    
    // Map _id to id for the updated user profile and fix image URLs
    const mappedUser = mapUserProfile(user);
    
    console.log('Mapped updated user profile with image URLs:', mappedUser);
    
    // Update local storage with new user data
    await AsyncStorage.setItem('user', JSON.stringify(mappedUser));
    
    return mappedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Logout user - UPDATED to match backend endpoint
export const logoutUser = async (): Promise<void> => {
  try {
    console.log('Logging out user');
    
    // UPDATED: Call backend logout endpoint
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

// Get user's activity/recent actions - Backend doesn't have this endpoint yet
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

// Change user password - UPDATED to match new backend endpoint
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

// Refresh auth token - Backend doesn't have this endpoint yet
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