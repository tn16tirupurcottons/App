import axiosClient from "./axiosClient";

/** Base path for auth routes relative to axios `baseURL` (e.g. base `/api` → POST /api/auth/login). */
export const AUTH_LOGIN_PATH = "/auth/login";

/**
 * User login — always POST with JSON body.
 * @param {{ identifier: string, password: string }} credentials
 */
export function postLogin(credentials) {
  return axiosClient.request({
    url: AUTH_LOGIN_PATH,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: credentials,
  });
}
