import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../auth/authStore.js";
import { viewerRoles } from "../auth/roleMapping.js";
import { accessGroups } from "../auth/viewerAccess.js";
import { usePreviewSession } from "../dev-preview/usePreviewSession.js";
import { routePaths } from "./routePaths.js";

function ProtectedRoute({
  children,
  allowedViewers = accessGroups.all,
  requiredPermission = null,
  redirectTo = "/no-autorizado",
}) {
  const location = useLocation();
  const previewSession = usePreviewSession();
  const storedUser = useAuthStore((state) => state.user);
  const storedViewerId = useAuthStore((state) => state.viewerId);
  const storedIsAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const viewerId = previewSession.isPreview
    ? previewSession.viewerId
    : storedViewerId;
  const user = previewSession.isPreview ? previewSession.user : storedUser;
  const isAuthenticated = previewSession.isPreview
    ? previewSession.isAuthenticated
    : storedIsAuthenticated;
  const guestAllowed = allowedViewers.includes(viewerRoles.guest);

  if (!isAuthenticated && !guestAllowed) {
    return (
      <Navigate
        to={routePaths.account.login}
        replace
        state={{ from: location }}
      />
    );
  }

  if (!allowedViewers.includes(viewerId)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (
    requiredPermission &&
    !previewSession.isPreview &&
    !hasEffectivePermission(user, requiredPermission)
  ) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
}

function hasEffectivePermission(user, permissionCode) {
  if (user?.role === "administrador") {
    return true;
  }
  return Boolean(user?.effective_permission_codes?.includes(permissionCode));
}

export default ProtectedRoute;
