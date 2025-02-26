// services/AccountServices.ts
import { apiClient } from "@/AxiosApi/AxiosInstance";

export const fetchSubscriptionDetails = async (userId: string, token: string) => {
  const response = await apiClient.get(`/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchUserImages = async (userId: string, token: string) => {
  const response = await apiClient.get(`/user/${userId}/images`, {
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