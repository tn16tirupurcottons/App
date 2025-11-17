import axios from "axios";

// Base URL from environment variable or fallback
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token if exists
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tn16_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      console.warn("Unauthorized! Redirect to login if needed.");
      // window.location.href = "/login"; // optional auto-redirect
    }

    console.error("API error:", message);
    return Promise.reject(error);
  }
);

export default axiosClient;
