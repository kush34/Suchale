import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL,
  withCredentials:true,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
