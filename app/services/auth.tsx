import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../utils/apiClient';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isEmailVerified?: boolean;
}

// Authentication state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Create auth context
const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string; email: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<{ name: string; profileImage: string }>) => Promise<User>;
  verifyEmail: (email: string, code: string) => Promise<User>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; message: string }>;
}>({
  state: {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  },
  login: async () => ({ id: '', name: '', email: '' }),
  register: async () => ({ success: false, message: '', email: '' }),
  logout: async () => {},
  updateUserProfile: async () => ({ id: '', name: '', email: '' }),
  verifyEmail: async () => ({ id: '', name: '', email: '' }),
  resendVerificationCode: async () => ({ success: false, message: '' })
});

// Export auth state functions for direct use if needed
let authStateListeners: ((state: AuthState) => void)[] = [];

export const getAuthState = async (): Promise<{user: User | null}> => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (!userJson) {
      return { user: null };
    }
    
    const user = JSON.parse(userJson);
    return { user };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return { user: null };
  }
};

export const subscribeToAuthState = (listener: (state: AuthState) => void): (() => void) => {
  authStateListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    authStateListeners = authStateListeners.filter(l => l !== listener);
  };
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Notify listeners when state changes
  useEffect(() => {
    authStateListeners.forEach(listener => listener(state));
  }, [state]);

  // Initialize auth state
  useEffect(() => {
    const loadToken = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Get token from storage
        const token = await AsyncStorage.getItem('token');
        const userJson = await AsyncStorage.getItem('user');
        
        if (!token) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          return;
        }
        
        // If we have a stored user, use it first
        if (userJson) {
          const storedUser = JSON.parse(userJson);
          setState({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
        
        // Then try to refresh user data from server
        try {
          const response = await apiClient.get('/auth/me');
          
          if (response.data.success) {
            const freshUser = response.data.data;
            // Ensure we have id field - MongoDB uses _id
            if (freshUser._id && !freshUser.id) {
              freshUser.id = freshUser._id;
            }
            
            // Save the updated user info to AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(freshUser));
            
            setState({
              user: freshUser,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          }
        } catch (err) {
          console.warn('Could not refresh user data, using stored data');
          // We'll keep using the stored user data and not display an error
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        // Clear invalid token
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };

    loadToken();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Ensure we have id field - MongoDB uses _id
      if (user._id && !user.id) {
        user.id = user._id;
      }
      
      // Save token and user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return user;
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      // Check for email verification requirement
      if (error.response?.data?.emailVerificationRequired) {
        errorMessage = 'Please verify your email address before logging in';
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      throw new Error(errorMessage);
    }
  };

  // Register function - now returns verification info instead of directly logging in
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; email: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));
      
      return {
        success: true,
        message: response.data.message || 'Registration successful! Please check your email for verification.',
        email: email
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      throw new Error(errorMessage);
    }
  };

  // Email verification function
  const verifyEmail = async (email: string, code: string): Promise<User> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.post('/auth/verify-email', {
        email,
        code
      });
      
      const { token, user } = response.data;
      
      // Ensure we have id field - MongoDB uses _id
      if (user._id && !user.id) {
        user.id = user._id;
      }
      
      // Save token and user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      throw new Error(errorMessage);
    }
  };

  // Resend verification code function
  const resendVerificationCode = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/auth/resend-verification', {
        email
      });
      
      return {
        success: true,
        message: response.data.message || 'Verification code sent successfully!'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend verification code';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Call logout endpoint
      await apiClient.get('/auth/logout');
      
      // Clear token and user data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Still clear token and state on error
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  };

  // Update user profile
  const updateUserProfile = async (
    updates: Partial<{ name: string; profileImage: string }>
  ): Promise<User> => {
    try {
      const response = await apiClient.put('/auth/updateprofile', updates);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        
        // Ensure we have id field - MongoDB uses _id
        if (updatedUser._id && !updatedUser.id) {
          updatedUser.id = updatedUser._id;
        }
        
        // Update user data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update auth state
        setState(prev => ({
          ...prev,
          user: updatedUser
        }));
        
        return updatedUser;
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      register, 
      logout, 
      updateUserProfile, 
      verifyEmail, 
      resendVerificationCode 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Export default provider
export default AuthProvider;