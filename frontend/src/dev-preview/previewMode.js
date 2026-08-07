import { readDevViewSwitcherSelection } from "./devViewSwitcherSelection.js";

export function isPreviewModeActive() {
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  if (window.location.pathname === "/dev/preview") return true;
  return readDevViewSwitcherSelection().mode === "preview";
}
