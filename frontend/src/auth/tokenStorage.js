const STORAGE_KEYS = {
  accessToken: "daybed.accessToken",
  refreshToken: "daybed.refreshToken",
  user: "daybed.user",
};

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getAccessToken() {
  return getStorage()?.getItem(STORAGE_KEYS.accessToken) ?? null;
}

export function getRefreshToken() {
  return getStorage()?.getItem(STORAGE_KEYS.refreshToken) ?? null;
}

export function getStoredUser() {
  const rawUser = getStorage()?.getItem(STORAGE_KEYS.user);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    clearStoredSession();
    return null;
  }
}

export function setStoredTokens({ access, refresh }) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (access) {
    storage.setItem(STORAGE_KEYS.accessToken, access);
  }
  if (refresh) {
    storage.setItem(STORAGE_KEYS.refreshToken, refresh);
  }
}

export function setStoredUser(user) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (user) {
    storage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } else {
    storage.removeItem(STORAGE_KEYS.user);
  }
}

export function setStoredSession({ access, refresh, user }) {
  setStoredTokens({ access, refresh });
  setStoredUser(user);
}

export function clearStoredSession() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(STORAGE_KEYS.accessToken);
  storage.removeItem(STORAGE_KEYS.refreshToken);
  storage.removeItem(STORAGE_KEYS.user);
}
