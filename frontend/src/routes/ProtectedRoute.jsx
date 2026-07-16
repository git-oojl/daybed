import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../auth/authStore.js";
import { viewerRoles } from "../auth/roleMapping.js";
import { accessGroups } from "../auth/viewerAccess.js";
import { routePaths } from "./routePaths.js";

function ProtectedRoute({
  children,
  allowedViewers = accessGroups.all,
  redirectTo = "/no-autorizado",
}) {
  const location = useLocation();
  const viewerId = useAuthStore((state) => state.viewerId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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

  return children;
}

export default ProtectedRoute;
