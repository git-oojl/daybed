import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./DevViewSwitcher.css";
import { useBackendStatus } from "./useBackendStatus.js";
import {
  canPreviewLayout,
  canPreviewViewer,
  getPreviewLayout,
  getPreviewView,
  getPreviewViewer,
  previewLayouts,
  previewViewers,
  previewViews,
} from "./viewPreviewRegistry.jsx";

function DevViewSwitcher() {
  const [isOpen, setIsOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const backendStatus = useBackendStatus();

  const activeView = getPreviewView(
    searchParams.get("view") ?? getViewIdFromPath(location.pathname),
  );
  const activeLayout = getPreviewLayout(
    searchParams.get("layout") ?? activeView.defaultLayout,
  );
  const activeViewer = getPreviewViewer(searchParams.get("viewer"));
  const isPreviewRoute = location.pathname === "/dev/preview";
  const isLayoutAllowed = canPreviewLayout(activeView, activeLayout.id);
  const isViewerAllowed = canPreviewViewer(activeView, activeViewer.id);
  const isAllowed = isLayoutAllowed && isViewerAllowed;

  const viewsByGroup = useMemo(
    () =>
      previewViews.reduce((groups, view) => {
        if (!groups[view.group]) {
          groups[view.group] = [];
        }

        groups[view.group].push(view);
        return groups;
      }, {}),
    [],
  );

  function goToPreview(
    nextViewId = activeView.id,
    nextLayoutId = activeLayout.id,
    nextViewerId = activeViewer.id,
  ) {
    navigate(
      `/dev/preview?view=${nextViewId}&layout=${nextLayoutId}&viewer=${nextViewerId}`,
    );
  }

  function goToRealRoute() {
    navigate(activeView.path, { replace: true });
  }

  function handleViewChange(event) {
    const nextView = getPreviewView(event.target.value);
    goToPreview(nextView.id, nextView.defaultLayout, activeViewer.id);
  }

  function handleLayoutChange(event) {
    goToPreview(activeView.id, event.target.value, activeViewer.id);
  }

  function handleViewerChange(event) {
    goToPreview(activeView.id, activeLayout.id, event.target.value);
  }

  if (!isOpen) {
    return (
      <button
        aria-label="Abrir navegador de vistas"
        className="dev-view-switcher__toggle"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Dev views
      </button>
    );
  }

  return (
    <aside
      className="dev-view-switcher"
      aria-label="Navegador de vistas para desarrollo"
    >
      <div className="dev-view-switcher__header">
        <div>
          <strong>Dev preview</strong>
          <span>Vistas + layouts + acceso</span>
        </div>
        <button
          aria-label="Cerrar navegador de vistas"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      </div>

      <label className="dev-view-switcher__field">
        <span>Vista</span>
        <select value={activeView.id} onChange={handleViewChange}>
          {Object.entries(viewsByGroup).map(([group, views]) => (
            <optgroup key={group} label={group}>
              {views.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="dev-view-switcher__field">
        <span>Layout</span>
        <select value={activeLayout.id} onChange={handleLayoutChange}>
          {previewLayouts.map((layout) => {
            const layoutIsAllowed = canPreviewLayout(activeView, layout.id);

            return (
              <option key={layout.id} value={layout.id}>
                {layout.label} {layoutIsAllowed ? "" : "— bloqueado"}
              </option>
            );
          })}
        </select>
      </label>

      <label className="dev-view-switcher__field">
        <span>Simular como</span>
        <select value={activeViewer.id} onChange={handleViewerChange}>
          {previewViewers.map((viewer) => {
            const viewerIsAllowed = canPreviewViewer(activeView, viewer.id);

            return (
              <option key={viewer.id} value={viewer.id}>
                {viewer.label} {viewerIsAllowed ? "" : "— sin acceso"}
              </option>
            );
          })}
        </select>
      </label>

      <div
        className={
          isAllowed
            ? "dev-view-switcher__status"
            : "dev-view-switcher__status dev-view-switcher__status--blocked"
        }
      >
        {getStatusMessage({ isAllowed, isLayoutAllowed, isViewerAllowed })}
      </div>

      <div
        className={`dev-view-switcher__backend dev-view-switcher__backend--${backendStatus.state}`}
        tabIndex={0}
        title="Pasa el cursor o enfoca para ver detalles del estado del backend."
      >
        <div className="dev-view-switcher__backend-summary">
          <strong>{getBackendStatusIcon(backendStatus.state)}</strong>
          <span>
            <b>{backendStatus.label}</b>
            <small>{backendStatus.detail}</small>
          </span>
        </div>
        <div className="dev-view-switcher__backend-popover" role="status">
          {backendStatus.checks.map((check) => (
            <div key={check.label} className="dev-view-switcher__backend-check">
              <span>{getCheckIcon(check.status)}</span>
              <div>
                <strong>{check.label}</strong>
                <small>{check.detail}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dev-view-switcher__meta">
        <span>{activeViewer.description}</span>
        <span>
          Roles:{" "}
          {activeViewer.roles.length > 0
            ? activeViewer.roles.join(", ")
            : "ninguno"}
        </span>
      </div>

      <div className="dev-view-switcher__actions">
        <button type="button" onClick={() => goToPreview()}>
          Ver preview
        </button>
        <button type="button" onClick={goToRealRoute}>
          Modo normal
        </button>
      </div>

      <p className="dev-view-switcher__hint">
        {isPreviewRoute
          ? "Modo normal sale de /dev/preview y vuelve a respetar la sesión real del sitio."
          : "Cambia una opción para abrir /dev/preview sin tocar las rutas reales."}
      </p>

      <div className="dev-view-switcher__file">
        <span>Archivo de la vista</span>
        <code>{activeView.filePath}</code>
      </div>
    </aside>
  );
}

function getStatusMessage({ isAllowed, isLayoutAllowed, isViewerAllowed }) {
  if (isAllowed) {
    return "Preview permitido";
  }

  if (!isLayoutAllowed && !isViewerAllowed) {
    return "Preview bloqueado por layout y acceso";
  }

  if (!isLayoutAllowed) {
    return "Preview bloqueado por layout no permitido";
  }

  return "Preview bloqueado por perfil sin acceso";
}

function getBackendStatusIcon(state) {
  if (state === "online") {
    return "✓";
  }

  if (state === "offline") {
    return "!";
  }

  return "...";
}

function getCheckIcon(status) {
  if (status === "ok" || status === "safe") {
    return "✓";
  }

  if (status === "error") {
    return "×";
  }

  return "…";
}

function getViewIdFromPath(pathname) {
  const exactMatch = previewViews.find((view) => view.path === pathname);

  if (exactMatch) {
    return exactMatch.id;
  }

  const dynamicMatch = previewViews.find((view) => {
    const routeRoot = view.path
      .replace("/demo-producto", "")
      .replace("/demo-pedido", "");

    return routeRoot !== "/" && pathname.startsWith(routeRoot);
  });

  return dynamicMatch?.id;
}

export default DevViewSwitcher;
