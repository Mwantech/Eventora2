import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Users, Calendar, MapPin, Lock, Globe } from "lucide-react-native";
import { commonStyles, colors, spacing } from "../styles/EventCardStyles";

interface EventCardProps {
  id: string;
  name: string;
  date: string;
  participants: number;
  coverImage?: string;
  location?: string;
  isPrivate?: boolean;
  onPress?: () => void;
}

const EventCard = ({
  id,
  name,
  date,
  participants,
  coverImage,
  location,
  isPrivate,
  onPress,
}: EventCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Make sure ID is passed correctly to the event detail screen
      router.push(`/event/${id}`);
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80";

  // Bold privacy badge styles with purple theme
  const getPrivacyBadgeStyle = () => {
    if (isPrivate) {
      return {
        backgroundColor: '#6B21A8', // Deep purple for private
        borderWidth: 1,
        borderColor: '#581C87',
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs + 2,
        borderRadius: 16,
        shadowColor: '#6B21A8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
      };
    } else {
      return {
        backgroundColor: '#1F2937', // Dark gray/black for public
        borderWidth: 1,
        borderColor: '#374151',
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs + 2,
        borderRadius: 16,
        shadowColor: '#1F2937',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
      };
    }
  };

  const getPrivacyTextStyle = () => {
    return {
      fontSize: 11,
      fontWeight: '800' as const,
      color: '#FFFFFF',
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    };
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={commonStyles.eventCard}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: coverImage || defaultImage }}
        style={commonStyles.eventImage}
        resizeMode="cover"
      />
      
      {/* Privacy badge overlay on image */}
      {isPrivate !== undefined && (
        <View style={{
          position: 'absolute',
          top: 12,
          right: 12,
          flexDirection: 'row',
          alignItems: 'center',
          ...getPrivacyBadgeStyle()
        }}>
          {isPrivate ? (
            <Lock size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
          ) : (
            <Globe size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
          )}
          <Text style={getPrivacyTextStyle()}>
            {isPrivate ? "Private" : "Public"}
          </Text>
        </View>
      )}
      
      <View style={commonStyles.eventCardContent}>
        <Text style={commonStyles.eventTitle}>{name}</Text>
        
        <View style={commonStyles.eventDetail}>
          <Calendar size={16} color={colors.primary} />
          <Text style={[commonStyles.eventDetailText, { color: colors.gray[600] }]}>
            {date}
          </Text>
        </View>
        
        {location && (
          <View style={commonStyles.eventDetail}>
            <MapPin size={16} color={colors.primary} />
            <Text style={[commonStyles.eventDetailText, { color: colors.gray[600] }]}>
              {location}
            </Text>
          </View>
        )}
        
        <View style={commonStyles.eventFooter}>
          <View style={commonStyles.participantInfo}>
            <Users size={16} color={colors.primary} />
            <Text style={[commonStyles.eventDetailText, { color: colors.gray[600] }]}>
              {participants} participants
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;