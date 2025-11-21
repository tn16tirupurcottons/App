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
      // Clear invalid token
      localStorage.removeItem("tn16_token");
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Never log sensitive information
    // Only log generic errors in development
    if (import.meta.env.DEV && status >= 500) {
      console.error("API error:", status);
    }

    // Return sanitized error (don't expose internal details)
    return Promise.reject({
      status,
      message: status >= 500 ? "Server error. Please try again later." : message,
    });
  }
);

export default axiosClient;
