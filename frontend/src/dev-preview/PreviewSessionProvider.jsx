import { PreviewSessionContext } from "./previewSessionContext.js";

function PreviewSessionProvider({ viewer, children }) {
  return (
    <PreviewSessionContext.Provider
      value={{
        isPreview: true,
        viewer,
      }}
    >
      {children}
    </PreviewSessionContext.Provider>
  );
}

export default PreviewSessionProvider;
