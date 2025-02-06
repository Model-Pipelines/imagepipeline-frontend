// AxiosInstance.ts
import axios, { AxiosInstance } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.imagepipeline.io',
  headers: {
    'API-Key': 'pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn',
  },
});
