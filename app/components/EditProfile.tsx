import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  User,
  Mail,
  Camera,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { editProfileStyles, colors } from "../styles/editProfileStyles";
import {
  getCurrentUserProfile,
  updateUserProfile,
  uploadProfileImage,
  changePassword,
  UserProfile,
} from "../services/profileService";

export default function EditProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    profileImage: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    // Check if there are changes
    const changed = 
      formData.name !== originalData.name ||
      formData.profileImage !== originalData.profileImage;
    setHasChanges(changed);
  }, [formData, originalData]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getCurrentUserProfile();
      
      if (profile) {
        const userData = {
          name: profile.name || "",
          email: profile.email || "",
          profileImage: profile.profileImage || "",
        };
        
        setFormData(userData);
        setOriginalData(userData);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email;
  };

  const validatePasswordForm = () => {
    const newErrors = {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Validate current password
    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    // Validate new password
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    // Validate confirm password
    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !newErrors.currentPassword && !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      Alert.alert("No Changes", "No changes to save.");
      return;
    }

    try {
      setIsSaving(true);

      // Prepare update data (only include changed fields)
      const updateData: any = {};
      
      if (formData.name !== originalData.name) {
        updateData.name = formData.name.trim();
      }
      
      if (formData.profileImage !== originalData.profileImage) {
        updateData.profileImage = formData.profileImage;
      }

      // Update profile
      const updatedProfile = await updateUserProfile(updateData);
      
      Alert.alert(
        "Success",
        "Profile updated successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsChangingPassword(true);
      
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      Alert.alert(
        "Success",
        "Password changed successfully!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to change password. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
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
        
        setIsUploadingImage(true);
        
        try {
          // Upload image to backend
          const uploadedImageUrl = await uploadProfileImage(asset.uri);
          
          // Update form data with new image URL
          setFormData(prev => ({
            ...prev,
            profileImage: uploadedImageUrl,
          }));
          
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          Alert.alert("Error", "Failed to upload profile picture. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling profile picture:", error);
      Alert.alert("Error", "Failed to update profile picture.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              profileImage: "",
            }));
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          {
            text: "Stay",
            style: "cancel",
          },
          {
            text: "Discard Changes",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoading) {
    return (
      <View style={editProfileStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={editProfileStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={editProfileStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={editProfileStyles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={editProfileStyles.backButton}
        >
          <ChevronLeft size={24} color={colors.textLight} />
          <Text style={editProfileStyles.backButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={editProfileStyles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity
          onPress={handleSave}
          style={[
            editProfileStyles.saveButton,
            (!hasChanges || isSaving) && editProfileStyles.saveButtonDisabled
          ]}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size={16} color={colors.textLight} />
          ) : (
            <>
              <Save size={16} color={hasChanges ? colors.textLight : colors.textSecondary} />
              <Text style={[
                editProfileStyles.saveButtonText,
                (!hasChanges || isSaving) && editProfileStyles.saveButtonTextDisabled
              ]}>
                Save
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={editProfileStyles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={editProfileStyles.profileImageSection}>
          <View style={editProfileStyles.profileImageContainer}>
            <Image
              source={{
                uri: formData.profileImage || 
                     `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=8B35C9&color=ffffff`,
              }}
              style={editProfileStyles.profileImage}
            />
            
            {/* Camera/Edit button */}
            <TouchableOpacity
              onPress={handleChangeProfilePicture}
              style={editProfileStyles.cameraButton}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <ActivityIndicator size={16} color={colors.textLight} />
              ) : (
                <Camera size={16} color={colors.textLight} />
              )}
            </TouchableOpacity>

            {/* Remove button (only show if there's a custom image) */}
            {formData.profileImage && (
              <TouchableOpacity
                onPress={handleRemoveProfilePicture}
                style={editProfileStyles.removeButton}
              >
                <X size={14} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={editProfileStyles.changePhotoText}>
            Tap to change profile photo
          </Text>
        </View>

        {/* Form Fields */}
        <View style={editProfileStyles.formSection}>
          {/* Name Field */}
          <View style={editProfileStyles.fieldContainer}>
            <Text style={editProfileStyles.fieldLabel}>Name</Text>
            <View style={[
              editProfileStyles.inputContainer,
              errors.name && editProfileStyles.inputContainerError
            ]}>
              <User size={20} color={colors.textSecondary} style={editProfileStyles.inputIcon} />
              <TextInput
                style={editProfileStyles.textInput}
                value={formData.name}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, name: text }));
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: "" }));
                  }
                }}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {errors.name ? (
              <Text style={editProfileStyles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          {/* Email Field */}
          <View style={editProfileStyles.fieldContainer}>
            <Text style={editProfileStyles.fieldLabel}>Email</Text>
            <View style={[
              editProfileStyles.inputContainer,
              editProfileStyles.inputContainerDisabled
            ]}>
              <Mail size={20} color={colors.textSecondary} style={editProfileStyles.inputIcon} />
              <TextInput
                style={[editProfileStyles.textInput, editProfileStyles.textInputDisabled]}
                value={formData.email}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                editable={false}
                selectTextOnFocus={false}
              />
            </View>
            <Text style={editProfileStyles.fieldNote}>
              Email cannot be changed. Contact support if you need to update your email.
            </Text>
          </View>
        </View>

        {/* Password Change Section */}
        <View style={editProfileStyles.passwordSection}>
          <Text style={editProfileStyles.sectionTitle}>Change Password</Text>
          
          {/* Current Password */}
          <View style={editProfileStyles.fieldContainer}>
            <Text style={editProfileStyles.fieldLabel}>Current Password</Text>
            <View style={[
              editProfileStyles.inputContainer,
              errors.currentPassword && editProfileStyles.inputContainerError
            ]}>
              <Lock size={20} color={colors.textSecondary} style={editProfileStyles.inputIcon} />
              <TextInput
                style={editProfileStyles.textInput}
                value={passwordData.currentPassword}
                onChangeText={(text) => {
                  setPasswordData(prev => ({ ...prev, currentPassword: text }));
                  if (errors.currentPassword) {
                    setErrors(prev => ({ ...prev, currentPassword: "" }));
                  }
                }}
                placeholder="Enter current password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.current}
                returnKeyType="next"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('current')}
                style={editProfileStyles.eyeButton}
              >
                {showPasswords.current ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {errors.currentPassword ? (
              <Text style={editProfileStyles.errorText}>{errors.currentPassword}</Text>
            ) : null}
          </View>

          {/* New Password */}
          <View style={editProfileStyles.fieldContainer}>
            <Text style={editProfileStyles.fieldLabel}>New Password</Text>
            <View style={[
              editProfileStyles.inputContainer,
              errors.newPassword && editProfileStyles.inputContainerError
            ]}>
              <Lock size={20} color={colors.textSecondary} style={editProfileStyles.inputIcon} />
              <TextInput
                style={editProfileStyles.textInput}
                value={passwordData.newPassword}
                onChangeText={(text) => {
                  setPasswordData(prev => ({ ...prev, newPassword: text }));
                  if (errors.newPassword) {
                    setErrors(prev => ({ ...prev, newPassword: "" }));
                  }
                }}
                placeholder="Enter new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.new}
                returnKeyType="next"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('new')}
                style={editProfileStyles.eyeButton}
              >
                {showPasswords.new ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {errors.newPassword ? (
              <Text style={editProfileStyles.errorText}>{errors.newPassword}</Text>
            ) : null}
          </View>

          {/* Confirm Password */}
          <View style={editProfileStyles.fieldContainer}>
            <Text style={editProfileStyles.fieldLabel}>Confirm New Password</Text>
            <View style={[
              editProfileStyles.inputContainer,
              errors.confirmPassword && editProfileStyles.inputContainerError
            ]}>
              <Lock size={20} color={colors.textSecondary} style={editProfileStyles.inputIcon} />
              <TextInput
                style={editProfileStyles.textInput}
                value={passwordData.confirmPassword}
                onChangeText={(text) => {
                  setPasswordData(prev => ({ ...prev, confirmPassword: text }));
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: "" }));
                  }
                }}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.confirm}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('confirm')}
                style={editProfileStyles.eyeButton}
              >
                {showPasswords.confirm ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={editProfileStyles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            onPress={handleChangePassword}
            style={[
              editProfileStyles.changePasswordButton,
              isChangingPassword && editProfileStyles.changePasswordButtonDisabled
            ]}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <>
                <ActivityIndicator size={20} color={colors.textLight} />
                <Text style={editProfileStyles.changePasswordButtonText}>Changing...</Text>
              </>
            ) : (
              <>
                <Lock size={20} color={colors.textLight} />
                <Text style={editProfileStyles.changePasswordButtonText}>
                  Change Password
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Save Button (Mobile-friendly) */}
        <View style={editProfileStyles.saveSection}>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              editProfileStyles.primarySaveButton,
              (!hasChanges || isSaving) && editProfileStyles.primarySaveButtonDisabled
            ]}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size={20} color={colors.textLight} />
                <Text style={editProfileStyles.primarySaveButtonText}>Saving...</Text>
              </>
            ) : (
              <>
                <Save size={20} color={colors.textLight} />
                <Text style={editProfileStyles.primarySaveButtonText}>
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {hasChanges && (
            <TouchableOpacity
              onPress={() => {
                setFormData(originalData);
                setErrors({ name: "", email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
              }}
              style={editProfileStyles.discardButton}
            >
              <Text style={editProfileStyles.discardButtonText}>
                Discard Changes
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}