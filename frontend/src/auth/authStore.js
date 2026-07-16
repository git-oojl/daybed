import { create } from "zustand";

import {
  getCurrentUser,
  loginWithEmail,
  logoutRefreshToken,
  refreshAccessToken,
} from "./authService.js";
import { getViewerIdForUser, viewerRoles } from "./roleMapping.js";
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredSession,
  setStoredTokens,
  setStoredUser,
} from "./tokenStorage.js";

const initialUser = getStoredUser();

export const useAuthStore = create((set, get) => ({
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  user: initialUser,
  viewerId: getViewerIdForUser(initialUser),
  isAuthenticated: Boolean(getAccessToken() && initialUser),
  isLoading: false,
  error: null,

  setSession(session) {
    setStoredSession(session);
    set({
      accessToken: session.access,
      refreshToken: session.refresh,
      user: session.user,
      viewerId: getViewerIdForUser(session.user),
      isAuthenticated: Boolean(session.access && session.user),
      error: null,
    });
  },

  clearSession() {
    clearStoredSession();
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      viewerId: viewerRoles.guest,
      isAuthenticated: false,
      error: null,
    });
  },

  async login(credentials) {
    set({ isLoading: true, error: null });
    try {
      const session = await loginWithEmail(credentials);
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
    if (!get().accessToken) {
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentUser();
      setStoredUser(user);
      set({
        user,
        viewerId: getViewerIdForUser(user),
        isAuthenticated: Boolean(get().accessToken && user),
      });
      return user;
    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  async refreshSession() {
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      get().clearSession();
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const tokens = await refreshAccessToken(refreshToken);
      setStoredTokens(tokens);
      set({
        accessToken: tokens.access,
        refreshToken: tokens.refresh ?? refreshToken,
        isAuthenticated: Boolean(tokens.access && get().user),
      });
      return tokens;
    } catch (error) {
      get().clearSession();
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  async logout() {
    const refreshToken = get().refreshToken;
    get().clearSession();
    await logoutRefreshToken(refreshToken);
  },
}));
