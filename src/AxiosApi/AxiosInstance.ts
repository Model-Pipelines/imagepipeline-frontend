// AxiosInstance.ts
import axios, { AxiosInstance } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.imagepipeline.io',

});
