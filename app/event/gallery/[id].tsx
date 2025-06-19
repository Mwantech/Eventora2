import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ScrollView,
  Alert,
  Dimensions,
  RefreshControl,
  StatusBar,
  Animated,
  PanResponder
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getEventById } from "../../services/eventService";
import { getEventMedia, toggleMediaLike, deleteMedia, getMediaStats, MediaItem } from "../../services/mediaService";
import { ChevronLeft, Sliders, Clock, Heart, Download, Share2, Trash2, Play, BarChart3, Camera, Video as VideoIcon, TrendingUp } from "lucide-react-native";
import { useAuth } from "../../services/auth";
import { BlurView } from "expo-blur";
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import apiClient from "../../utils/apiClient";
import { galleryStyles } from "../../styles/galleryStyles";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define filter and sort types
type FilterType = 'all' | 'images' | 'videos';
type SortType = 'newest' | 'oldest' | 'popular';

interface MediaStats {
  total: number;
  images: number;
  videos: number;
  totalLikes: number;
}

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedSort, setSelectedSort] = useState<SortType>("newest");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const mediaItemAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  
  // Ref for the media viewer FlatList
  const mediaViewerRef = useRef<FlatList>(null);
  // Refs for video players
  const videoRefs = useRef<{ [key: string]: Video }>({});
  
  // Use auth context
  const { state: authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;
  const currentUserId = authState.user?.id || authState.user?._id;

  // Initialize media item animations
  const initializeMediaAnimations = useCallback(() => {
    media.forEach((item, index) => {
      const key = item.id || item._id!;
      if (!mediaItemAnimations[key]) {
        mediaItemAnimations[key] = new Animated.Value(0);
        // Stagger the animations
        Animated.timing(mediaItemAnimations[key], {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [media, mediaItemAnimations]);

  useEffect(() => {
    initializeMediaAnimations();
  }, [initializeMediaAnimations]);

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
        await Promise.all([
          fetchEventMedia(),
          fetchMediaStats()
        ]);
      } else {
        setError("Event not found");
      }
    } catch (err: any) {
      console.error("Error fetching event:", err);
      setError("Failed to load event");
      setIsLoading(false);
    }
  };

  const fetchEventMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching media with filter:', selectedFilter, 'sort:', selectedSort);
      
      const mediaData = await getEventMedia(
        id as string, 
        selectedFilter === 'all' ? undefined : selectedFilter, 
        selectedSort
      );
      
      console.log('Received media:', mediaData.length, 'items');
      setMedia(mediaData);
    } catch (err: any) {
      console.error("Error fetching media:", err);
      Alert.alert("Error", "Failed to load media");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, selectedFilter, selectedSort]);

  const fetchMediaStats = async () => {
    try {
      const stats = await getMediaStats(id as string);
      setMediaStats(stats);
    } catch (err: any) {
      console.error("Error fetching media stats:", err);
    }
  };

  // Refetch media when filter or sort changes
  useEffect(() => {
    if (event && !isLoading) {
      fetchEventMedia();
    }
  }, [selectedFilter, selectedSort, fetchEventMedia]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    Promise.all([
      fetchEventMedia(),
      fetchMediaStats()
    ]).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchEventMedia]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    if (filter !== selectedFilter) {
      console.log('Changing filter from', selectedFilter, 'to', filter);
      setSelectedFilter(filter);
      setSelectedMediaIndex(null);
      
      // Animate filter change
      Animated.sequence([
        Animated.timing(headerOpacity, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [selectedFilter, headerOpacity]);

  const handleSortChange = useCallback((sort: SortType) => {
    if (sort !== selectedSort) {
      console.log('Changing sort from', selectedSort, 'to', sort);
      setSelectedSort(sort);
      setSelectedMediaIndex(null);
    }
  }, [selectedSort]);

  const handleMediaPress = (index: number) => {
    setSelectedMediaIndex(index);
    
    // Animate FAB out
    Animated.spring(fabScale, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closeMediaViewer = () => {
    setSelectedMediaIndex(null);
    
    // Animate FAB back in
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    
    // Pause all videos when closing viewer
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pauseAsync();
      }
    });
  };

  const handleLikeToggle = async (mediaItem: MediaItem) => {
    try {
      // Optimistic update with animation
      const mediaKey = mediaItem.id || mediaItem._id!;
      if (mediaItemAnimations[mediaKey]) {
        Animated.sequence([
          Animated.spring(mediaItemAnimations[mediaKey], {
            toValue: 1.1,
            useNativeDriver: true,
          }),
          Animated.spring(mediaItemAnimations[mediaKey], {
            toValue: 1,
            useNativeDriver: true,
          })
        ]).start();
      }
      
      const updatedMedia = await toggleMediaLike(mediaItem.id || mediaItem._id!);
      
      setMedia(prevMedia => 
        prevMedia.map(item => 
          (item.id || item._id) === (updatedMedia.id || updatedMedia._id) ? updatedMedia : item
        )
      );
      
      if (mediaStats) {
        fetchMediaStats();
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      Alert.alert("Error", "Could not like media");
    }
  };

  const getMediaUrl = (mediaItem: MediaItem) => {
    if (mediaItem.url) {
      return mediaItem.url;
    }
    
    if (mediaItem.cloudinaryUrl) {
      return mediaItem.cloudinaryUrl;
    }
    
    if (mediaItem.filepath && mediaItem.filepath.startsWith('http')) {
      return mediaItem.filepath;
    }
    
    const baseURL = apiClient.defaults.baseURL || '';
    const staticBaseURL = baseURL.replace('/api', '');
    const fullBaseURL = staticBaseURL.startsWith('http') ? staticBaseURL : `http://${staticBaseURL}`;
    return `${fullBaseURL}/uploads/media/${mediaItem.filename}`;
  };

  const handleSaveToDevice = async (mediaItem: MediaItem) => {
    try {
      const fileUri = getMediaUrl(mediaItem);
      console.log('Complete media URL:', fileUri);
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission needed", "Please grant permission to save media");
        return;
      }

      let fileExtension = 'jpg';
      if (mediaItem.type === 'video') {
        fileExtension = 'mp4';
      } else if (fileUri.includes('.')) {
        const urlParts = fileUri.split('.');
        const possibleExtension = urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(possibleExtension)) {
          fileExtension = possibleExtension;
        }
      }
      
      const timestamp = Date.now();
      const downloadUri = `${FileSystem.documentDirectory}media_${timestamp}.${fileExtension}`;
      
      console.log('Downloading from:', fileUri);
      console.log('Downloading to:', downloadUri);
      
      const downloadResult = await FileSystem.downloadAsync(fileUri, downloadUri);
      
      if (downloadResult.status === 200) {
        const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
          const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
          console.log('Asset created:', asset);
          
          Alert.alert("Success", "Media saved to your device");
          
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
    } catch (err: any) {
      console.error("Error saving media:", err);
      
      if (err.message.includes('Could not create asset')) {
        Alert.alert("Error", "Unable to save media to gallery. Please check if the file format is supported and try again.");
      } else if (err.message.includes('Permission')) {
        Alert.alert("Permission Error", "Please grant permission to access your photo library in device settings.");
      } else {
        Alert.alert("Error", `Could not save media: ${err.message}. Please check your internet connection and try again.`);
      }
    }
  };

  const handleShareMedia = async (mediaItem: MediaItem) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing isn't available on your platform");
        return;
      }

      const fileUri = getMediaUrl(mediaItem);
      console.log('Sharing media from:', fileUri);
      
      let cleanFilename = mediaItem.filename;
      if (cleanFilename.includes('/')) {
        cleanFilename = cleanFilename.split('/').pop()!;
      }
      
      const fileExtension = cleanFilename.split('.').pop() || (mediaItem.type === 'video' ? 'mp4' : 'jpg');
      
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
    } catch (err: any) {
      console.error("Error sharing media:", err);
      Alert.alert("Error", `Could not share media: ${err.message}`);
    }
  };

  const handleDeleteMedia = async (mediaItem: MediaItem) => {
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
              await deleteMedia(mediaItem.id || mediaItem._id!);
              
              setMedia(prevMedia => 
                prevMedia.filter(item => 
                  (item.id || item._id) !== (mediaItem.id || mediaItem._id)
                )
              );
              
              if (selectedMediaIndex !== null) {
                setSelectedMediaIndex(null);
              }
              
              fetchMediaStats();
              
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

  const canDeleteMedia = (mediaItem: MediaItem) => {
    const isUploader = mediaItem.userId === currentUserId;
    const isEventCreator = event?.creatorId === currentUserId;
    return isUploader || isEventCreator;
  };

  const hasUserLiked = (mediaItem: MediaItem) => {
    if (!mediaItem.likedBy || !currentUserId) return false;
    return mediaItem.likedBy.includes(currentUserId);
  };

  const getFilterCount = (filter: FilterType): number => {
    if (!mediaStats) return 0;
    switch (filter) {
      case 'all': return mediaStats.total;
      case 'images': return mediaStats.images;
      case 'videos': return mediaStats.videos;
      default: return 0;
    }
  };

  const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
      case 'images': return <Camera size={16} color="#fff" />;
      case 'videos': return <VideoIcon size={16} color="#fff" />;
      default: return null;
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={galleryStyles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <View style={galleryStyles.loadingContent}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={galleryStyles.loadingText}>Loading gallery...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={galleryStyles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#ef4444" />
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

  const renderMediaItem = ({ item, index }: { item: MediaItem; index: number }) => {
    const mediaUrl = getMediaUrl(item);
    const mediaKey = item.id || item._id!;
    const animatedValue = mediaItemAnimations[mediaKey] || new Animated.Value(1);
    
    return (
      <Animated.View
        style={[
          galleryStyles.mediaItem,
          {
            opacity: animatedValue,
            transform: [
              {
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={galleryStyles.mediaItemTouchable}
          onPress={() => handleMediaPress(index)}
          activeOpacity={0.9}
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
                <Play size={20} color="#ffffff" fill="#ffffff" />
              </View>
              <View style={galleryStyles.mediaTypeIndicator}>
                <VideoIcon size={12} color="#ffffff" />
              </View>
            </View>
          ) : (
            <View style={galleryStyles.imageContainer}>
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
              <View style={galleryStyles.mediaTypeIndicator}>
                <Camera size={12} color="#ffffff" />
              </View>
            </View>
          )}
          
          {/* Gradient overlay for better text readability */}
          <View style={galleryStyles.mediaGradientOverlay} />
          
          {/* Like badge */}
          {item.likes > 0 && (
            <View style={galleryStyles.likeBadge}>
              <Heart size={10} color="#ffffff" fill="#ff4081" />
              <Text style={galleryStyles.likeBadgeText}>{item.likes}</Text>
            </View>
          )}
          
          {/* User info overlay */}
          <View style={galleryStyles.mediaUserInfo}>
            <Image
              source={{
                uri: item.uploaderProfileImage || 
                     `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.uploadedBy}`,
              }}
              style={galleryStyles.miniUserAvatar}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMediaViewer = ({ item, index }: { item: MediaItem; index: number }) => {
    const mediaId = item.id || item._id!;
    
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

  const renderMediaActions = (mediaItem: MediaItem) => (
    <View style={galleryStyles.actionButtonsContainer}>
      <TouchableOpacity 
        style={[
          galleryStyles.actionButton,
          hasUserLiked(mediaItem) && galleryStyles.actionButtonLiked
        ]}
        onPress={() => handleLikeToggle(mediaItem)}
      >
        <Heart 
          size={22} 
          color={hasUserLiked(mediaItem) ? "#ff4081" : "#ffffff"} 
          fill={hasUserLiked(mediaItem) ? "#ff4081" : "none"} 
        />
        <Text style={[
          galleryStyles.actionButtonText,
          hasUserLiked(mediaItem) && galleryStyles.actionButtonTextLiked
        ]}>
          {mediaItem.likes || 0}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={galleryStyles.actionButton}
        onPress={() => handleSaveToDevice(mediaItem)}
      >
        <Download size={22} color="#ffffff" />
        <Text style={galleryStyles.actionButtonText}>Save</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={galleryStyles.actionButton}
        onPress={() => handleShareMedia(mediaItem)}
      >
        <Share2 size={22} color="#ffffff" />
        <Text style={galleryStyles.actionButtonText}>Share</Text>
      </TouchableOpacity>
      
      {canDeleteMedia(mediaItem) && (
        <TouchableOpacity 
          style={[galleryStyles.actionButton, galleryStyles.actionButtonDelete]}
          onPress={() => handleDeleteMedia(mediaItem)}
        >
          <Trash2 size={22} color="#ef4444" />
          <Text style={galleryStyles.actionButtonTextDelete}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStatsModal = () => (
    <BlurView
      intensity={100}
      style={galleryStyles.modalOverlay}
    >
      <Animated.View style={galleryStyles.statsModalContent}>
        <View style={galleryStyles.statsModalHeader}>
          <Text style={galleryStyles.statsModalTitle}>Gallery Statistics</Text>
          <TouchableOpacity
            onPress={() => setShowStats(false)}
            style={galleryStyles.statsModalCloseButton}
          >
            <Text style={galleryStyles.statsModalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {mediaStats && (
          <View style={galleryStyles.statsContainer}>
            <View style={galleryStyles.statCard}>
              <View style={galleryStyles.statIconContainer}>
                <BarChart3 size={24} color="#6366f1" />
              </View>
              <Text style={galleryStyles.statValue}>{mediaStats.total}</Text>
              <Text style={galleryStyles.statLabel}>Total Media</Text>
            </View>
            
            <View style={galleryStyles.statCard}>
              <View style={galleryStyles.statIconContainer}>
                <Camera size={24} color="#10b981" />
              </View>
              <Text style={galleryStyles.statValue}>{mediaStats.images}</Text>
              <Text style={galleryStyles.statLabel}>Images</Text>
            </View>
            
            <View style={galleryStyles.statCard}>
              <View style={galleryStyles.statIconContainer}>
                <VideoIcon size={24} color="#f59e0b" />
              </View>
              <Text style={galleryStyles.statValue}>{mediaStats.videos}</Text>
              <Text style={galleryStyles.statLabel}>Videos</Text>
            </View>
            
            <View style={galleryStyles.statCard}>
              <View style={galleryStyles.statIconContainer}>
                <Heart size={24} color="#ef4444" />
              </View>
              <Text style={galleryStyles.statValue}>{mediaStats.totalLikes}</Text>
              <Text style={galleryStyles.statLabel}>Total Likes</Text>
            </View>
          </View>
        )}
      </Animated.View>
    </BlurView>
  );

  return (
    <View style={galleryStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Animated Header */}
      <Animated.View style={[galleryStyles.header, { opacity: headerOpacity }]}>
        <View style={galleryStyles.headerGradient}>
          <View style={galleryStyles.headerContent}>
            <View style={galleryStyles.headerLeft}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={galleryStyles.backButton}
              >
                <ChevronLeft size={24} color="#ffffff" />
              </TouchableOpacity>
              <View style={galleryStyles.headerTitleContainer}>
                <Text style={galleryStyles.headerTitle}>{event?.name || "Event Gallery"}</Text>
                <Text style={galleryStyles.headerSubtitle}>
                  {mediaStats ? `${mediaStats.total} items` : 'Loading...'}
                </Text>
              </View>
            </View>
            <View style={galleryStyles.headerActions}>
              {mediaStats && (
                <TouchableOpacity 
                  onPress={() => setShowStats(true)}
                  style={galleryStyles.statsButton}
                >
                  <BarChart3 size={20} color="#ffffff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={() => setShowFilterModal(true)}
                style={galleryStyles.filterButton}
              >
                <Sliders size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Modern Filter chips */}
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
            <View style={galleryStyles.filterChipContent}>
              <Text
                style={selectedFilter === "all" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
              >
                All
              </Text>
              {mediaStats && (
                <View style={selectedFilter === "all" ? galleryStyles.filterChipBadgeActive : galleryStyles.filterChipBadgeInactive}>
                  <Text style={selectedFilter === "all" ? galleryStyles.filterChipBadgeTextActive : galleryStyles.filterChipBadgeTextInactive}>
                    {getFilterCount('all')}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              galleryStyles.filterChip,
              selectedFilter === "images" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
            ]}
            onPress={() => handleFilterChange("images")}
          >
            <View style={galleryStyles.filterChipContent}>
              {getFilterIcon("images")}
              <Text
                style={selectedFilter === "images" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
              >
                Images
              </Text>
              {mediaStats && (
                <View style={selectedFilter === "images" ? galleryStyles.filterChipBadgeActive : galleryStyles.filterChipBadgeInactive}>
                  <Text style={selectedFilter === "images" ? galleryStyles.filterChipBadgeTextActive : galleryStyles.filterChipBadgeTextInactive}>
                    {getFilterCount('images')}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              galleryStyles.filterChip,
              selectedFilter === "videos" ? galleryStyles.filterChipActive : galleryStyles.filterChipInactive
            ]}
            onPress={() => handleFilterChange("videos")}
          >
            <View style={galleryStyles.filterChipContent}>
              {getFilterIcon("videos")}
              <Text
                style={selectedFilter === "videos" ? galleryStyles.filterChipTextActive : galleryStyles.filterChipTextInactive}
              >
                Videos
              </Text>
              {mediaStats && (
                <View style={selectedFilter === "videos" ? galleryStyles.filterChipBadgeActive : galleryStyles.filterChipBadgeInactive}>
                  <Text style={selectedFilter === "videos" ? galleryStyles.filterChipBadgeTextActive : galleryStyles.filterChipBadgeTextInactive}>
                    {getFilterCount('videos')}
                  </Text>
                </View>
              )}
            </View>
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
        keyExtractor={(item) => item.id || item._id!}
        numColumns={3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        renderItem={renderMediaItem}
        style={galleryStyles.mediaGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={galleryStyles.emptyState}>
            <Text style={galleryStyles.emptyStateText}>
              {selectedFilter === 'all' 
                ? "No media found. Upload some photos or videos to get started!"
                : `No ${selectedFilter} found. Try changing the filter or upload some ${selectedFilter}.`
              }
            </Text>
          </View>
        }
        onEndReachedThreshold={0.1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        windowSize={5}
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
              keyExtractor={(item) => item.id || item._id!}
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
                  const prevMediaId = media[selectedMediaIndex].id || media[selectedMediaIndex]._id!;
                  if (videoRefs.current[prevMediaId]) {
                    videoRefs.current[prevMediaId].pauseAsync();
                  }
                }
                
                setSelectedMediaIndex(newIndex);
                
                // Auto-play new video if it's a video
                if (media[newIndex]?.type === 'video') {
                  const currentMediaId = media[newIndex].id || media[newIndex]._id!;
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