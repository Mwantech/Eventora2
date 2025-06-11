import { StyleSheet, Dimensions, Platform, useColorScheme } from "react-native";

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get("window");

// Create a function to get adaptive styles based on color scheme
export const getAuthStyles = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    // Add safe area for status bar
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f9f9fc",
    },
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f9f9fc",
    },
    // Improved ScrollView styling
    scrollViewContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 20,
      paddingBottom: 100,
      minHeight: height,
    },
    headerContainer: {
      marginBottom: 32,
      alignItems: "center",
    },
    subtitle: {
      fontSize: 18,
      textAlign: "center",
      color: isDark ? "#e0e0e0" : "#666",
      marginTop: 12,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      letterSpacing: 0.2,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      color: isDark ? "#e0e0e0" : "#333",
      marginBottom: 8,
      fontSize: 16,
      fontWeight: "500",
      letterSpacing: 0.3,
    },
    input: {
      backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#404040" : "#e0e0e0",
      fontSize: 16,
      color: isDark ? "#ffffff" : "#000000", // This ensures password dots are visible
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    inputFocused: {
      borderColor: "#5e35b1",
      shadowOpacity: isDark ? 0.4 : 0.1,
    },
    button: {
      backgroundColor: "#5e35b1",
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
      backgroundColor: "#bbb0db",
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
      color: isDark ? "#b0b0b0" : "#666",
      fontSize: 15,
    },
    link: {
      color: "#5e35b1",
      fontWeight: "600",
      fontSize: 15,
      marginLeft: 4,
    },
    errorBox: {
      backgroundColor: isDark ? "rgba(255, 76, 76, 0.15)" : "rgba(255, 76, 76, 0.08)",
      padding: 12,
      borderRadius: 10,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: "#ff4c4c",
    },
    errorText: {
      color: "#ff6b6b",
      fontSize: 14,
      fontWeight: "500",
    },
    // Add form container card effect
    formCard: {
      backgroundColor: isDark ? "#2a2a2a" : "white",
      borderRadius: 16,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 5,
      marginHorizontal: width > 500 ? width * 0.1 : 0,
    },
    // Add a divider
    divider: {
      height: 1,
      backgroundColor: isDark ? "#404040" : "#e0e0e0",
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
      backgroundColor: isDark ? "#2a2a2a" : "#fff",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "#404040" : "#e0e0e0",
    },
    socialButtonText: {
      marginLeft: 10,
      color: isDark ? "#e0e0e0" : "#333",
      fontWeight: "500",
    },
    // Updated logo container and styles
    logoContainer: {
      alignItems: "center",
      marginBottom: -20,
      marginTop: -20,
      width: "100%",
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
      width: 200,
      height: 200,
      borderRadius: 25,
    },
    // Add footer text
    footer: {
      marginTop: 40,
      alignItems: "center",
      paddingBottom: 20,
    },
    footerText: {
      color: isDark ? "#808080" : "#999",
      fontSize: 12,
    },
  });
};

// Keep the original export for backward compatibility
const authStyles = StyleSheet.create({
  // Add safe area for status bar
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9fc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9f9fc",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 100,
    minHeight: height,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginTop: 12,
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
    color: "#000000", // Explicit text color for password dots
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
    backgroundColor: "#5e35b1",
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
    backgroundColor: "#bbb0db",
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
  formCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginHorizontal: width > 500 ? width * 0.1 : 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
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
  logoContainer: {
    alignItems: "center",
    marginBottom: -20,
    marginTop: -20,
    width: "100%",
  },
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
  logoImage: {
    width: 200,
    height: 200,
    borderRadius: 25,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    color: "#999",
    fontSize: 12,
  },
});

export default authStyles;