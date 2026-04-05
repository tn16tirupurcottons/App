import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => config,
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

    const requestUrl = String(error.config?.url || "");
    const preserveServerMessage =
      requestUrl.includes("/auth/send-otp") || requestUrl.includes("/auth/verify-otp-register");

    const finalMessage =
      status >= 500 && !preserveServerMessage
        ? "Server error. Please try again later."
        : String(rawMessage);

    if (status === 401) {
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
