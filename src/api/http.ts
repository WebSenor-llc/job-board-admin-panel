import config from "@/lib/config";
import onLogout from "@/lib/onLogout";
import axios from "axios";
import { toast } from "sonner";

const http = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
});

http.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem("token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        onLogout();
      } else {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    }
    return Promise.reject(error?.response?.data);
  }
);

export default http;
