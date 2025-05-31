import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Share as ShareIcon,
  Users,
  Calendar,
  Download,
  Settings,
  ChevronLeft,
  QrCode,
  Copy,
  X,
  User,
} from "lucide-react-native";

interface MediaGalleryProps {
  eventId?: string;
}

// Placeholder for MediaGallery component
const MediaGallery = ({ eventId = "default-event" }: MediaGalleryProps) => {
  return (
    <ScrollView className="flex-1 p-4">
      <View className="flex-row flex-wrap justify-between">
        {Array.from({ length: 12 }).map((_, index) => (
          <TouchableOpacity
            key={index}
            className="w-[32%] aspect-square mb-2 bg-gray-200 rounded-md overflow-hidden"
          >
            <Image
              source={{
                uri: `https://images.unsplash.com/photo-${1570000000000 + index}?w=300&q=80`,
              }}
              className="w-full h-full"
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

interface MediaUploaderProps {
  eventId?: string;
  onClose?: () => void;
  onUploadComplete?: () => void;
}

// Placeholder for MediaUploader component
const MediaUploader = ({
  eventId = "default-event",
  onClose = () => {},
  onUploadComplete = () => {},
}: MediaUploaderProps) => {
  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Upload Media</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-blue-500">Cancel</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <Text className="text-gray-500 mb-4">
          Tap to select photos or videos
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-full"
          onPress={() => {
            // Simulate upload completion
            setTimeout(onUploadComplete, 1000);
          }}
        >
          <Text className="text-white font-bold">Select Media</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface EventHubProps {
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  participantCount?: number;
  isCreator?: boolean;
}

const EventHub = ({
  eventId = "event-123",
  eventName = "Summer Beach Party",
  eventDate = "August 15, 2023",
  eventLocation = "Malibu Beach, CA",
  participantCount = 24,
  isCreator = true,
}: EventHubProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("gallery");
  const [showUploader, setShowUploader] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [eventLink, setEventLink] = useState("");

  useEffect(() => {
    // Generate event link when component mounts
    setEventLink(`https://eventapp.example.com/event/${eventId}`);
  }, [eventId]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    // In a real app, this would copy to clipboard
    Alert.alert("Link Copied", "Event link copied to clipboard!");
  };

  const handleShareExternal = async () => {
    try {
      // In a real app, this would use the Share API
      Alert.alert("Shared", "Event shared successfully!");
      setShowShareModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to share event");
    }
  };

  const handleDownload = () => {
    // Download all media functionality would go here
    console.log("Downloading all media for event:", eventId);
  };

  const handleSettings = () => {
    // Event settings functionality would go here
    console.log("Opening settings for event:", eventId);
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewProfile = () => {
    router.push("/profile");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-4 px-4">
        <TouchableOpacity
          onPress={handleBack}
          className="mb-2 flex-row items-center"
        >
          <ChevronLeft size={24} color="white" />
          <Text className="text-white ml-1">Back to Events</Text>
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold">{eventName}</Text>

        <View className="flex-row items-center mt-2">
          <Calendar size={16} color="white" />
          <Text className="text-white ml-2">{eventDate}</Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Users size={16} color="white" />
          <Text className="text-white ml-2">
            {participantCount} participants
          </Text>
        </View>

        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            onPress={handleShare}
            className="bg-white bg-opacity-20 rounded-full p-2 items-center justify-center w-12 h-12"
          >
            <ShareIcon size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDownload}
            className="bg-white bg-opacity-20 rounded-full p-2 items-center justify-center w-12 h-12"
          >
            <Download size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewProfile}
            className="bg-white bg-opacity-20 rounded-full p-2 items-center justify-center w-12 h-12"
          >
            <User size={20} color="white" />
          </TouchableOpacity>

          {isCreator && (
            <TouchableOpacity
              onPress={handleSettings}
              className="bg-white bg-opacity-20 rounded-full p-2 items-center justify-center w-12 h-12"
            >
              <Settings size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab("gallery")}
          className={`flex-1 py-3 items-center ${activeTab === "gallery" ? "border-b-2 border-blue-500" : ""}`}
        >
          <Text
            className={`${activeTab === "gallery" ? "text-blue-500 font-bold" : "text-gray-600"}`}
          >
            Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("participants")}
          className={`flex-1 py-3 items-center ${activeTab === "participants" ? "border-b-2 border-blue-500" : ""}`}
        >
          <Text
            className={`${activeTab === "participants" ? "text-blue-500 font-bold" : "text-gray-600"}`}
          >
            Participants
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === "gallery" ? (
          <>
            {showUploader ? (
              <MediaUploader
                eventId={eventId}
                onClose={() => setShowUploader(false)}
                onUploadComplete={() => setShowUploader(false)}
              />
            ) : (
              <>
                <MediaGallery eventId={eventId} />

                {/* Upload Button */}
                <TouchableOpacity
                  onPress={() => setShowUploader(true)}
                  className="absolute bottom-6 right-6 bg-blue-500 rounded-full p-4 shadow-lg"
                >
                  <Text className="text-white font-bold">+ Add Media</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <ScrollView className="flex-1 p-4">
            <Text className="text-lg font-bold mb-4">Event Participants</Text>

            {/* Placeholder for participants list */}
            {Array.from({ length: 5 }).map((_, index) => (
              <View
                key={index}
                className="flex-row items-center py-3 border-b border-gray-200"
              >
                <Image
                  source={{
                    uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${index}`,
                  }}
                  className="w-10 h-10 rounded-full bg-gray-300"
                />
                <View className="ml-3">
                  <Text className="font-medium">User {index + 1}</Text>
                  <Text className="text-gray-500 text-sm">
                    {index === 0 ? "Creator" : "Participant"}
                  </Text>
                </View>
                <Text className="ml-auto text-gray-500">
                  {Math.floor(Math.random() * 20)} uploads
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-5 w-full max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Share Event</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View className="items-center justify-center bg-gray-100 p-6 rounded-lg mb-4">
              <QrCode size={200} color="#3b82f6" />
              <Text className="mt-4 text-gray-600 text-center">
                Scan this QR code to join the event
              </Text>
            </View>

            <View className="bg-gray-100 rounded-lg p-3 mb-4 flex-row justify-between items-center">
              <Text className="flex-1 text-gray-800" numberOfLines={1}>
                {eventLink}
              </Text>
              <TouchableOpacity
                onPress={handleCopyLink}
                className="ml-2 bg-gray-200 p-2 rounded-full"
              >
                <Copy size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleShareExternal}
              className="bg-blue-500 py-3 rounded-lg items-center"
            >
              <Text className="text-white font-bold">Share with Others</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EventHub;