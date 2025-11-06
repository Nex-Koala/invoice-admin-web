import { message } from 'antd';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { history } from 'umi';
import { refreshJWToken } from './ant-design-pro/authService';

// Track if we're already refreshing to prevent multiple concurrent refreshes
let isRefreshing = false;
// Queue for requests waiting for token refresh
let failedQueue: Array<{
  resolve: Function;
  reject: (error: AxiosError) => void;
}> = [];

// Create Axios instance
const httpClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

// Request interceptor
httpClient.interceptors.request.use(config => config, error => Promise.reject(error));

// Response interceptor
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isLoginRequest = originalRequest.url?.includes('/token');

      if (isLoginRequest) {
        const detail = error.response?.data?.detail;

        if (detail === 'authentication failed') {
          message.error('Login failed. Please check your email or password.');
        } else if (detail) {
          message.error(detail);
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(httpClient(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        await refreshJWToken();
        processQueue(null);
        return httpClient(originalRequest);

      } catch (refreshError: any) {
        processQueue(refreshError);

        localStorage.removeItem('currentUser');
        message.error('Session expired. Please log in again.');
        history.push('/user/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 403:
          message.error('Access denied.');
          break;

        case 404:
          message.error(data?.message || 'Resource not found.');
          break;

        case 500:
          message.error('Server error. Please try again later.');
          break;

        default:
          message.error(data?.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      message.error('No response from the server. Please check your connection.');
    } else {
      message.error('Request failed. Please try again.');
    }

    return Promise.reject(error);
  },
);

export default httpClient;
