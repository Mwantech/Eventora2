import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // White background
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff", // White header
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", // Light gray border
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937", // Dark gray (near black) for text
    marginLeft: 8,
  },
  scrollContent: {
    padding: 24,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280", // Gray for loading text
    fontSize: 16,
  },
  shareSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  shareIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#f3e8ff", // Light purple background
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  shareTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937", // Dark gray (near black)
    textAlign: "center",
  },
  shareDescription: {
    fontSize: 14,
    color: "#6b7280", // Gray
    textAlign: "center",
    marginTop: 8,
  },
  linkSection: {
    backgroundColor: "#f9fafb", // Very light gray
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937", // Dark gray
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#6b7280", // Gray
    flex: 1,
    flexWrap: "wrap",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626", // Red for errors
    flex: 1,
  },
  retryButton: {
    marginLeft: 8,
    backgroundColor: "#8b5cf6", // Purple
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#ffffff", // White
    fontSize: 14,
    marginLeft: 4,
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937", // Dark gray
    marginBottom: 12,
  },
  qrContainer: {
    backgroundColor: "#ffffff", // White
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb", // Light gray
  },
  qrErrorContainer: {
    width: 208,
    height: 208,
    backgroundColor: "#f3f4f6", // Light gray
    alignItems: "center",
    justifyContent: "center",
  },
  qrErrorText: {
    fontSize: 14,
    color: "#6b7280", // Gray
    textAlign: "center",
  },
  actionButtonsContainer: {
    flexDirection: "column", // Changed to column for vertical layout
    alignItems: "center", // Center buttons horizontally
    gap: 16, // Space between buttons
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: "#8b5cf6", // Purple
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "80%", // Fixed width for buttons
  },
  actionButtonDisabled: {
    backgroundColor: "#d1d5db", // Gray for disabled state
  },
  actionButtonSuccess: {
    backgroundColor: "#10b981", // Green for success state
  },
  actionButtonText: {
    color: "#ffffff", // White
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    backgroundColor: "#f9fafb", // Light gray
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280", // Gray
    textAlign: "center",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937", // Dark gray
    marginBottom: 16,
  },
  authDescription: {
    fontSize: 16,
    color: "#6b7280", // Gray
    textAlign: "center",
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: "#8b5cf6", // Purple
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  authButtonText: {
    color: "#ffffff", // White
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#8b5cf6", // Purple
    fontSize: 16,
  },
});