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

  // ✅ SET SESSION - GUARDA EN LOCALSTORAGE SIEMPRE
  setSession(session) {
    // ✅ ELIMINAR BLOQUEO DE DEV PREVIEW
    // if (isDevPreviewRoute()) {
    //   return;
    // }

    // ✅ Guardar siempre en localStorage
    if (session?.access) {
      setStoredSession(session);
      set({
        accessToken: session.access,
        refreshToken: session.refresh || get().refreshToken,
        user: session.user,
        viewerId: getViewerIdForUser(session.user),
        isAuthenticated: Boolean(session.access && session.user),
        error: null,
      });
    } else {
      console.warn("Intento de setSession sin token de acceso");
    }
  },

  // ✅ CLEAR SESSION - LIMPIA LOCALSTORAGE
  clearSession() {
    // if (isDevPreviewRoute()) {
    //   return;
    // }

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

  // ✅ SET USER - GUARDA USUARIO EN LOCALSTORAGE
  setUser(user) {
    // if (isDevPreviewRoute()) {
    //   return;
    // }

    if (user) {
      setStoredUser(user);
      set({
        user,
        viewerId: getViewerIdForUser(user),
        isAuthenticated: Boolean(get().accessToken && user),
      });
    }
  },

  // ✅ LOGIN - CORREGIDO CON MANEJO DE ERRORES
  async login(credentials) {
    // ⚠️ COMENTADO PARA PERMITIR LOGIN EN DESARROLLO
    // if (isDevPreviewRoute()) {
    //   throw new Error(
    //     "Dev preview does not persist real sessions. Use /login to test backend auth.",
    //   );
    // }

    set({ isLoading: true, error: null });
    try {
      const session = await loginWithEmail(credentials);
      
      // ✅ Verificar que el token existe antes de guardar
      if (!session?.access) {
        throw new Error("No se recibió token de acceso");
      }
      
      // ✅ Guardar sesión
      get().setSession(session);
      
      console.log("Login exitoso, token guardado");
      return session;
    } catch (error) {
      console.error("Error en login:", error);
      set({ error: error.message || "Error al iniciar sesión" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ LOAD CURRENT USER
  async loadCurrentUser() {
    // if (isDevPreviewRoute()) {
    //   return null;
    // }

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

  // ✅ REFRESH SESSION
  async refreshSession() {
    // if (isDevPreviewRoute()) {
    //   return null;
    // }

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

  // ✅ LOGOUT
  async logout() {
    // if (isDevPreviewRoute()) {
    //   return;
    // }

    const refreshToken = get().refreshToken;
    get().clearSession();
    if (refreshToken) {
      await logoutRefreshToken(refreshToken);
    }
  },
}));
