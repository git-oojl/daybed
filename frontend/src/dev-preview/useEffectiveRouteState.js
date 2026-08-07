import { useContext, useMemo } from "react";
import {
  createSearchParams,
  matchPath,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { PreviewSessionContext } from "../auth/previewSessionContext.js";

export function useEffectiveLocation() {
  const routerLocation = useLocation();
  const previewSession = useContext(PreviewSessionContext);

  if (!previewSession.isPreview || !previewSession.routeLocation) {
    return routerLocation;
  }

  return {
    ...routerLocation,
    ...previewSession.routeLocation,
    state: routerLocation.state,
  };
}

export function useEffectiveParams(routePattern) {
  const routerParams = useParams();
  const previewSession = useContext(PreviewSessionContext);

  if (!previewSession.isPreview || !routePattern || !previewSession.routeLocation) {
    return routerParams;
  }

  return (
    matchPath(
      { path: routePattern, end: true },
      previewSession.routeLocation.pathname,
    )?.params ?? routerParams
  );
}

export function useEffectiveSearchParams(defaultInit) {
  const routerSearchParams = useSearchParams(defaultInit);
  const previewSession = useContext(PreviewSessionContext);
  const previewSearchParams = useMemo(
    () => createSearchParams(previewSession.routeLocation?.search || ""),
    [previewSession.routeLocation?.search],
  );

  if (!previewSession.isPreview || !previewSession.routeLocation) {
    return routerSearchParams;
  }

  return [previewSearchParams, previewSession.setRouteSearchParams];
}
