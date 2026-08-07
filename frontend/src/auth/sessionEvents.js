const SESSION_EXPIRED_EVENT = "daybed:session-expired";
const TOKENS_REFRESHED_EVENT = "daybed:tokens-refreshed";
const SESSION_REPLACED_EVENT = "daybed:session-replaced";

function dispatch(name, detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function subscribe(name, listener) {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event) => listener(event.detail);
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}

export function emitSessionExpired(detail = {}) {
  dispatch(SESSION_EXPIRED_EVENT, detail);
}

export function emitTokensRefreshed(tokens) {
  dispatch(TOKENS_REFRESHED_EVENT, tokens);
}

export function emitSessionReplaced(detail = {}) {
  dispatch(SESSION_REPLACED_EVENT, detail);
}

export function subscribeToSessionExpired(listener) {
  return subscribe(SESSION_EXPIRED_EVENT, listener);
}

export function subscribeToTokensRefreshed(listener) {
  return subscribe(TOKENS_REFRESHED_EVENT, listener);
}

export function subscribeToSessionReplaced(listener) {
  return subscribe(SESSION_REPLACED_EVENT, listener);
}
