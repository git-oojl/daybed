import { useContext } from "react";

import { PreviewSessionContext } from "./previewSessionContext.js";

export function usePreviewSession() {
  return useContext(PreviewSessionContext);
}
