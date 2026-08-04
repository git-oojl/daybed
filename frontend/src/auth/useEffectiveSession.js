import { useContext } from "react";

import { PreviewSessionContext } from "./previewSessionContext.js";
import { useAuthStore } from "./authStore.js";

/**
 * Returns the active identity regardless of whether the page is running against
 * a real authenticated session or the local development preview.
 */
export function useEffectiveSession() {
  const previewSession = useContext(PreviewSessionContext);
  const storedUser = useAuthStore((state) => state.user);
  const storedViewerId = useAuthStore((state) => state.viewerId);
  const storedIsAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storedIsLoading = useAuthStore((state) => state.isLoading);
  const storedLogout = useAuthStore((state) => state.logout);
  const storedSetUser = useAuthStore((state) => state.setUser);
  const storedClearSession = useAuthStore((state) => state.clearSession);

  if (previewSession.isPreview) {
    return {
      user: previewSession.user,
      viewerId: previewSession.viewerId,
      isAuthenticated: previewSession.isAuthenticated,
      isLoading: false,
      isPreview: true,
      logout: previewSession.logout,
      setUser: previewSession.setUser,
      clearSession: previewSession.clearSession,
    };
  }

  return {
    user: storedUser,
    viewerId: storedViewerId,
    isAuthenticated: storedIsAuthenticated,
    isLoading: storedIsLoading,
    isPreview: false,
    logout: storedLogout,
    setUser: storedSetUser,
    clearSession: storedClearSession,
  };
}
