import axios from "axios";

import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  setStoredTokens,
} from "../auth/tokenStorage.js";
import {
  emitSessionExpired,
  emitTokensRefreshed,
  subscribeToSessionReplaced,
} from "../auth/sessionEvents.js";
import { isPreviewModeActive } from "../dev-preview/previewMode.js";
import { apiEndpoints } from "./apiEndpoints.js";
import {
  API_ERROR_KINDS,
  ApiError,
  createPreviewUnsupportedError,
  normalizeApiError,
} from "./apiErrors.js";
import { getPreviewFixtureResponse } from "./apiFixtures.js";
import { createSingleFlightCoordinator } from "./authRefreshCoordinator.js";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const refreshCoordinator = createSingleFlightCoordinator();
let requestGeneration = 0;
let activeController = new AbortController();

subscribeToSessionReplaced(() => resetApiRequestState());

export function resetApiRequestState() {
  requestGeneration += 1;
  activeController.abort("session-replaced");
  activeController = new AbortController();
  refreshCoordinator.reset();
}

apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  config.__daybedGeneration = requestGeneration;
  config.__daybedPreview = isPreviewModeActive();
  if (!config.signal) config.signal = activeController.signal;

  if (config.__daybedPreview) {
    delete config.headers.Authorization;
    return config;
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.config?.__daybedGeneration !== requestGeneration) {
      return Promise.reject(
        new ApiError("La sesión cambió antes de completar la solicitud.", {
          kind: API_ERROR_KINDS.CANCELLED,
        }),
      );
    }
    return response;
  },
  async (error) => {
    const config = error?.config || {};

    if (
      error?.response?.status === 401 &&
      !config.__daybedPreview &&
      !config.__daybedRetried &&
      canRefreshRequest(config)
    ) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const tokens = await refreshTokensOnce(refreshToken);
          config.__daybedRetried = true;
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${tokens.access}`;
          config.__daybedGeneration = requestGeneration;
          config.signal = activeController.signal;
          return apiClient.request(config);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      expireSession();
      return Promise.reject(
        normalizeApiError(error, { kind: API_ERROR_KINDS.AUTH_EXPIRED }),
      );
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export async function apiRequest(config) {
  if (isPreviewModeActive()) {
    try {
      const previewFixture = getPreviewFixtureResponse(config);
      if (previewFixture !== undefined) {
        return await Promise.resolve(previewFixture);
      }
      throw createPreviewUnsupportedError(config.method);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error?.message || "No pudimos completar esta acción en preview.",
        {
          kind: API_ERROR_KINDS.VALIDATION,
          data: error,
          cause: error,
        },
      );
    }
  }

  const response = await apiClient.request(config);
  return response.data;
}

function canRefreshRequest(config) {
  const path = String(config.url || "");
  return ![
    apiEndpoints.auth.login,
    apiEndpoints.auth.refresh,
    apiEndpoints.auth.logout,
  ].some((endpoint) => path.includes(endpoint));
}

async function refreshTokensOnce(refreshToken) {
  return refreshCoordinator.run(async () => {
    const refreshGeneration = requestGeneration;
    try {
      const { data } = await refreshClient.post(apiEndpoints.auth.refresh, {
        refresh: refreshToken,
      });
      if (refreshGeneration !== requestGeneration) {
        throw new ApiError("La sesión cambió durante la renovación.", {
          kind: API_ERROR_KINDS.CANCELLED,
        });
      }
      if (!data?.access) {
        throw new ApiError("No se pudo renovar la sesión.", {
          kind: API_ERROR_KINDS.AUTH_EXPIRED,
        });
      }
      const tokens = {
        access: data.access,
        refresh: data.refresh || refreshToken,
      };
      setStoredTokens(tokens);
      emitTokensRefreshed(tokens);
      return tokens;
    } catch (error) {
      if (
        refreshGeneration !== requestGeneration ||
        error?.kind === API_ERROR_KINDS.CANCELLED
      ) {
        throw new ApiError(
          "La solicitud anterior fue cancelada al cambiar de sesión.",
          {
            kind: API_ERROR_KINDS.CANCELLED,
            cause: error,
          },
        );
      }
      expireSession();
      throw new ApiError(
        "Tu sesión venció. Inicia sesión nuevamente para continuar.",
        {
          kind: API_ERROR_KINDS.AUTH_EXPIRED,
          status: error?.response?.status ?? null,
          data: error?.response?.data ?? null,
          cause: error,
        },
      );
    }
  });
}

function expireSession() {
  clearStoredSession();
  resetApiRequestState();
  emitSessionExpired({
    message: "Tu sesión venció. Inicia sesión nuevamente para continuar.",
  });
}
