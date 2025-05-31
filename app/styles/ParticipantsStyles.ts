import { StyleSheet } from 'react-native';

export const participantsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 20, // Space for status bar and notch
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  goBackButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  
  goBackButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
  },
  
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  
  participantName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
  
  participantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  
  roleText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '500',
  },
  
  joinedText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 8,
  },
  
  uploadsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  
  uploadsText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  
  uploadsLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  
  creatorBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  
  creatorBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  participantBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  
  participantBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
});