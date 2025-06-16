import apiClient from '../utils/apiClient';

// Types for invitation functionality
export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface Invitation {
  _id: string;
  id?: string;
  eventId: {
    _id: string;
    name: string;
    date: string;
    time?: string;
    location?: string;
    coverImage?: string;
    isPrivate: boolean;
    creatorName?: string;
    creatorProfileImage?: string;
  };
  inviterId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  inviteeId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  respondedAt?: string;
}

export interface InvitationData {
  eventId: string;
  inviteeId: string;
  message?: string;
}

export interface InvitationStats {
  eventId: string;
  invitationStats: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    expired: number;
  };
  currentParticipants: number;
}

// Helper function to map invitation IDs for frontend consistency
const mapInvitationIds = (invitation: any): Invitation => {
  if (!invitation) return invitation;
  
  const mappedInvitation = invitation._id && !invitation.id 
    ? { ...invitation, id: invitation._id } 
    : invitation;
  
  return mappedInvitation;
};

// Get all available users for invitation (excluding existing participants and invitees)
export const getAllAvailableUsers = async (eventId: string): Promise<User[]> => {
  try {
    const response = await apiClient.get('/invitations/available-users', {
      params: { eventId }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching available users:', error);
    throw error;
  }
};

// Send invitation to user
export const sendInvitation = async (invitationData: InvitationData): Promise<Invitation> => {
  try {
    console.log('Sending invitation:', invitationData);
    const response = await apiClient.post('/invitations', invitationData);
    
    const mappedInvitation = mapInvitationIds(response.data.data);
    console.log('Invitation sent successfully:', mappedInvitation);
    
    return mappedInvitation;
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw error;
  }
};

// Get user's received invitations
export const getReceivedInvitations = async (
  status: 'all' | 'pending' | 'accepted' | 'declined' | 'expired' = 'all',
  page = 1,
  limit = 10
): Promise<{ invitations: Invitation[], pagination: any }> => {
  try {
    const response = await apiClient.get('/invitations/received', {
      params: { status, page, limit }
    });
    
    const invitations = response.data.data.map(mapInvitationIds);
    const pagination = response.data.pagination;
    
    return { invitations, pagination };
  } catch (error) {
    console.error('Error fetching received invitations:', error);
    throw error;
  }
};

// Get user's sent invitations
export const getSentInvitations = async (
  eventId?: string,
  status: 'all' | 'pending' | 'accepted' | 'declined' | 'expired' = 'all',
  page = 1,
  limit = 10
): Promise<{ invitations: Invitation[], pagination: any }> => {
  try {
    const params: any = { status, page, limit };
    if (eventId) params.eventId = eventId;
    
    const response = await apiClient.get('/invitations/sent', { params });
    
    const invitations = response.data.data.map(mapInvitationIds);
    const pagination = response.data.pagination;
    
    return { invitations, pagination };
  } catch (error) {
    console.error('Error fetching sent invitations:', error);
    throw error;
  }
};

// Get single invitation details
export const getInvitation = async (invitationId: string): Promise<Invitation> => {
  try {
    const response = await apiClient.get(`/invitations/${invitationId}`);
    return mapInvitationIds(response.data.data);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    throw error;
  }
};

// Accept invitation
export const acceptInvitation = async (invitationId: string): Promise<{ invitation: Invitation, event: any }> => {
  try {
    console.log('Accepting invitation:', invitationId);
    const response = await apiClient.put(`/invitations/${invitationId}/accept`);
    
    const result = response.data.data;
    return {
      invitation: mapInvitationIds(result.invitation),
      event: result.event
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

// Decline invitation
export const declineInvitation = async (invitationId: string): Promise<Invitation> => {
  try {
    console.log('Declining invitation:', invitationId);
    const response = await apiClient.put(`/invitations/${invitationId}/decline`);
    
    return mapInvitationIds(response.data.data.invitation);
  } catch (error) {
    console.error('Error declining invitation:', error);
    throw error;
  }
};

// Cancel sent invitation
export const cancelInvitation = async (invitationId: string): Promise<void> => {
  try {
    console.log('Cancelling invitation:', invitationId);
    await apiClient.delete(`/invitations/${invitationId}`);
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    throw error;
  }
};

// Get invitation statistics for an event
export const getEventInvitationStats = async (eventId: string): Promise<InvitationStats> => {
  try {
    const response = await apiClient.get(`/invitations/event/${eventId}/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching invitation stats:', error);
    throw error;
  }
};