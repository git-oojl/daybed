import { Navigate, useSearchParams } from "react-router-dom";
import PreviewSessionProvider from "./PreviewSessionProvider.jsx";
import {
  canPreviewLayout,
  canPreviewViewer,
  getAllowedPreviewViewer,
  getPreviewLayout,
  getPreviewView,
  previewLayouts,
  previewViewers,
} from "./viewPreviewRegistry.jsx";

function DevPreviewPage() {
  const [searchParams] = useSearchParams();
  const viewId = searchParams.get("view");
  const layoutId = searchParams.get("layout");
  const viewerId = searchParams.get("viewer");
  const view = getPreviewView(viewId);
  const layout = getPreviewLayout(layoutId ?? view.defaultLayout);
  const viewer = getAllowedPreviewViewer(view, viewerId);

  if (!viewId || !layoutId || viewerId !== viewer.id) {
    return (
      <Navigate
        replace
        to={`/dev/preview?view=${view.id}&layout=${view.defaultLayout}&viewer=${viewer.id}`}
      />
    );
  }

  const isLayoutAllowed = canPreviewLayout(view, layout.id);
  const isViewerAllowed = canPreviewViewer(view, viewer.id);

  if (!isLayoutAllowed || !isViewerAllowed) {
    return (
      <ForbiddenPreview
        isLayoutAllowed={isLayoutAllowed}
        isViewerAllowed={isViewerAllowed}
        layout={layout}
        view={view}
        viewer={viewer}
      />
    );
  }

  const LayoutComponent = layout.Component;
  const ViewComponent = view.Component;

  return (
    <PreviewSessionProvider viewer={viewer}>
      <LayoutComponent>
        <ViewComponent />
      </LayoutComponent>
    </PreviewSessionProvider>
  );
}

function ForbiddenPreview({
  isLayoutAllowed,
  isViewerAllowed,
  view,
  layout,
  viewer,
}) {
  return (
    <main>
      <h1>Preview bloqueado</h1>
      <section aria-labelledby="dev-preview-forbidden-title">
        <h2 id="dev-preview-forbidden-title">Combinación no permitida</h2>
        {!isLayoutAllowed ? (
          <PreviewBlockReason title="Layout no permitido">
            La vista <strong>{view.label}</strong> no se puede previsualizar con
            el layout <strong>{layout.label}</strong>.
          </PreviewBlockReason>
        ) : null}
        {!isViewerAllowed ? (
          <PreviewBlockReason title="Perfil sin acceso">
            La vista <strong>{view.label}</strong> no debería ser visible para
            el perfil <strong>{viewer.label}</strong>.
          </PreviewBlockReason>
        ) : null}
        <p>Layouts permitidos para esta vista:</p>
        <ul>
          {view.allowedLayouts.map((allowedLayoutId) => {
            const allowedLayout = previewLayouts.find(
              ({ id }) => id === allowedLayoutId,
            );

            return (
              <li key={allowedLayoutId}>
                {allowedLayout?.label ?? allowedLayoutId}
              </li>
            );
          })}
        </ul>
        <p>Perfiles permitidos para esta vista:</p>
        <ul>
          {view.allowedViewers.map((allowedViewerId) => {
            const allowedViewer = previewViewers.find(
              ({ id }) => id === allowedViewerId,
            );

            return (
              <li key={allowedViewerId}>
                {allowedViewer?.label ?? allowedViewerId}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function PreviewBlockReason({ title, children }) {
  return (
    <section aria-label={title}>
      <h3>{title}</h3>
      <p>{children}</p>
    </section>
  );
}

export default DevPreviewPage;
