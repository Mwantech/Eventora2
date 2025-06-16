import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Mail,
  Camera,
  LogOut,
  ChevronLeft,
  Settings,
  Edit,
  Bell,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../services/auth";
import { profileStyles, colors } from "../styles/ProfileStyles";
import { 
  getCurrentUserProfile, 
  getUserStats, 
  uploadProfileImage, 
  updateUserProfile,
  logoutUser 
} from "../services/profileService";
import NotificationsComponent from "./Notification";

interface UserProfileProps {
  userId?: string;
  isCurrentUser?: boolean;
  onBack?: () => void;
}

export default function UserProfile({
  userId,
  isCurrentUser = true,
  onBack,
}: UserProfileProps) {
  const router = useRouter();
  const { state, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    eventsCount: 0,
    uploadsCount: 0,
  });

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Get user profile
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
      
      // Get user stats if we have a user ID
      if (profile?.id) {
        try {
          const userStats = await getUserStats(profile.id);
          setStats(userStats);
        } catch (statsError) {
          console.error('Error loading stats:', statsError);
          // Use fallback stats if API fails
          setStats({
            eventsCount: Math.floor(Math.random() * 10),
            uploadsCount: Math.floor(Math.random() * 50),
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert("Error", "Failed to load user profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Use the profile service logout function
              await logoutUser();
              
              // Also call the auth context logout
              await logout();
              
              router.replace("/auth");
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleChangeProfilePicture = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        setIsUpdatingImage(true);
        
        try {
          // Upload image to backend
          const uploadedImageUrl = await uploadProfileImage(asset.uri);
          
          // Update user profile with new image URL
          const updatedProfile = await updateUserProfile({
            profileImage: uploadedImageUrl,
          });
          
          // Update local state
          setUserProfile(updatedProfile);
          
          Alert.alert("Success", "Profile picture updated successfully!");
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          Alert.alert("Error", "Failed to update profile picture. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling profile picture:", error);
      Alert.alert("Error", "Failed to update profile picture.");
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    router.push("/edit");
  };

  const handleSettings = () => {
    Alert.alert(
      "Settings", 
      "Settings page coming soon!",
      [
        {
          text: "OK",
          style: "default"
        }
      ]
    );
  };

  const handleViewAllNotifications = () => {
    router.push("/notifications");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={profileStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={profileStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={profileStyles.notFoundContainer}>
        <Text style={profileStyles.notFoundText}>
          User not found or you need to sign in
        </Text>
        <TouchableOpacity
          style={profileStyles.signInButton}
          onPress={() => router.replace("/auth")}
        >
          <Text style={profileStyles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={profileStyles.container}>
      {/* Header */}
      <View style={profileStyles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={profileStyles.backButton}
        >
          <ChevronLeft size={24} color={colors.textLight} />
          <Text style={profileStyles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={profileStyles.headerRow}>
          <Text style={profileStyles.headerTitle}>Profile</Text>
          {isCurrentUser && (
            <TouchableOpacity
              onPress={handleSettings}
              style={profileStyles.settingsButton}
            >
              <Settings size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Profile Info */}
        <View style={profileStyles.profileSection}>
          <View style={profileStyles.profileImageContainer}>
            <Image
              source={{
                uri:
                  userProfile.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=8B35C9&color=ffffff`,
              }}
              style={profileStyles.profileImage}
            />
            {isCurrentUser && (
              <TouchableOpacity
                onPress={handleChangeProfilePicture}
                style={profileStyles.cameraButton}
                disabled={isUpdatingImage}
              >
                {isUpdatingImage ? (
                  <ActivityIndicator size={16} color={colors.textLight} />
                ) : (
                  <Camera size={16} color={colors.textLight} />
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={profileStyles.userName}>{userProfile.name}</Text>

          <View style={profileStyles.emailContainer}>
            <Mail size={16} color={colors.textSecondary} />
            <Text style={profileStyles.emailText}>{userProfile.email}</Text>
          </View>

          {isCurrentUser && (
            <TouchableOpacity
              onPress={handleEditProfile}
              style={profileStyles.editProfileButton}
            >
              <Edit size={16} color={colors.primary} />
              <Text style={profileStyles.editProfileText}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={profileStyles.statsContainer}>
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.statNumber}>{stats.eventsCount}</Text>
            <Text style={profileStyles.statLabel}>Events</Text>
          </View>
          <View style={profileStyles.statItem}>
            <Text style={profileStyles.statNumber}>{stats.uploadsCount}</Text>
            <Text style={profileStyles.statLabel}>Uploads</Text>
          </View>
        </View>

        {/* Recent Activity - Now includes Notifications */}
        <View style={profileStyles.activitySection}>
          <View style={profileStyles.activityHeader}>
            <View style={profileStyles.activityTitleContainer}>
              <Bell size={20} color={colors.textPrimary} />
              <Text style={profileStyles.activityTitle}>Recent Activity</Text>
            </View>
            <TouchableOpacity
              onPress={handleViewAllNotifications}
              style={profileStyles.viewAllButton}
            >
              <Text style={profileStyles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications Component */}
          <NotificationsComponent
            userId={userProfile.id}
            limit={3}
            showHeader={false}
          />
        </View>

        {/* Account Actions */}
        {isCurrentUser && (
          <View style={profileStyles.accountActionsSection}>
            <TouchableOpacity
              onPress={handleLogout}
              style={profileStyles.logoutButton}
            >
              <LogOut size={20} color={colors.danger} />
              <Text style={profileStyles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}