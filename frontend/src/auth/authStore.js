import { create } from "zustand";

import {
  getCurrentUser,
  loginWithEmail,
  logoutRefreshToken,
} from "./authService.js";
import { getViewerIdForUser, viewerRoles } from "./roleMapping.js";
import {
  emitSessionReplaced,
  subscribeToSessionExpired,
  subscribeToTokensRefreshed,
} from "./sessionEvents.js";
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredSession,
  setStoredUser,
} from "./tokenStorage.js";

const initialAccessToken = getAccessToken();
const initialRefreshToken = getRefreshToken();
const initialUser = initialAccessToken || initialRefreshToken ? getStoredUser() : null;

if (!initialAccessToken && !initialRefreshToken) clearStoredSession();

export const useAuthStore = create((set, get) => ({
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  user: initialUser,
  viewerId: getViewerIdForUser(initialUser),
  isAuthenticated: Boolean(initialAccessToken && initialUser),
  isLoading: false,
  error: null,

  setSession(session) {
    if (!session?.access || !session?.user) return;
    clearStoredSession();
    setStoredSession(session);
    emitSessionReplaced({ reason: "login", userId: session.user.id });
    set({
      accessToken: session.access,
      refreshToken: session.refresh || null,
      user: session.user,
      viewerId: getViewerIdForUser(session.user),
      isAuthenticated: true,
      error: null,
    });
  },

  clearSession({ message = null, emit = true } = {}) {
    clearStoredSession();
    if (emit) emitSessionReplaced({ reason: "logout" });
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      viewerId: viewerRoles.guest,
      isAuthenticated: false,
      isLoading: false,
      error: message ? new Error(message) : null,
    });
  },

  setUser(user) {
    if (!user) return;
    setStoredUser(user);
    set({
      user,
      viewerId: getViewerIdForUser(user),
      isAuthenticated: Boolean(get().accessToken && user),
    });
  },

  async login(credentials) {
    get().clearSession({ emit: true });
    set({ isLoading: true, error: null });
    try {
      const session = await loginWithEmail(credentials);
      if (!session?.access || !session?.user) {
        throw new Error("No se pudo iniciar una sesión válida.");
      }
      get().setSession(session);
      return session;
    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  async loadCurrentUser() {
    if (!get().accessToken && !get().refreshToken) return null;

    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentUser();
      setStoredUser(user);
      set({
        user,
        viewerId: getViewerIdForUser(user),
        isAuthenticated: Boolean(getAccessToken() && user),
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
      });
      return user;
    } catch (error) {
      if (error?.kind === "auth_expired" || error?.status === 401) {
        get().clearSession({ message: error.message, emit: false });
      } else {
        set({ error });
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  async refreshSession() {
    if (!getRefreshToken()) {
      get().clearSession({ emit: false });
      return null;
    }

    // getCurrentUser goes through the global API client. A stale access token
    // therefore uses the same single-flight refresh coordinator as every other
    // protected request instead of creating a competing refresh path.
    return get().loadCurrentUser();
  },

  async logout() {
    const refreshToken = getRefreshToken();
    get().clearSession({ emit: true });
    if (refreshToken) {
      try {
        await logoutRefreshToken(refreshToken);
      } catch {
        // The local session is already closed. A stale/blacklisted refresh token
        // must never prevent logout or leave credentials behind.
      }
    }
  },
}));

subscribeToTokensRefreshed((tokens) => {
  useAuthStore.setState((state) => ({
    accessToken: tokens.access,
    refreshToken: tokens.refresh || state.refreshToken,
    isAuthenticated: Boolean(tokens.access && state.user),
  }));
});

subscribeToSessionExpired(({ message } = {}) => {
  useAuthStore.getState().clearSession({
    message: message || "Tu sesión venció. Inicia sesión nuevamente.",
    emit: false,
  });
});
