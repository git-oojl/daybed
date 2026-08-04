import { createContext } from "react";

export const PreviewSessionContext = createContext({
  isPreview: false,
  viewer: null,
  viewerId: null,
  user: null,
  isAuthenticated: false,
  setUser: () => undefined,
  clearSession: () => undefined,
  logout: async () => undefined,
});
