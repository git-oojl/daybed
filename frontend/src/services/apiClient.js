import axios from "axios";

import { getAccessToken } from "../auth/tokenStorage.js";
import { normalizeApiError } from "./apiErrors.js";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  if (isDevPreviewRoute()) {
    delete config.headers.Authorization;
    if (!isReadOnlyRequest(config.method)) {
      return Promise.reject(
        new Error(
          "Dev preview blocks write requests. Use real routes to test backend mutations.",
        ),
      );
    }
    return config;
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error)),
);

export async function apiRequest(config) {
  const response = await apiClient.request(config);
  return response.data;
}

function isDevPreviewRoute() {
  return (
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    window.location.pathname === "/dev/preview"
  );
}

function isReadOnlyRequest(method = "get") {
  return ["get", "head", "options"].includes(method.toLowerCase());
}
