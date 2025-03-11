// services/AccountServices.ts
import { apiClient } from "@/AxiosApi/AxiosInstance";

// Add interface for image details response
export interface ImageDetailsResponse {
  image_id: string;
  user_id: string;
  model_id: string;
  backblaze_file_id: string;
  download_url: string;
  json: string;
  creation_timestamp: string;
}

// Add interface for user images response
export interface UserImage {
  download_url: string;
  creation_timestamp: string;
  model_id: string;
  image_id: string;
}

// Add interface for dedicated server response
export interface DedicatedServerResponse {
  server_id: string;
  user_id: string;
  plan: string;
  status: string;
  expiry_date: string;
}

// Add interface for user model response
export interface UserModelResponse {
  model_id: string;
  user_id: string;
  model_name: string;
  created_at: string;
  updated_at: string;
}

export const fetchSubscriptionDetails = async (userId: string, token: string) => {
  const response = await apiClient.get(`/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchUserImages = async (userId: string, token: string): Promise<UserImage[]> => {
  const response = await apiClient.get(`/user/${userId}/images`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchImageDetails = async (imageId: string, token: string): Promise<ImageDetailsResponse> => {
  const response = await apiClient.get(`/images/${imageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const generateApiKey = async (userId: string, token: string) => {
  const response = await apiClient.post(`/user/${userId}/api_key/new`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const resetApiKey = async (userId: string, token: string) => {
  const response = await apiClient.post(`/user/${userId}/api_key/reset`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch dedicated server details
export const fetchDedicatedServer = async (userId: string, token: string): Promise<DedicatedServerResponse> => {
  const response = await apiClient.get(`/user/${userId}/subscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch user model details
export const fetchUserModel = async (userId: string, token: string): Promise<UserModelResponse[]> => {
  const response = await apiClient.get(`/user/${userId}/models`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};