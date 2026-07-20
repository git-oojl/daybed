import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./DevViewSwitcher.css";
import {
  getDefaultModeFromBackendStatus,
  readDevViewSwitcherSelection,
  saveDevViewSwitcherSelection,
} from "./devViewSwitcherSelection.js";
import { useBackendStatus } from "./useBackendStatus.js";
import {
  canPreviewLayout,
  canPreviewViewer,
  getAllowedPreviewViewer,
  getPreviewLayout,
  getPreviewPath,
  getPreviewView,
  getPreviewViewer,
  getViewIdFromPath,
  previewLayouts,
  previewViewers,
  previewViews,
} from "./viewPreviewRegistry.jsx";

function DevViewSwitcher() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState(getInitialSelectedMode);
  const [previewControls, setPreviewControls] = useState(
    getInitialPreviewControls,
  );
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const backendStatus = useBackendStatus();

  const activeView = getPreviewView(
    searchParams.get("view") ?? getViewIdFromPath(location.pathname),
  );
  const activeLayout = getPreviewLayout(
    searchParams.get("layout") ??
      previewControls.layoutId ??
      activeView.defaultLayout,
  );
  const activeViewer = getPreviewViewer(
    searchParams.get("viewer") ?? previewControls.viewerId,
  );
  const isPreviewRoute = location.pathname === "/dev/preview";
  const currentMode =
    selectedMode ?? getDefaultModeFromBackendStatus(backendStatus.state);
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

  useEffect(() => {
    if (currentMode !== "preview" || isPreviewRoute) {
      return;
    }

    const nextView = getPreviewView(getViewIdFromPath(location.pathname));
    const nextLayoutId = canPreviewLayout(nextView, activeLayout.id)
      ? activeLayout.id
      : nextView.defaultLayout;
    const nextViewerId = getAllowedPreviewViewer(nextView, activeViewer.id).id;

    navigate(getPreviewPath(nextView.id, nextLayoutId, nextViewerId), {
      replace: true,
    });
  }, [
    activeLayout.id,
    activeViewer.id,
    isPreviewRoute,
    location.pathname,
    navigate,
    currentMode,
  ]);

  function goToPreview(
    nextViewId = activeView.id,
    nextLayoutId = activeLayout.id,
    nextViewerId = activeViewer.id,
  ) {
    saveDevViewSwitcherSelection({
      layoutId: nextLayoutId,
      mode: "preview",
      viewerId: nextViewerId,
    });
    setSelectedMode("preview");
    setPreviewControls({
      layoutId: nextLayoutId,
      viewerId: nextViewerId,
    });
    navigate(getPreviewPath(nextViewId, nextLayoutId, nextViewerId));
  }

  function goToAllowedPreview(
    nextView = activeView,
    nextLayoutId = activeLayout.id,
    nextViewerId = activeViewer.id,
  ) {
    goToPreview(
      nextView.id,
      nextLayoutId,
      getAllowedPreviewViewer(nextView, nextViewerId).id,
    );
  }

  function goToRealRoute(view = activeView) {
    saveDevViewSwitcherSelection({
      layoutId: activeLayout.id,
      mode: "normal",
      viewerId: activeViewer.id,
    });
    setSelectedMode("normal");
    navigate(view.path, { replace: true });
  }

  function handleModeChange(nextMode) {
    if (nextMode === currentMode) {
      saveDevViewSwitcherSelection({
        layoutId: activeLayout.id,
        mode: nextMode,
        viewerId: activeViewer.id,
      });
      setSelectedMode(nextMode);
      return;
    }

    if (nextMode === "preview") {
      goToAllowedPreview();
      return;
    }

    goToRealRoute();
  }

  function handleViewChange(event) {
    const nextView = getPreviewView(event.target.value);

    if (isPreviewRoute) {
      goToAllowedPreview(nextView, nextView.defaultLayout, activeViewer.id);
      return;
    }

    goToRealRoute(nextView);
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
          <span>Modo + vistas + acceso</span>
        </div>
        <button
          aria-label="Cerrar navegador de vistas"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      </div>

      <section className="dev-view-switcher__mode" aria-label="Modo de trabajo">
        <div className="dev-view-switcher__mode-heading">
          <span>Modo actual</span>
          <strong>
            {currentMode === "normal" ? "Modo normal" : "Modo preview"}
          </strong>
        </div>

        <div className="dev-view-switcher__mode-toggle" role="group">
          <button
            aria-pressed={currentMode === "normal"}
            className={
              currentMode === "normal"
                ? "dev-view-switcher__mode-option dev-view-switcher__mode-option--active"
                : "dev-view-switcher__mode-option"
            }
            type="button"
            onClick={() => handleModeChange("normal")}
          >
            <strong>Normal</strong>
            <small>Sesión real</small>
          </button>
          <button
            aria-pressed={currentMode === "preview"}
            className={
              currentMode === "preview"
                ? "dev-view-switcher__mode-option dev-view-switcher__mode-option--active"
                : "dev-view-switcher__mode-option"
            }
            type="button"
            onClick={() => handleModeChange("preview")}
          >
            <strong>Preview</strong>
            <small>Sesión simulada</small>
          </button>
        </div>

        <p className="dev-view-switcher__mode-copy">
          {getModeMessage(currentMode)}
        </p>
      </section>

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
        <span>Layout de preview</span>
        <select
          value={activeLayout.id}
          onChange={handleLayoutChange}
          disabled={!isPreviewRoute}
        >
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
        <select
          value={activeViewer.id}
          onChange={handleViewerChange}
          disabled={!isPreviewRoute}
        >
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

      <div className="dev-view-switcher__file">
        <span>Archivo de la vista</span>
        <code>{activeView.filePath}</code>
      </div>
    </aside>
  );
}

function getModeMessage(currentMode) {
  if (currentMode === "normal") {
    return "Usa la sesión real guardada, envía el token real y navega por las rutas reales.";
  }

  return "Usa una sesión simulada local, no guarda login real, no envía token real y bloquea escrituras.";
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

function getInitialSelectedMode() {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (window.location.pathname === "/dev/preview") {
    return "preview";
  }

  const storedSelection = readDevViewSwitcherSelection();

  return storedSelection.mode;
}

function getInitialPreviewControls() {
  const storedSelection = readDevViewSwitcherSelection();

  return {
    layoutId: storedSelection.layoutId,
    viewerId: storedSelection.viewerId,
  };
}

export default DevViewSwitcher;
