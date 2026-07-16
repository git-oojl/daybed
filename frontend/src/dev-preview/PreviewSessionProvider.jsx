import { PreviewSessionContext } from "./previewSessionContext.js";

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
