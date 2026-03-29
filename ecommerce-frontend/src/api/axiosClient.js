import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  // JWT is sent via Authorization; omit credentials to avoid CORS edge cases with wildcard origins.
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tn16_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const rawMessage =
      (typeof data === "object" && data !== null && data.message) ||
      (typeof data === "string" ? data : null) ||
      error.message ||
      "Request failed";

    const finalMessage =
      status >= 500 ? "Server error. Please try again later." : String(rawMessage);

    if (status === 401) {
      localStorage.removeItem("tn16_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (import.meta.env.DEV) {
      const cfg = error.config;
      const fullUrl = `${cfg?.baseURL ?? ""}${cfg?.url ?? ""}`;
      if (status === 405 || status === 404) {
        console.error(
          "API routing error:",
          status,
          (cfg?.method || "GET").toUpperCase(),
          fullUrl,
          rawMessage
        );
      } else if (status >= 500) {
        console.error("API error:", status, rawMessage);
      }
    }

    const normalized = Object.assign(new Error(finalMessage), {
      isAxiosError: true,
      status,
      message: finalMessage,
      response: {
        status: status ?? 0,
        data:
          typeof data === "object" && data !== null
            ? { ...data, message: finalMessage }
            : { message: finalMessage },
      },
    });
    return Promise.reject(normalized);
  }
);

export default API;
