import { StyleSheet, Dimensions, Platform } from "react-native";

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get("window");

const authStyles = StyleSheet.create({
  // Add safe area for status bar
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9fc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9f9fc", // Light background with slight blue tint
  },
  // Improved ScrollView styling
  scrollViewContent: {
    flexGrow: 1,  // Important for scrollability
    paddingHorizontal: 24,
    paddingVertical: 20, // Reduced from 48 to prevent content from being pushed down
    paddingBottom: 100, // Extra padding at bottom to ensure all content is reachable
    minHeight: height, // Ensures scrolling works even on taller screens
  },
  headerContainer: {
    marginBottom: 32, // Reduced from 40 to bring form closer
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginTop: 12, // Small margin to create ~20px spacing from logo
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    letterSpacing: 0.2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "#333",
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: "#5e35b1",
    shadowOpacity: 0.1,
  },
  button: {
    backgroundColor: "#5e35b1", // Deep purple
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#5e35b1",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#bbb0db", // Light purple
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    color: "#666",
    fontSize: 15,
  },
  link: {
    color: "#5e35b1",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 4,
  },
  errorBox: {
    backgroundColor: "rgba(255, 76, 76, 0.08)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4c4c",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "500",
  },
  // Add form container card effect
  formCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginHorizontal: width > 500 ? width * 0.1 : 0, // Add margins on larger screens
  },
  // Add a divider
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
  // Add social login buttons
  socialButtonsContainer: {
    marginTop: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  socialButtonText: {
    marginLeft: 10,
    color: "#333",
    fontWeight: "500",
  },
  // Updated logo container and styles
  logoContainer: {
    alignItems: "center",
    marginBottom: -70, // Reduced to bring title closer to logo
    marginTop: -50, // Added top margin to position logo at top
    width: "100%", // Ensure it can accommodate larger images
  },
  // Keep the original logo style as fallback
  logo: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: "#5e35b1",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  // Updated logo image style with larger dimensions
  logoImage: {
    width: 250,
    height: 250,
    borderRadius: 25,
  },
  // Add footer text
  footer: {
    marginTop: 40,
    alignItems: "center",
    paddingBottom: 20, // Additional padding to ensure footer is visible
  },
  footerText: {
    color: "#999",
    fontSize: 12,
  },
});

export default authStyles;