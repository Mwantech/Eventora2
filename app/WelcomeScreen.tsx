import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogin }) => {
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonOpacityAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Stagger animations for smooth entrance
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(logoScaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
      ]),
      // Tagline animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      // Buttons animation
      Animated.parallel([
        Animated.timing(buttonOpacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    onGetStarted();
  };

  const handleLogin = () => {
    onLogin();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image with Overlay */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Multi-layered overlay to simulate gradient */}
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle} />
        <View style={styles.overlayBottom} />
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Logo and Brand Section */}
          <Animated.View 
            style={[
              styles.logoSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScaleAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Eventora</Text>
              <View style={styles.logoAccent} />
            </View>
          </Animated.View>
          
          {/* Tagline */}
          <Animated.View
            style={[
              styles.taglineContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.tagline}>Capture the Moment.</Text>
            <Text style={styles.taglineSecondary}>Share the Memories.</Text>
          </Animated.View>
          
          {/* Buttons Section */}
          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: buttonOpacityAnim,
                transform: [{ translateY: buttonSlideAnim }],
              },
            ]}
          >
            {/* Get Started Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            {/* Login Button */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  // Multi-layer overlay approach to simulate gradient
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '33%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlayMiddle: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: '34%',
    backgroundColor: 'rgba(46,16,101,0.7)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '33%',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 80,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 50,
  },
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  logoAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#A855F7',
    borderRadius: 2,
    marginTop: 8,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  taglineSecondary: {
    fontSize: 24,
    fontWeight: '300',
    color: '#E5E7EB',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6', // Solid purple color instead of gradient
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: 150,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 200,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 300,
    left: 50,
  },
});

export default WelcomeScreen;