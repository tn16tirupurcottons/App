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
    const rawMessage = error.response?.data?.message || error.message || "Request failed";
    const finalMessage =
      status >= 500 ? "Server error. Please try again later." : rawMessage;

    if (status === 401) {
      localStorage.removeItem("tn16_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (import.meta.env.DEV && status >= 500) {
      console.error("API error:", status, rawMessage);
    }

    // Preserve axios-like shape so callers using err.response?.data?.message still work
    const normalized = Object.assign(new Error(finalMessage), {
      isAxiosError: true,
      status,
      message: finalMessage,
      response: {
        status: status ?? 0,
        data: { message: finalMessage },
      },
    });
    return Promise.reject(normalized);
  }
);

export default axiosClient;
