import { useEffect, useMemo, useState } from "react";
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

function PreviewSessionProvider({ viewer, children }) {
  const initialUser = useMemo(() => buildPreviewUser(viewer), [viewer]);
  const [user, setUser] = useState(initialUser);

  useEffect(() => { setUser(initialUser); }, [initialUser]);

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
      }}
    >
      {children}
    </PreviewSessionContext.Provider>
  );
}

export default PreviewSessionProvider;
