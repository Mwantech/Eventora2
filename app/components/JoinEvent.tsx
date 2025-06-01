import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Keyboard
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Link, Eye, UserPlus, ExternalLink } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import apiClient from "../utils/apiClient";
import { useAuth } from "../services/auth";

// Utility function to parse event link and extract ID and token
const parseEventLink = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Remove any whitespace
    url = url.trim();
    
    // Handle different URL formats
    // Format 1: http://localhost:8081/event/share/eventId/token
    // Format 2: https://domain.com/event/share/eventId/token
    // Format 3: domain.com/event/share/eventId/token (without protocol)
    // Format 4: /event/share/eventId/token (relative path)
    
    // Add protocol if missing
    if (!url.startsWith('http') && !url.startsWith('/')) {
      url = 'https://' + url;
    }
    
    let pathname;
    if (url.startsWith('/')) {
      pathname = url;
    } else {
      const urlObj = new URL(url);
      pathname = urlObj.pathname;
    }
    
    // Match pattern: /event/share/eventId/token
    const shareMatch = pathname.match(/\/event\/share\/([a-f\d]{24})\/([a-f\d]+)/i);
    if (shareMatch) {
      return {
        eventId: shareMatch[1],
        token: shareMatch[2]
      };
    }
    
    // Also try pattern: /event/eventId/token (alternative format)
    const altMatch = pathname.match(/\/event\/([a-f\d]{24})\/([a-f\d]+)/i);
    if (altMatch) {
      return {
        eventId: altMatch[1],
        token: altMatch[2]
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing event link:', error);
    return null;
  }
};

export default function JoinViaLinkScreen() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [linkInput, setLinkInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eventPreview, setEventPreview] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [parsedLink, setParsedLink] = useState(null);

  useEffect(() => {
    // Auto-paste from clipboard on mount
    const getClipboardContent = async () => {
      try {
        const clipboardContent = await Clipboard.getStringAsync();
        if (clipboardContent && clipboardContent.includes('event')) {
          const parsed = parseEventLink(clipboardContent);
          if (parsed) {
            setLinkInput(clipboardContent);
            setParsedLink(parsed);
            // Auto-preview the event
            previewEvent(parsed.eventId, parsed.token);
          }
        }
      } catch (error) {
        console.log('Could not access clipboard:', error);
      }
    };

    getClipboardContent();
  }, []);

  const handleLinkInputChange = (text) => {
    setLinkInput(text);
    setEventPreview(null);
    
    const parsed = parseEventLink(text);
    setParsedLink(parsed);
    
    if (parsed) {
      // Debounce the preview call
      clearTimeout(window.previewTimeout);
      window.previewTimeout = setTimeout(() => {
        previewEvent(parsed.eventId, parsed.token);
      }, 500);
    }
  };

  const previewEvent = async (eventId, token) => {
    if (!eventId || !token) return;
    
    try {
      setIsLoading(true);
      console.log(`Previewing event: ${eventId} with token: ${token}`);
      
      const response = await apiClient.get(`/events/share/${eventId}/${token}`);
      const eventData = response.data?.data;
      
      if (eventData) {
        setEventPreview(eventData);
      }
    } catch (error) {
      console.error('Error previewing event:', error);
      let errorMessage = 'Failed to preview event';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Event link is invalid or expired';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required to preview this event';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      Alert.alert('Preview Error', errorMessage);
      setEventPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!parsedLink || !eventPreview) {
      Alert.alert('Error', 'No valid event link found');
      return;
    }

    if (!authState.isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'You need to be logged in to join events.',
        [
          { text: 'Login', onPress: () => router.push('/auth') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setIsJoining(true);
      
      // Try to join via share link
      const response = await apiClient.post(
        `/events/share/${parsedLink.eventId}/${parsedLink.token}/join`
      );
      
      if (response.data?.success) {
        Alert.alert(
          'Success!',
          `You have successfully joined "${eventPreview.name}"`,
          [
            {
              text: 'View Event',
              onPress: () => router.push(`/event/${parsedLink.eventId}`)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error joining event:', error);
      let errorMessage = 'Failed to join event';
      
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('already joined')) {
            errorMessage = 'You have already joined this event';
            // Still offer to view the event
            Alert.alert(
              'Already Joined',
              errorMessage,
              [
                {
                  text: 'View Event',
                  onPress: () => router.push(`/event/${parsedLink.eventId}`)
                },
                { text: 'OK', style: 'cancel' }
              ]
            );
            return;
          } else if (error.response.data?.message?.includes('creator')) {
            errorMessage = 'You are the creator of this event';
            Alert.alert(
              'Event Creator',
              errorMessage,
              [
                {
                  text: 'View Event',
                  onPress: () => router.push(`/event/${parsedLink.eventId}`)
                },
                { text: 'OK', style: 'cancel' }
              ]
            );
            return;
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.response.status === 404) {
          errorMessage = 'Event link is invalid or expired';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      Alert.alert('Join Error', errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleViewEvent = () => {
    if (!parsedLink) return;
    router.push(`/event/share/${parsedLink.eventId}/${parsedLink.token}`);
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setLinkInput(clipboardContent);
        handleLinkInputChange(clipboardContent);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not access clipboard');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView 
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
      }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#8b5cf6" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#111827',
          marginLeft: 12
        }}>
          Join via Link
        </Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Link Input Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <Link size={20} color="#8b5cf6" />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#111827',
              marginLeft: 8
            }}>
              Event Link
            </Text>
          </View>
          
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            marginBottom: 12
          }}>
            Paste the full event link here. We'll automatically extract the event details.
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: parsedLink ? '#10b981' : '#d1d5db',
            borderRadius: 8,
            backgroundColor: '#ffffff'
          }}>
            <TextInput
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                color: '#111827'
              }}
              placeholder="https://example.com/event/share/eventId/token"
              value={linkInput}
              onChangeText={handleLinkInputChange}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderLeftWidth: 1,
                borderLeftColor: '#e5e7eb'
              }}
              onPress={pasteFromClipboard}
            >
              <Text style={{
                fontSize: 14,
                color: '#8b5cf6',
                fontWeight: '500'
              }}>
                Paste
              </Text>
            </TouchableOpacity>
          </View>

          {/* Link Status */}
          {linkInput.length > 0 && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8
            }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: parsedLink ? '#10b981' : '#ef4444',
                marginRight: 8
              }} />
              <Text style={{
                fontSize: 12,
                color: parsedLink ? '#059669' : '#dc2626'
              }}>
                {parsedLink ? 'Valid event link detected' : 'Invalid link format'}
              </Text>
            </View>
          )}
        </View>

        {/* Event Preview */}
        {isLoading ? (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 32,
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            marginBottom: 24
          }}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginTop: 8
            }}>
              Loading event preview...
            </Text>
          </View>
        ) : eventPreview ? (
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            padding: 16,
            marginBottom: 24
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12
            }}>
              <Eye size={20} color="#8b5cf6" />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#111827',
                marginLeft: 8
              }}>
                Event Preview
              </Text>
              {eventPreview.isPrivate && (
                <View style={{
                  backgroundColor: '#fef3c7',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  marginLeft: 8
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: '#92400e',
                    fontWeight: '500'
                  }}>
                    PRIVATE
                  </Text>
                </View>
              )}
            </View>

            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 8
            }}>
              {eventPreview.name}
            </Text>

            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4
            }}>
              <Text style={{ fontWeight: '500' }}>Date:</Text> {formatDate(eventPreview.date)}
            </Text>

            {eventPreview.time && (
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 4
              }}>
                <Text style={{ fontWeight: '500' }}>Time:</Text> {eventPreview.time}
              </Text>
            )}

            {eventPreview.location && (
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 4
              }}>
                <Text style={{ fontWeight: '500' }}>Location:</Text> {eventPreview.location}
              </Text>
            )}

            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 8
            }}>
              <Text style={{ fontWeight: '500' }}>Created by:</Text> {eventPreview.creatorName || 'Unknown'}
            </Text>

            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 12
            }}>
              <Text style={{ fontWeight: '500' }}>Participants:</Text> {eventPreview.participants || 0}
            </Text>

            {eventPreview.description && (
              <Text style={{
                fontSize: 14,
                color: '#374151',
                lineHeight: 20
              }}>
                {eventPreview.description}
              </Text>
            )}
          </View>
        ) : null}

        {/* Action Buttons */}
        {eventPreview && (
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: authState.isAuthenticated ? '#8b5cf6' : '#9ca3af',
                borderRadius: 8,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={handleJoinEvent}
              disabled={!authState.isAuthenticated || isJoining}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <UserPlus size={16} color="#ffffff" />
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 8
                  }}>
                    {authState.isAuthenticated ? 'Join Event' : 'Login to Join'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#8b5cf6',
                borderRadius: 8,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={handleViewEvent}
            >
              <ExternalLink size={16} color="#8b5cf6" />
              <Text style={{
                color: '#8b5cf6',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8
              }}>
                View Event Details
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View style={{
          backgroundColor: '#f9fafb',
          borderRadius: 8,
          padding: 16,
          marginTop: 24
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 8
          }}>
            How it works:
          </Text>
          <Text style={{
            fontSize: 12,
            color: '#6b7280',
            lineHeight: 18
          }}>
            1. Paste the complete event link shared with you{'\n'}
            2. We'll automatically detect and preview the event{'\n'}
            3. Join the event or view details even if it's private{'\n'}
            4. The link works regardless of the domain or format
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}