import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Share as RNShare, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Copy, Share as ShareIcon, Check, RefreshCw } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from 'react-native-qrcode-svg';
import apiClient from "../../utils/apiClient";
import { useAuth } from "../../services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../../styles/ShareStyle";

export default function EventShareScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [shareLink, setShareLink] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { state: authState } = useAuth();
  
  useEffect(() => {
    if (!id) {
      Alert.alert("Error", "Event ID is missing");
      router.back();
      return;
    }

    if (!authState.isAuthenticated || !authState.user) {
      Alert.alert(
        "Authentication Required", 
        "You need to be logged in to share events.",
        [
          { text: "Login", onPress: () => router.push("/auth") },
          { text: "Cancel", onPress: () => router.back(), style: "cancel" }
        ]
      );
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchEventDetails();
        await fetchShareLink();
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Error", "Failed to load event data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, authState.isAuthenticated]);

  const fetchShareLink = async () => {
    try {
      setIsRegenerating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      console.log("Generating share link for event ID:", id);
      console.log("Auth state:", { 
        isAuthenticated: authState.isAuthenticated,
        userId: authState.user?.id || authState.user?._id || 'Unknown'
      });
      
      const response = await apiClient.post(`/events/${id}/share`);
      const shareData = response.data?.data;
      
      console.log("Share data response:", shareData);
      
      if (shareData && shareData.token) {
        const baseUrl = Platform.OS === 'web' 
          ? window.location.origin 
          : "http://localhost:8081";
        const linkUrl = `${baseUrl}/event/share/${id}/${shareData.token}`;
        
        console.log("Generated share link:", linkUrl);
        
        setShareLink(linkUrl);
        setQrCodeUrl(linkUrl);
      } else {
        console.error("Invalid response format or missing token:", shareData);
        Alert.alert("Error", "Failed to generate share link");
      }
    } catch (error) {
      console.error("Error generating share link:", error);
      handleShareLinkError(error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleShareLinkError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        Alert.alert(
          "Authentication Required", 
          "Your session has expired. Please log in again.",
          [
            { text: "Login", onPress: () => router.push("/auth") },
            { text: "Cancel", onPress: () => router.back(), style: "cancel" }
          ]
        );
      } else if (error.response.status === 403) {
        Alert.alert("Error", "You don't have permission to share this event");
        router.back();
      } else {
        Alert.alert("Error", `Failed to generate share link: ${error.response.data?.message || "Unknown error"}`);
      }
    } else if (error.message) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Error", "Failed to connect to server. Please check your internet connection.");
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await apiClient.get(`/events/${id}`);
      const event = response.data?.data;
      
      if (event) {
        setEventName(event.name);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      if (error.response && error.response.status === 404) {
        Alert.alert("Error", "Event not found");
        router.back();
      }
    }
  };

  const copyToClipboard = async () => {
    if (!shareLink) {
      Alert.alert("Error", "No share link available to copy");
      return;
    }
    
    try {
      await Clipboard.setStringAsync(shareLink);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      Alert.alert("Success", "Link copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy link to clipboard");
    }
  };

  const handleShare = async () => {
    if (!shareLink) {
      Alert.alert("Error", "No share link available");
      return;
    }
    
    try {
      const result = await RNShare.share({
        message: `Join me at ${eventName || "this event"}! ${shareLink}`,
        url: shareLink
      });
      
      if (result.action === RNShare.sharedAction) {
        console.log("Shared successfully");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share event link");
    }
  };

  if (!authState.isAuthenticated && !isLoading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authDescription}>
            You need to be logged in to share events.
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.authButtonText}>Go to Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#8b5cf6" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Share Event</Text>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Generating share link...</Text>
          </View>
        ) : (
          <>
            <View style={styles.shareSection}>
              <View style={styles.shareIconContainer}>
                <ShareIcon size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.shareTitle}>
                Share {eventName ? `"${eventName}"` : "this event"}
              </Text>
              <Text style={styles.shareDescription}>
                Anyone with this link can view the event details
              </Text>
            </View>

            <View style={styles.linkSection}>
              <Text style={styles.linkTitle}>Share Link:</Text>
              {shareLink ? (
                <View style={styles.linkContainer}>
                  <Text style={styles.linkText}>{shareLink}</Text>
                  {isRegenerating && (
                    <ActivityIndicator size="small" color="#8b5cf6" />
                  )}
                </View>
              ) : (
                <View style={styles.linkContainer}>
                  <Text style={styles.errorText}>Failed to generate share link</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchShareLink}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <RefreshCw size={14} color="#ffffff" />
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.qrSection}>
              <Text style={styles.qrTitle}>QR Code:</Text>
              <View style={styles.qrContainer}>
                {qrCodeUrl ? (
                  <QRCode
                    value={qrCodeUrl}
                    size={200}
                    backgroundColor="white"
                    color="black"
                    ecl="M"
                  />
                ) : (
                  <View style={styles.qrErrorContainer}>
                    <Text style={styles.qrErrorText}>QR Code not available</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={fetchShareLink}
                      disabled={isRegenerating}
                    >
                      {isRegenerating ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <RefreshCw size={14} color="#ffffff" />
                          <Text style={styles.retryButtonText}>Retry</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  copySuccess && styles.actionButtonSuccess,
                  !shareLink && styles.actionButtonDisabled,
                ]}
                onPress={copyToClipboard}
                disabled={!shareLink}
              >
                {copySuccess ? (
                  <Check size={16} color="#ffffff" />
                ) : (
                  <Copy size={16} color="#ffffff" />
                )}
                <Text style={styles.actionButtonText}>
                  {copySuccess ? "Copied!" : "Copy to Clipboard"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, !shareLink && styles.actionButtonDisabled]}
                onPress={handleShare}
                disabled={!shareLink}
              >
                <ShareIcon size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>Share via...</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This link will remain active as long as the event exists
        </Text>
      </View>
    </SafeAreaView>
  );
}