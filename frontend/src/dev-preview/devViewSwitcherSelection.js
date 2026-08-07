const DEV_VIEW_SWITCHER_STORAGE_KEY = "daybed:dev-view-switcher";
const DEV_VIEW_SWITCHER_OPEN_STORAGE_KEY = "daybed:dev-view-switcher:open";
const VALID_MODES = new Set(["normal", "preview"]);

export function readDevViewSwitcherSelection() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedValue = window.sessionStorage.getItem(
      DEV_VIEW_SWITCHER_STORAGE_KEY,
    );

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);

    return {
      layoutId:
        typeof parsedValue.layoutId === "string"
          ? parsedValue.layoutId
          : undefined,
      mode: VALID_MODES.has(parsedValue.mode) ? parsedValue.mode : undefined,
      viewerId:
        typeof parsedValue.viewerId === "string"
          ? parsedValue.viewerId
          : undefined,
    };
  } catch {
    return {};
  }
}

export function saveDevViewSwitcherSelection(selection) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      DEV_VIEW_SWITCHER_STORAGE_KEY,
      JSON.stringify(selection),
    );
  } catch {
    // Ignore storage failures so the dev helper remains usable in restricted browsers.
  }
}

export function readDevViewSwitcherOpenState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const storedValue = window.localStorage.getItem(
      DEV_VIEW_SWITCHER_OPEN_STORAGE_KEY,
    );

    return storedValue === null ? false : storedValue === "true";
  } catch {
    return false;
  }
}

export function saveDevViewSwitcherOpenState(isOpen) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      DEV_VIEW_SWITCHER_OPEN_STORAGE_KEY,
      String(Boolean(isOpen)),
    );
  } catch {
    // Ignore storage failures so the dev helper remains usable in restricted browsers.
  }
}

export function getDefaultModeFromBackendStatus(status) {
  if (status === "offline") {
    return "preview";
  }

  return "normal";
}
