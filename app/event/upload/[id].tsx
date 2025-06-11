import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Camera, X, Upload, Tag, Video, ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Video as ExpoVideo } from 'expo-av';
import { useAuth } from "../../services/auth";
import { getEventById } from "../../services/eventService";
import { uploadMedia } from "../../services/mediaService";
import { uploadStyles } from "../../styles/uploadStyles";

export default function MediaUploadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state: authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;
  
  const [event, setEvent] = useState<any>(null);
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  useEffect(() => {
    if (!id) {
      setError("Event ID is missing");
      setIsLoading(false);
      return;
    }

    if (isAuthenticated) {
      fetchEventDetails();
    } else if (!authState.isLoading) {
      router.replace("/auth");
    }
  }, [id, isAuthenticated, authState.isLoading]);

  const fetchEventDetails = async () => {
    try {
      const eventData = await getEventById(id as string);
      
      if (eventData) {
        setEvent(eventData);
      } else {
        setError("Event not found");
      }
    } catch (err: any) {
      console.error("Error fetching event:", err);
      setError("Failed to load event");
    } finally {
      setIsLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your camera to take photos and videos."
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to select photos and videos."
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia([...selectedMedia, { ...result.assets[0], type: 'image' }]);
    }
  };

  const takeVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia([...selectedMedia, { ...result.assets[0], type: 'video' }]);
    }
  };

  const pickMedia = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    Alert.alert(
      "Select Media Type",
      "What would you like to upload?",
      [
        { text: "Photos Only", onPress: () => pickImages() },
        { text: "Videos Only", onPress: () => pickVideos() },
        { text: "Photos & Videos", onPress: () => pickImagesAndVideos() },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      addSelectedMedia(result.assets.map(asset => ({ ...asset, type: 'image' })));
    }
  };

  const pickVideos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (!result.canceled && result.assets.length > 0) {
      addSelectedMedia(result.assets.map(asset => ({ ...asset, type: 'video' })));
    }
  };

  const pickImagesAndVideos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const mediaWithTypes = result.assets.map(asset => ({
        ...asset,
        type: asset.type === 'video' ? 'video' : 'image'
      }));
      addSelectedMedia(mediaWithTypes);
    }
  };

  const addSelectedMedia = (newMedia: any[]) => {
    // Limit to max 10 files at once (as per backend controller)
    const totalMedia = selectedMedia.length + newMedia.length;
    if (totalMedia > 10) {
      Alert.alert(
        "Too many files",
        "You can upload a maximum of 10 files at once. Please select fewer files."
      );
      // Add only as many as allowed
      const remainingSlots = 10 - selectedMedia.length;
      if (remainingSlots > 0) {
        setSelectedMedia([...selectedMedia, ...newMedia.slice(0, remainingSlots)]);
      }
    } else {
      setSelectedMedia([...selectedMedia, ...newMedia]);
    }
  };

  const removeMedia = (index: number) => {
    const updatedMedia = [...selectedMedia];
    updatedMedia.splice(index, 1);
    setSelectedMedia(updatedMedia);
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Fixed handleUpload function for your MediaUploadScreen component
  const handleUpload = async () => {
    if (selectedMedia.length === 0) {
      Alert.alert("No media selected", "Please select at least one image or video to upload.");
      return;
    }

    // Reset progress states
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFiles(0);
    setTotalFiles(selectedMedia.length);
    setUploadStatus("Preparing files...");
    
    try {
      // Get media URIs from selected media
      const mediaUris = selectedMedia.map(media => media.uri);
      
      // Upload using the mediaService with progress callback
      const uploadedMedia = await uploadMedia(
        id as string,
        mediaUris,
        caption,
        tags,
        (progress) => {
          // Ensure progress is always between 0 and 100
          const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
          setUploadProgress(clampedProgress);
          
          // Calculate how many files should be "completed" based on progress
          // This is an estimation since we get overall progress, not per-file progress
          const estimatedCompletedFiles = Math.floor((clampedProgress / 100) * selectedMedia.length);
          setUploadedFiles(estimatedCompletedFiles);
          
          if (clampedProgress < 100) {
            setUploadStatus(`Uploading... ${clampedProgress}%`);
          } else {
            setUploadStatus("Processing files...");
            setUploadedFiles(selectedMedia.length); // All files completed
          }
        }
      );
      
      // Final state - all files uploaded successfully
      setUploadProgress(100);
      setUploadedFiles(selectedMedia.length);
      setUploadStatus("Upload completed!");
      
      const imageCount = selectedMedia.filter(m => m.type === 'image').length;
      const videoCount = selectedMedia.filter(m => m.type === 'video').length;
      
      let successMessage = `${uploadedMedia.length} media items uploaded successfully.`;
      if (imageCount > 0 && videoCount > 0) {
        successMessage = `${imageCount} photos and ${videoCount} videos uploaded successfully.`;
      } else if (imageCount > 0) {
        successMessage = `${imageCount} ${imageCount === 1 ? 'photo' : 'photos'} uploaded successfully.`;
      } else if (videoCount > 0) {
        successMessage = `${videoCount} ${videoCount === 1 ? 'video' : 'videos'} uploaded successfully.`;
      }
      
      Alert.alert(
        "Upload successful",
        successMessage,
        [
          {
            text: "View Gallery",
            onPress: () => router.push(`/event/gallery/${id}`),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error uploading media:", error);
      setUploadStatus("Upload failed");
      Alert.alert(
        "Upload failed", 
        error.response?.data?.message || error.message || "There was a problem uploading your media."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedFiles(0);
      setUploadStatus("");
    }
  };

  const renderMediaItem = (media: any, index: number) => {
    return (
      <View key={index} style={uploadStyles.mediaItem}>
        {media.type === 'video' ? (
          <View style={uploadStyles.videoContainer}>
            <ExpoVideo
              source={{ uri: media.uri }}
              style={uploadStyles.selectedMedia}
              shouldPlay={false}
              isLooping={false}
              useNativeControls={false}
              resizeMode="cover"
            />
            <View style={uploadStyles.videoOverlay}>
              <Video size={24} color="#ffffff" />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: media.uri }}
            style={uploadStyles.selectedMedia}
          />
        )}
        <TouchableOpacity
          style={uploadStyles.removeMediaButton}
          onPress={() => removeMedia(index)}
        >
          <X size={12} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Fixed renderUploadProgress function
const renderUploadProgress = () => {
  if (!isUploading) return null;

  // Ensure progress is clamped between 0 and 100
  const displayProgress = Math.min(100, Math.max(0, uploadProgress));

  return (
    <View style={uploadStyles.progressContainer}>
      <View style={uploadStyles.progressHeader}>
        <Text style={uploadStyles.progressTitle}>Uploading Files</Text>
        <Text style={uploadStyles.progressSubtitle}>
          {uploadedFiles}/{totalFiles} files • {displayProgress}%
        </Text>
      </View>
      
      <View style={uploadStyles.progressBarContainer}>
        <View 
          style={[
            uploadStyles.progressBar, 
            { width: `${displayProgress}%` }
          ]} 
        />
      </View>
      
      <Text style={uploadStyles.progressStatus}>{uploadStatus}</Text>
      
      {/* Individual file progress indicators */}
      <View style={uploadStyles.fileProgressContainer}>
        {selectedMedia.map((media, index) => {
          // Calculate individual file progress based on overall progress
          const fileProgress = getFileProgress(index, displayProgress, selectedMedia.length);
          
          return (
            <View key={index} style={uploadStyles.fileProgressItem}>
              <View style={uploadStyles.fileProgressThumbnail}>
                {media.type === 'video' ? (
                  <Video size={16} color="#8b5cf6" />
                ) : (
                  <ImageIcon size={16} color="#8b5cf6" />
                )}
              </View>
              <View style={uploadStyles.fileProgressInfo}>
                <Text style={uploadStyles.fileProgressName}>
                  {media.type === 'video' ? 'Video' : 'Image'} {index + 1}
                </Text>
                <View style={uploadStyles.fileProgressBarContainer}>
                  <View 
                    style={[
                      uploadStyles.fileProgressBar,
                      { 
                        width: `${fileProgress}%`,
                        backgroundColor: fileProgress === 100 ? '#10b981' : '#8b5cf6'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

  // Helper function to calculate individual file progress
  const getFileProgress = (fileIndex: number, overallProgress: number, totalFiles: number): number => {
    // Calculate progress per file
    const progressPerFile = 100 / totalFiles;
    const fileStartProgress = fileIndex * progressPerFile;
    const fileEndProgress = (fileIndex + 1) * progressPerFile;
    
    if (overallProgress <= fileStartProgress) {
      // File hasn't started yet
      return 0;
    } else if (overallProgress >= fileEndProgress) {
      // File is complete
      return 100;
    } else {
      // File is in progress
      const fileProgress = ((overallProgress - fileStartProgress) / progressPerFile) * 100;
      return Math.min(100, Math.max(0, Math.round(fileProgress)));
    }
  };

  if (isLoading) {
    return (
      <View style={uploadStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={uploadStyles.errorContainer}>
        <Text style={uploadStyles.errorTitle}>{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={uploadStyles.errorButton}
        >
          <Text style={uploadStyles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={uploadStyles.container}
    >
      <View style={uploadStyles.container}>
        {/* Header */}
        <View style={uploadStyles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={uploadStyles.headerButton}
          >
            <ChevronLeft size={24} color="#8b5cf6" />
          </TouchableOpacity>
          <Text style={uploadStyles.headerTitle}>Upload Media</Text>
        </View>

        <ScrollView style={uploadStyles.scrollContent}>
          {/* Event Info */}
          <View style={uploadStyles.eventInfo}>
            <Text style={uploadStyles.eventTitle}>Event: {event?.name}</Text>
            <Text style={uploadStyles.eventSubtitle}>
              Uploading to: {event?.name || "Current Event"}
            </Text>
          </View>

          {/* Upload Progress - Show when uploading */}
          {renderUploadProgress()}

          {/* Selected Media */}
          {selectedMedia.length > 0 && (
            <View style={uploadStyles.selectedMediaContainer}>
              <Text style={uploadStyles.selectedMediaTitle}>
                Selected Media ({selectedMedia.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={uploadStyles.mediaScrollContainer}>
                  {selectedMedia.map((media, index) => renderMediaItem(media, index))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Upload Options */}
          <View style={uploadStyles.uploadOptionsContainer}>
            <TouchableOpacity
              style={uploadStyles.uploadOption}
              onPress={takePhoto}
              disabled={isUploading}
            >
              <Camera size={20} color={isUploading ? "#9ca3af" : "#8b5cf6"} />
              <Text style={[
                uploadStyles.uploadOptionText,
                { color: isUploading ? "#9ca3af" : "#8b5cf6" }
              ]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={uploadStyles.uploadOption}
              onPress={takeVideo}
              disabled={isUploading}
            >
              <Video size={20} color={isUploading ? "#9ca3af" : "#8b5cf6"} />
              <Text style={[
                uploadStyles.uploadOptionText,
                { color: isUploading ? "#9ca3af" : "#8b5cf6" }
              ]}>Record Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={uploadStyles.uploadOption}
              onPress={pickMedia}
              disabled={isUploading}
            >
              <Upload size={20} color={isUploading ? "#9ca3af" : "#8b5cf6"} />
              <Text style={[
                uploadStyles.uploadOptionText,
                { color: isUploading ? "#9ca3af" : "#8b5cf6" }
              ]}>
                Choose from Library
              </Text>
            </TouchableOpacity>
          </View>

          {/* Caption Input */}
          <View style={uploadStyles.inputSection}>
            <Text style={uploadStyles.inputLabel}>Caption (optional)</Text>
            <TextInput
              style={uploadStyles.captionInput}
              placeholder="Add a caption to your photos and videos..."
              placeholderTextColor="#9ca3af"
              multiline
              value={caption}
              onChangeText={setCaption}
              editable={!isUploading}
            />
          </View>

          {/* Tags Input */}
          <View style={uploadStyles.inputSection}>
            <Text style={uploadStyles.inputLabel}>Tags (optional)</Text>
            <View style={uploadStyles.tagInputContainer}>
              <TextInput
                style={uploadStyles.tagInput}
                placeholder="Add tags..."
                placeholderTextColor="#9ca3af"
                value={currentTag}
                onChangeText={setCurrentTag}
                onSubmitEditing={addTag}
                editable={!isUploading}
              />
              <TouchableOpacity
                style={[
                  uploadStyles.tagButton,
                  { backgroundColor: isUploading ? "#9ca3af" : "#8b5cf6" }
                ]}
                onPress={addTag}
                disabled={isUploading}
              >
                <Tag size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Tags List */}
            {tags.length > 0 && (
              <View style={uploadStyles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    style={uploadStyles.tagItem}
                  >
                    <Text style={uploadStyles.tagText}>#{tag}</Text>
                    <TouchableOpacity 
                      onPress={() => removeTag(tag)}
                      disabled={isUploading}
                    >
                      <X size={14} color={isUploading ? "#9ca3af" : "#8b5cf6"} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Upload Button */}
        <View style={uploadStyles.uploadButtonContainer}>
          <TouchableOpacity
            style={[
              uploadStyles.uploadButton,
              selectedMedia.length > 0 && !isUploading
                ? uploadStyles.uploadButtonEnabled
                : uploadStyles.uploadButtonDisabled
            ]}
            onPress={handleUpload}
            disabled={selectedMedia.length === 0 || isUploading}
          >
            {isUploading ? (
              <View style={uploadStyles.uploadButtonContent}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={uploadStyles.uploadButtonTextWithIcon}>
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Preparing...'}
                </Text>
              </View>
            ) : (
              <Text style={uploadStyles.uploadButtonText}>
                Upload {selectedMedia.length > 0 ? `${selectedMedia.length} Files` : "Media"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}