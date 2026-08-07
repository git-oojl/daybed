import React from "react";

const PREVIEW_STORAGE_KEYS = [
  "daybed:dev-view-switcher",
  "daybed:dev-view-switcher:open",
  "daybed:preview-fixtures:v3",
  "daybed:preview-fixtures:v4",
];

function clearPreviewState() {
  if (typeof window === "undefined") return;
  PREVIEW_STORAGE_KEYS.forEach((key) => {
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  });
}

export default class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Daybed application render failed", error, info);
  }

  recoverHome = () => {
    clearPreviewState();
    window.location.assign("/");
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <main className="app-fatal" role="alert" aria-labelledby="app-fatal-title">
        <section className="app-fatal__card">
          <span className="app-fatal__eyebrow">Daybed sigue disponible</span>
          <h1 id="app-fatal-title">Esta vista no pudo abrirse</h1>
          <p>
            Ocurrió un problema al cargar este módulo. Puedes volver a Inicio o
            recargar la página sin perder los datos guardados en tu cuenta.
          </p>
          <div className="app-fatal__actions">
            <button type="button" onClick={this.recoverHome}>
              Volver a Inicio
            </button>
            <button type="button" className="is-secondary" onClick={this.reload}>
              Recargar página
            </button>
          </div>
          {import.meta.env.DEV ? (
            <details className="app-fatal__details">
              <summary>Detalle técnico para desarrollo</summary>
              <code>{error?.message || String(error)}</code>
            </details>
          ) : null}
        </section>
      </main>
    );
  }
}
