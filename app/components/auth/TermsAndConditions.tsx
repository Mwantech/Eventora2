import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  StyleSheet,
  Dimensions,
} from "react-native";

const { height: screenHeight } = Dimensions.get('window');

interface TermsAndConditionsProps {
  onAccept: () => void;
  onBack: () => void;
}

export default function TermsAndConditions({
  onAccept,
  onBack,
}: TermsAndConditionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9fc',
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 10,
      marginTop: 20,
    },
    headerContainer: {
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333333' : '#e0e0e0',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#cccccc' : '#666666',
      textAlign: 'center',
    },
    termsContainer: {
      flex: 1,
      marginVertical: 15,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    termsContent: {
      paddingHorizontal: 5,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    effectiveDate: {
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 15,
      textAlign: 'center',
    },
    introText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
      textAlign: 'justify',
    },
    section: {
      marginBottom: 18,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    sectionText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 6,
      textAlign: 'justify',
    },
    bulletPoint: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
      marginLeft: 8,
      textAlign: 'justify',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 15,
      marginBottom: 30,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333333' : '#e0e0e0',
      gap: 12,
    },
    backButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    acceptButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    acceptButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#1a1a1a" : "#f9f9fc"} 
      />
      
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.subtitle}>Please read and accept our terms</Text>
        </View>

        <ScrollView 
          style={styles.termsContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.termsContent}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#333333' }]}>
              Terms and Conditions for Eventora
            </Text>
            
            <Text style={[styles.effectiveDate, { color: isDark ? '#cccccc' : '#666666' }]}>
              Effective Date: July 1, 2025
            </Text>
            
            <Text style={[styles.introText, { color: isDark ? '#cccccc' : '#666666' }]}>
              Welcome to <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>Eventora</Text>! These Terms and Conditions ("Terms") govern your use of the Eventora mobile application ("App"). By using the App, you agree to comply with and be bound by these Terms. If you do not agree, please do not use the App.
            </Text>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                1. Use of the App
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                Eventora allows users to:
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Create and join events
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Upload and share media (photos, videos)
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • View media shared by other users within events
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                You agree to use the App only for lawful purposes and in a way that does not infringe on the rights of others.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                2. User Accounts
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                You may be required to register an account to use certain features. You are responsible for:
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Providing accurate information
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Maintaining the confidentiality of your login credentials
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • All activity under your account
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                3. Media Content and Permissions
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                By uploading content to Eventora, you:
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Confirm you own the rights or have permission to share the media
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Grant us a non-exclusive, worldwide license to host and display your content within the app
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                You may not upload:
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Offensive, violent, or illegal content
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Media that violates the privacy of others
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                We reserve the right to remove content that violates these rules.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                4. Camera and Storage Access
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                Eventora may request permission to:
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Access your <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>camera</Text> to take photos or videos
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • Access your <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>storage</Text> or <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>media library</Text> to upload content
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                These permissions are used only to support app features and are never used without your consent.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                5. Event Visibility and Sharing
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                Events may be <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>public</Text> or <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>private</Text>:
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>Public Events</Text>: Media is visible to all participants
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>Private Events</Text>: Media is restricted to invited users
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                You are responsible for managing the visibility of your events and media.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                6. Intellectual Property
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                All trademarks, logos, and app content (excluding user-uploaded content) are owned by Eventora. You may not reproduce, distribute, or create derivative works without our written permission.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                7. Termination
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                We may suspend or terminate your access to the App at any time if:
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • You violate these Terms
              </Text>
              <Text style={[styles.bulletPoint, { color: isDark ? '#cccccc' : '#666666' }]}>
                • You misuse the app or abuse other users
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                You may delete your account at any time via the app or by contacting us.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                8. Limitation of Liability
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                Eventora is provided <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>"as is"</Text> and we make no guarantees that the app will be error-free or available at all times. We are not liable for any loss of data, damages, or issues arising from the use of the app.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                9. Changes to Terms
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                We may update these Terms from time to time. Changes will be communicated through the app or our official communication channels. Continued use of the app means you accept the revised Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#333333' }]}>
                10. Contact Us
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#cccccc' : '#666666' }]}>
                If you have any questions or feedback regarding these Terms, please contact us at: 📧 <Text style={{ fontWeight: 'bold', color: '#5e35b1' }}>eventorahq@gmail.com</Text>
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDark ? '#333333' : '#e0e0e0' }]}
            onPress={onBack}
          >
            <Text style={[styles.backButtonText, { color: isDark ? '#ffffff' : '#333333' }]}>
              Back
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: '#5e35b1' }]}
            onPress={onAccept}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}