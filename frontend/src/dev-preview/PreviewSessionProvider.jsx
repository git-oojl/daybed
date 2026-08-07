import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PreviewSessionContext } from "../auth/previewSessionContext.js";

const OPERATIONAL_PERMISSION_CODES = [
  "dashboard.view",
  "products.view",
  "products.create",
  "products.update",
  "products.deactivate",
  "inventory.view",
  "inventory.adjust",
  "inventory.movements.view",
  "orders.view",
  "orders.status.update",
];

function buildPreviewUser(viewer) {
  if (!viewer.isAuthenticated) return null;
  return {
    id: `preview-${viewer.id}`,
    username: `preview_${viewer.id}`,
    email: viewer.id === "customer"
      ? "cliente.preview@daybed.local"
      : viewer.id === "employee"
        ? "empleado.preview@daybed.local"
        : "admin.preview@daybed.local",
    first_name: viewer.label,
    last_name: "Preview",
    phone: "6645550190",
    avatar: viewer.id === "admin"
      ? "/preview-avatars/admin.svg"
      : viewer.id === "employee"
        ? "/preview-avatars/employee.svg"
        : "/preview-avatars/customer.svg",
    state: "Baja California",
    city: "Tijuana",
    role: viewer.backendRole,
    effective_permission_codes:
      viewer.id === "employee" || viewer.id === "admin"
        ? OPERATIONAL_PERMISSION_CODES
        : [],
  };
}

function parseRouteLocation(value = "/") {
  try {
    const url = new URL(value, "https://preview.daybed.local");
    return {
      pathname: url.pathname || "/",
      search: url.search,
      hash: url.hash,
    };
  } catch {
    return { pathname: "/", search: "", hash: "" };
  }
}

function formatRouteLocation(routeLocation) {
  return `${routeLocation.pathname}${routeLocation.search}${routeLocation.hash}`;
}

function PreviewSessionProvider({ viewer, routeLocation, onRouteLocationChange, children }) {
  const initialUser = useMemo(() => buildPreviewUser(viewer), [viewer]);
  const [user, setUser] = useState(initialUser);
  const [effectiveRouteLocation, setEffectiveRouteLocation] = useState(
    () => parseRouteLocation(routeLocation),
  );
  const routeLocationRef = useRef(effectiveRouteLocation);

  useEffect(() => { setUser(initialUser); }, [initialUser]);
  useEffect(() => {
    const nextRouteLocation = parseRouteLocation(routeLocation);
    routeLocationRef.current = nextRouteLocation;
    setEffectiveRouteLocation(nextRouteLocation);
  }, [routeLocation]);

  const setRouteSearchParams = useCallback((nextInit, options) => {
    const current = routeLocationRef.current;
    const currentParams = new URLSearchParams(current.search);
    const nextValue = typeof nextInit === "function"
      ? nextInit(new URLSearchParams(currentParams))
      : nextInit;
    const nextParams = new URLSearchParams(nextValue);
    const search = nextParams.toString();
    const nextRouteLocation = {
      ...current,
      search: search ? `?${search}` : "",
    };

    routeLocationRef.current = nextRouteLocation;
    setEffectiveRouteLocation(nextRouteLocation);
    onRouteLocationChange?.(formatRouteLocation(nextRouteLocation), options);
  }, [onRouteLocationChange]);

  return (
    <PreviewSessionContext.Provider
      value={{
        isPreview: true,
        viewer,
        viewerId: viewer.id,
        user,
        isAuthenticated: Boolean(user),
        setUser,
        clearSession: () => setUser(null),
        logout: async () => setUser(null),
        routeLocation: effectiveRouteLocation,
        setRouteSearchParams,
      }}
    >
      {children}
    </PreviewSessionContext.Provider>
  );
}

export default PreviewSessionProvider;
