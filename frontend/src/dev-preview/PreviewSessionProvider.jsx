import { PreviewSessionContext } from "../auth/previewSessionContext.js";

const OPERATIONAL_PERMISSION_CODES = [
  "dashboard.view",
  "products.view",
  "products.create",
  "products.update",
  "inventory.view",
  "inventory.adjust",
  "orders.view",
  "orders.status.update",
];

function PreviewSessionProvider({ viewer, children }) {
  const user = viewer.isAuthenticated
    ? {
        id: `preview-${viewer.id}`,
        username: `preview_${viewer.id}`,
        email: `preview-${viewer.id}@daybed.local`,
        first_name: viewer.label,
        last_name: "Preview",
        phone: "",
        state: "",
        city: "",
        role: viewer.backendRole,
        effective_permission_codes:
          viewer.id === "employee" || viewer.id === "admin"
            ? OPERATIONAL_PERMISSION_CODES
            : [],
      }
    : null;

  return (
    <PreviewSessionContext.Provider
      value={{
        isPreview: true,
        viewer,
        viewerId: viewer.id,
        user,
        isAuthenticated: viewer.isAuthenticated,
      }}
    >
      {children}
    </PreviewSessionContext.Provider>
  );
}

export default PreviewSessionProvider;
