import config from '@/lib/config';
import onLogout from '@/lib/onLogout';
import axios from 'axios';
import { toast } from 'sonner';

const http = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
});

http.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error?.response?.data?.message || 'An error occurred';

      if (status === 401) {
        // Show the actual error message before logging out
        toast.error(message || 'Authentication failed. Please login again.');
        console.error('401 Unauthorized:', {
          url: error.config?.url,
          method: error.config?.method,
          message: message,
          data: error.response.data,
        });

        // Delay logout slightly so user can see the message
        setTimeout(() => {
          onLogout();
        }, 1500);
      } else if (status === 403) {
        // Permission denied
        toast.error(message || "You don't have permission to access this resource");
        console.error('403 Forbidden:', {
          url: error.config?.url,
          method: error.config?.method,
          message: message,
          data: error.response.data,
        });
      } else {
        toast.error(message);
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error?.response?.data);
  },
);

export default http;
