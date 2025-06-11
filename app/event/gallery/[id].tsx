import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ScrollView,
  Alert,
  Dimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getEventById } from "../../services/eventService";
import { getEventMedia, toggleMediaLike, deleteMedia } from "../../services/mediaService";
import { ChevronLeft, Sliders, Clock, Heart, Download, Share2, Trash2, Play } from "lucide-react-native";
import { useAuth } from "../../services/auth";
import { BlurView } from "expo-blur";
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import apiClient from "../../utils/apiClient";
import { galleryStyles } from "../../styles/galleryStyles";

const { width: screenWidth } = Dimensions.get('window');

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Ref for the media viewer FlatList
  const mediaViewerRef = useRef<FlatList>(null);
  // Refs for video players
  const videoRefs = useRef<{ [key: string]: Video }>({});
  
  // Use auth context
  const { state: authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;
  const currentUserId = authState.user?.id || authState.user?._id;

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
        fetchEventMedia();
      } else {
        setError("Event not found");
      }
    } catch (err: any) {
      console.error("Error fetching event:", err);
      setError("Failed to load event");
      setIsLoading(false);
    }
  };

  const fetchEventMedia = async () => {
    try {
      const mediaData = await getEventMedia(id as string, selectedFilter !== 'all' ? selectedFilter : undefined, selectedSort);
      setMedia(mediaData);
    } catch (err: any) {
      console.error("Error fetching media:", err);
      Alert.alert("Error", "Failed to load media");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEventMedia();
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setIsLoading(true);
    setTimeout(() => {
      fetchEventMedia();
    }, 100);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    setIsLoading(true);
    setTimeout(() => {
      fetchEventMedia();
    }, 100);
  };

  const handleMediaPress = (index: number) => {
    setSelectedMediaIndex(index);
  };

  const closeMediaViewer = () => {
    setSelectedMediaIndex(null);
    // Pause all videos when closing viewer
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pauseAsync();
      }
    });
  };

  const handleLikeToggle = async (mediaItem: any) => {
    try {
      const updatedMedia = await toggleMediaLike(mediaItem.id || mediaItem._id);
      
      setMedia(prevMedia => 
        prevMedia.map(item => 
          (item.id || item._id) === (updatedMedia.id || updatedMedia._id) ? updatedMedia : item
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      Alert.alert("Error", "Could not like media");
    }
  };

  const getMediaUrl = (mediaItem: any) => {
    if (mediaItem.url) {
      if (mediaItem.url.startsWith('http://') || mediaItem.url.startsWith('https://')) {
        return mediaItem.url;
      }
      const baseURL = apiClient.defaults.baseURL || '';
      const staticBaseURL = baseURL.replace('/api', '');
      return `${staticBaseURL}${mediaItem.url.startsWith('/') ? '' : '/'}${mediaItem.url}`;
    }
    
    const baseURL = apiClient.defaults.baseURL || '';
    const staticBaseURL = baseURL.replace('/api', '');
    const fullBaseURL = staticBaseURL.startsWith('http') ? staticBaseURL : `http://${staticBaseURL}`;
    return `${fullBaseURL}/uploads/media/${mediaItem.filename}`;
  };

const handleSaveToDevice = async (mediaItem: any) => {
  try {
    const fileUri = getMediaUrl(mediaItem);
    console.log('Complete media URL:', fileUri);
    
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission needed", "Please grant permission to save media");
      return;
    }

    // Determine file extension from media type and URL
    let fileExtension = 'jpg';
    if (mediaItem.type === 'video') {
      fileExtension = 'mp4';
    } else if (fileUri.includes('.')) {
      // Try to get extension from URL
      const urlParts = fileUri.split('.');
      const possibleExtension = urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(possibleExtension)) {
        fileExtension = possibleExtension;
      }
    }
    
    // Create a simple filename with timestamp
    const timestamp = Date.now();
    const downloadUri = `${FileSystem.documentDirectory}media_${timestamp}.${fileExtension}`;
    
    console.log('Downloading from:', fileUri);
    console.log('Downloading to:', downloadUri);
    
    const downloadResult = await FileSystem.downloadAsync(fileUri, downloadUri);
    
    if (downloadResult.status === 200) {
      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        console.log('Asset created:', asset);
        
        Alert.alert("Success", "Media saved to your device");
        
        // Clean up the temporary file
        try {
          await FileSystem.deleteAsync(downloadResult.uri);
        } catch (cleanupError) {
          console.log('Could not clean up temp file:', cleanupError);
        }
      } else {
        throw new Error('Downloaded file is empty or corrupted');
      }
    } else {
      throw new Error(`Download failed with status: ${downloadResult.status}`);
    }
  } catch (err) {
    console.error("Error saving media:", err);
    
    // Provide more specific error messages
    if (err.message.includes('Could not create asset')) {
      Alert.alert("Error", "Unable to save media to gallery. Please check if the file format is supported and try again.");
    } else if (err.message.includes('Permission')) {
      Alert.alert("Permission Error", "Please grant permission to access your photo library in device settings.");
    } else {
      Alert.alert("Error", `Could not save media: ${err.message}. Please check your internet connection and try again.`);
    }
  }
};

const handleShareMedia = async (mediaItem: any) => {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing isn't available on your platform");
      return;
    }

    const fileUri = getMediaUrl(mediaItem);
    console.log('Sharing media from:', fileUri);
    
    // Clean the filename to remove any path separators and get just the filename
    let cleanFilename = mediaItem.filename;
    if (cleanFilename.includes('/')) {
      // Extract just the filename from the path
      cleanFilename = cleanFilename.split('/').pop();
    }
    
    // Extract just the file extension from the clean filename
    const fileExtension = cleanFilename.split('.').pop() || (mediaItem.type === 'video' ? 'mp4' : 'jpg');
    
    // Create a simple filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const tempUri = `${FileSystem.documentDirectory}share_${timestamp}.${fileExtension}`;
    
    console.log('Downloading for sharing from:', fileUri);
    console.log('Temporary file path:', tempUri);
    
    const downloadResult = await FileSystem.downloadAsync(fileUri, tempUri);
    
    console.log('Download result:', downloadResult);
    
    if (downloadResult.status === 200) {
      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      console.log('Downloaded file info:', fileInfo);
      
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
        console.log('Sharing file:', downloadResult.uri);
        
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: mediaItem.type === 'image' ? 'image/jpeg' : 'video/mp4',
          dialogTitle: mediaItem.caption || 'Share Media',
        });
        
        console.log('File shared successfully');
        
        // Clean up the temporary file after sharing
        try {
          await FileSystem.deleteAsync(downloadResult.uri);
          console.log('Temporary file cleaned up');
        } catch (cleanupError) {
          console.log('Could not clean up temp file:', cleanupError);
        }
      } else {
        throw new Error('Downloaded file is empty or corrupted');
      }
    } else {
      throw new Error(`Failed to download file for sharing (status: ${downloadResult.status})`);
    }
  } catch (err) {
    console.error("Error sharing media:", err);
    Alert.alert("Error", `Could not share media: ${err.message}`);
  }
};

  const handleDeleteMedia = async (mediaItem: any) => {
    Alert.alert(
      "Delete Media",
      "Are you sure you want to delete this media? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMedia(mediaItem.id || mediaItem._id);
              
              setMedia(prevMedia => 
                prevMedia.filter(item => 
                  (item.id || item._id) !== (mediaItem.id || mediaItem._id)
                )
              );
              
              if (selectedMediaIndex !== null) {
                setSelectedMediaIndex(null);
              }
              
              Alert.alert("Success", "Media deleted successfully");
            } catch (err) {
              console.error("Error deleting media:", err);
              Alert.alert("Error", "Could not delete media");
            }
          }
        }
      ]
    );
  };

  const canDeleteMedia = (mediaItem: any) => {
    const isUploader = mediaItem.userId === currentUserId;
    const isEventCreator = event?.creatorId === currentUserId;
    return isUploader || isEventCreator;
  };

  const hasUserLiked = (mediaItem: any) => {
    if (!mediaItem.likedBy || !currentUserId) return false;
    return mediaItem.likedBy.includes(currentUserId);
  };

  // Get thumbnail for video items
  const getVideoThumbnail = (mediaItem: any) => {
    // For now, we'll use the video URL as thumbnail
    // In a production app, you might want to generate actual thumbnails
    return getMediaUrl(mediaItem);
  };

  if (isLoading) {
    return (
      <View style={galleryStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={galleryStyles.errorContainer}>
        <Text style={galleryStyles.errorTitle}>{error}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={galleryStyles.errorButton}
        >
          <Text style={galleryStyles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMediaItem = ({ item, index }: { item: any; index: number }) => {
    const mediaUrl = getMediaUrl(item);
    return (
      <TouchableOpacity
        style={galleryStyles.mediaItem}
        onPress={() => handleMediaPress(index)}
      >
        {item.type === "video" ? (
          <View style={galleryStyles.videoThumbnailContainer}>
            <Video
              source={{ uri: mediaUrl }}
              style={galleryStyles.mediaImage}
              shouldPlay={false}
              isLooping={false}
              useNativeControls={false}
              resizeMode="cover"
              onError={(error) => {
                console.log('Video thumbnail error for item:', item.filename);
                console.log('Error details:', error);
                console.log('Failed URL:', mediaUrl);
              }}
            />
            <View style={galleryStyles.videoPlayOverlay}>
              <Play size={24} color="#ffffff" fill="#ffffff" />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: mediaUrl }}
            style={galleryStyles.mediaImage}
            resizeMode="cover"
            onError={(error) => {
              console.log('Image load error for item:', item.filename);
              console.log('Error details:', error.nativeEvent.error);
              console.log('Failed URL:', mediaUrl);
            }}
          />
        )}
        {item.type === "video" && (
          <View style={galleryStyles.videoIndicator}>
            <Text style={galleryStyles.videoIndicatorText}>▶</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMediaViewer = ({ item, index }: { item: any; index: number }) => {
    const mediaId = item.id || item._id;
    
    return (
      <View style={galleryStyles.mediaSlide}>
        {item.type === "video" ? (
          <Video
            ref={(ref) => {
              if (ref) {
                videoRefs.current[mediaId] = ref;
              }
            }}
            source={{ uri: getMediaUrl(item) }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay={selectedMediaIndex === index}
            isLooping={false}
            useNativeControls={true}
            style={galleryStyles.fullMediaVideo}
            onError={(error) => {
              console.log('Video playback error:', error);
              Alert.alert("Video Error", "Unable to play this video");
            }}
            onLoad={() => {
              console.log('Video loaded successfully');
            }}
          />
        ) : (
          <Image
            source={{ uri: getMediaUrl(item) }}
            style={galleryStyles.fullMediaImage}
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  const renderMediaActions = (mediaItem: any) => (
    <View style={galleryStyles.actionButtonsContainer}>
      <TouchableOpacity 
        style={galleryStyles.actionButton}
        onPress={() => handleLikeToggle(mediaItem)}
      >
        <Heart 
          size={24} 
          color={hasUserLiked(mediaItem) ? "#ff4081" : "#ffffff"} 
          fill={hasUserLiked(mediaItem) ? "#ff4081" : "none"} 
        />
        <Text style={galleryStyles.likeCount}>
          {mediaItem.likes || 0}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={galleryStyles.actionButton}
        onPress={() => handleSaveToDevice(mediaItem)}
      >
        <Download size={24} color="#ffffff" />
        <Text style={galleryStyles.actionButtonText}>Save</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={galleryStyles.actionButton}
        onPress={() => handleShareMedia(mediaItem)}
      >
        <Share2 size={24} color="#ffffff" />
        <Text style={galleryStyles.actionButtonText}>Share</Text>
      </TouchableOpacity>
      
      {canDeleteMedia(mediaItem) && (
        <TouchableOpacity 
          style={galleryStyles.actionButton}
          onPress={() => handleDeleteMedia(mediaItem)}
        >
          <Trash2 size={24} color="#ef4444" />
          <Text style={galleryStyles.actionButtonTextDelete}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={galleryStyles.container}>
      {/* Header */}
      <View style={galleryStyles.header}>
        <View style={galleryStyles.headerLeft}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={galleryStyles.backButton}
          >
            <ChevronLeft size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={galleryStyles.headerTitle}>{event?.name || "Event Gallery"}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowFilterModal(true)}
          style={galleryStyles.filterButton}
        >
          <Sliders size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={galleryStyles.filterChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={galleryStyles.filterChipsScrollView}
        >
          <TouchableOpacity
            style={[
              galleryStyles.filterChip,
              selectedFilter === "all" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
            ]}
            onPress={() => handleFilterChange("all")}
          >
            <Text
              style={selectedFilter === "all" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              galleryStyles.filterChip,
              selectedFilter === "images" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
            ]}
            onPress={() => handleFilterChange("images")}
          >
            <Text
              style={selectedFilter === "images" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
            >
              Images
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              galleryStyles.filterChip,
              selectedFilter === "videos" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
            ]}
            onPress={() => handleFilterChange("videos")}
          >
            <Text
              style={selectedFilter === "videos" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
            >
              Videos
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Sort options */}
      <View style={galleryStyles.sortContainer}>
        <Text style={galleryStyles.sortLabel}>Sort by:</Text>
        
        <TouchableOpacity 
          style={[galleryStyles.sortOption, selectedSort === "newest" && galleryStyles.sortOptionActive]}
          onPress={() => handleSortChange("newest")}
        >
          <Text
            style={selectedSort === "newest" ? galleryStyles.sortTextActive : galleryStyles.sortTextInactive}
          >
            Newest
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[galleryStyles.sortOption, selectedSort === "oldest" && galleryStyles.sortOptionActive]}
          onPress={() => handleSortChange("oldest")}
        >
          <Text
            style={selectedSort === "oldest" ? galleryStyles.sortTextActive : galleryStyles.sortTextInactive}
          >
            Oldest
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[galleryStyles.sortOption, selectedSort === "popular" && galleryStyles.sortOptionActive]}
          onPress={() => handleSortChange("popular")}
        >
          <Text
            style={selectedSort === "popular" ? galleryStyles.sortTextActive : galleryStyles.sortTextInactive}
          >
            Popular
          </Text>
        </TouchableOpacity>
      </View>

      {/* Media grid */}
      <FlatList
        data={media}
        keyExtractor={(item) => item.id || item._id}
        numColumns={3}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderItem={renderMediaItem}
        style={galleryStyles.mediaGrid}
        ListEmptyComponent={
          <View style={galleryStyles.emptyState}>
            <Text style={galleryStyles.emptyStateText}>
              No media found. Upload some photos or videos to get started!
            </Text>
          </View>
        }
      />

      {/* Floating action button for upload */}
      <TouchableOpacity
        style={galleryStyles.fab}
        onPress={() => router.push(`/event/upload/${id}`)}
      >
        <Text style={galleryStyles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Swipeable Media Viewer Modal */}
      {selectedMediaIndex !== null && (
        <View style={galleryStyles.mediaViewerContainer}>
          {/* Header with close button and counter */}
          <View style={galleryStyles.mediaViewerHeader}>
            <TouchableOpacity
              style={galleryStyles.mediaViewerCloseButton}
              onPress={closeMediaViewer}
            >
              <Text style={galleryStyles.mediaViewerCloseText}>✕</Text>
            </TouchableOpacity>
            
            <View style={galleryStyles.mediaViewerCounter}>
              <Text style={galleryStyles.mediaViewerCounterText}>
                {selectedMediaIndex + 1} of {media.length}
              </Text>
            </View>
          </View>

          {/* Swipeable media content */}
          <View style={galleryStyles.swipeableMediaContainer}>
            <FlatList
              ref={mediaViewerRef}
              data={media}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id || item._id}
              renderItem={renderMediaViewer}
              initialScrollIndex={selectedMediaIndex}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                
                // Pause previous video
                if (selectedMediaIndex !== null && media[selectedMediaIndex]?.type === 'video') {
                  const prevMediaId = media[selectedMediaIndex].id || media[selectedMediaIndex]._id;
                  if (videoRefs.current[prevMediaId]) {
                    videoRefs.current[prevMediaId].pauseAsync();
                  }
                }
                
                setSelectedMediaIndex(newIndex);
                
                // Auto-play new video if it's a video
                if (media[newIndex]?.type === 'video') {
                  const currentMediaId = media[newIndex].id || media[newIndex]._id;
                  if (videoRefs.current[currentMediaId]) {
                    videoRefs.current[currentMediaId].playAsync();
                  }
                }
              }}
            />
          </View>

          {/* Media info panel */}
          {media[selectedMediaIndex] && (
            <View style={galleryStyles.mediaInfoPanel}>
              <View style={galleryStyles.mediaInfoHeader}>
                <View style={galleryStyles.userInfo}>
                  <Image
                    source={{
                      uri: media[selectedMediaIndex].uploaderProfileImage || 
                           `https://api.dicebear.com/7.x/avataaars/svg?seed=${media[selectedMediaIndex].uploadedBy}`,
                    }}
                    style={galleryStyles.userAvatar}
                  />
                  <Text style={galleryStyles.userName}>
                    {media[selectedMediaIndex].uploadedBy || "Unknown User"}
                  </Text>
                </View>
                
                <View style={galleryStyles.timeInfo}>
                  <Clock size={14} color="#cbd5e1" />
                  <Text style={galleryStyles.timeText}>
                    {media[selectedMediaIndex].timestamp}
                  </Text>
                </View>
              </View>

              {media[selectedMediaIndex].caption && (
                <Text style={galleryStyles.mediaCaption}>
                  {media[selectedMediaIndex].caption}
                </Text>
              )}

              {media[selectedMediaIndex].tags && media[selectedMediaIndex].tags.length > 0 && (
                <View style={galleryStyles.tagsContainer}>
                  {media[selectedMediaIndex].tags.map((tag, index) => (
                    <View key={index} style={galleryStyles.tag}>
                      <Text style={galleryStyles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {renderMediaActions(media[selectedMediaIndex])}
            </View>
          )}
        </View>
      )}

      {/* Filter modal */}
      {showFilterModal && (
        <BlurView
          intensity={80}
          style={galleryStyles.modalOverlay}
        >
          <View style={galleryStyles.modalContent}>
            <Text style={galleryStyles.modalTitle}>Filter Media</Text>

            <Text style={galleryStyles.modalSectionTitle}>Media Type</Text>
            <View style={galleryStyles.modalButtonRow}>
              <TouchableOpacity
                style={[
                  galleryStyles.filterChip,
                  selectedFilter === "all" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
                ]}
                onPress={() => setSelectedFilter("all")}
              >
                <Text
                  style={selectedFilter === "all" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
                >
                  All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  galleryStyles.filterChip,
                  selectedFilter === "images" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
                ]}
                onPress={() => setSelectedFilter("images")}
              >
                <Text
                  style={selectedFilter === "images" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
                >
                  Images
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  galleryStyles.filterChip,
                  selectedFilter === "videos" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
                ]}
                onPress={() => setSelectedFilter("videos")}
              >
                <Text
                  style={selectedFilter === "videos" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
                >
                  Videos
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={galleryStyles.modalSectionTitle}>Sort By</Text>
            <View style={galleryStyles.modalButtonRow}>
              <TouchableOpacity
                style={[
                  galleryStyles.filterChip,
                  selectedSort === "newest" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
                ]}
                onPress={() => setSelectedSort("newest")}
              >
                <Text
                  style={selectedSort === "newest" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
                >
                  Newest
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  galleryStyles.filterChip,
                  selectedSort === "oldest" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
                ]}
                onPress={() => setSelectedSort("oldest")}
              >
                <Text
                  style={selectedSort === "oldest" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
                >
                  Oldest
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  galleryStyles.filterChip,
                  selectedSort === "popular" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
                ]}
                onPress={() => setSelectedSort("popular")}
              >
                <Text
                  style={selectedSort === "popular" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
                >
                  Popular
                </Text>
              </TouchableOpacity>
            </View>

            <View style={galleryStyles.modalActions}>
              <TouchableOpacity
                style={[galleryStyles.modalButton, galleryStyles.modalButtonCancel]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={galleryStyles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[galleryStyles.modalButton, galleryStyles.modalButtonApply]}
                onPress={() => {
                  setShowFilterModal(false);
                  setIsLoading(true);
                  setTimeout(() => {
                    fetchEventMedia();
                  }, 100);
                }}
              >
                <Text style={galleryStyles.modalButtonTextApply}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      )}
    </View>
  );
}