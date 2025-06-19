import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.API_URL || 'https://eventora.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Add a request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // Ensure the token is properly formatted with Bearer prefix
        const cleanToken = token.trim().replace(/^Bearer\s+/i, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
        
        // Debug token being sent
        console.log('Using token for request:', cleanToken.substring(0, 10) + '...');
        
        // Add debugging for user ID
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          console.log('Request made by user:', user.id || user._id);
        }
      } else {
        console.log('No token available for request');
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Success [${response.config.method}] ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Enhanced error logging with more details
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    const originalRequest = error.config;
    
    // Handle token expiration or authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('Authentication error detected. Clearing token...');
      // Clear the expired token
      await AsyncStorage.removeItem('token');
      
      // Also clear user data
      await AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;