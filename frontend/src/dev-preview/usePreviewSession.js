import { useContext } from "react";

import { PreviewSessionContext } from "../auth/previewSessionContext.js";

export function usePreviewSession() {
  return useContext(PreviewSessionContext);
}
