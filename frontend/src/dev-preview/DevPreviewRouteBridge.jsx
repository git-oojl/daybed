import { Navigate, useLocation } from "react-router-dom";

import {
  getDefaultModeFromBackendStatus,
  readDevViewSwitcherSelection,
} from "./devViewSwitcherSelection.js";
import { useBackendStatus } from "./useBackendStatus.js";
import {
  canPreviewLayout,
  getAllowedPreviewViewer,
  getPreviewLayout,
  getPreviewPath,
  getPreviewView,
  getPreviewViewer,
  getViewIdFromPath,
} from "./viewPreviewRegistry.jsx";

function DevPreviewRouteBridge({ children }) {
  const location = useLocation();
  const backendStatus = useBackendStatus();
  const selection = readDevViewSwitcherSelection();
  const isPreviewRoute = location.pathname === "/dev/preview";

  const currentMode =
    selection.mode ?? getDefaultModeFromBackendStatus(backendStatus.state);

  if (currentMode !== "preview" || isPreviewRoute) {
    return children;
  }

  const nextView = getPreviewView(getViewIdFromPath(location.pathname));
  const selectedLayout = getPreviewLayout(selection.layoutId);
  const selectedViewer = getPreviewViewer(selection.viewerId);
  const nextLayoutId = canPreviewLayout(nextView, selectedLayout.id)
    ? selectedLayout.id
    : nextView.defaultLayout;
  const nextViewerId = getAllowedPreviewViewer(nextView, selectedViewer.id).id;

  return (
    <Navigate
      replace
      to={getPreviewPath(nextView.id, nextLayoutId, nextViewerId)}
    />
  );
}

export default DevPreviewRouteBridge;
