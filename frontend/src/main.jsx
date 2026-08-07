import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import AppErrorBoundary from "./components/support/AppErrorBoundary.jsx";
import RouteLoading from "./components/support/RouteLoading.jsx";
import "./index.css";
import "./assets/polish-v2.css";

// Loading App through React.lazy keeps page modules outside the entry module's
// static dependency graph. A rejected module import is therefore visible to the
// error boundary instead of leaving an empty #root element.
const App = lazy(() => import("./App.jsx"));

const PRELOAD_RECOVERY_KEY = "daybed:vite-preload-recovery";

if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    const alreadyRetried = window.sessionStorage.getItem(PRELOAD_RECOVERY_KEY) === "1";
    if (alreadyRetried) return;

    event.preventDefault();
    window.sessionStorage.setItem(PRELOAD_RECOVERY_KEY, "1");
    window.location.reload();
  });

  window.setTimeout(() => {
    window.sessionStorage.removeItem(PRELOAD_RECOVERY_KEY);
  }, 5000);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Daybed no encontró el elemento #root de la aplicación.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Suspense
        fallback={
          <RouteLoading
            title="Abriendo Daybed"
            message="Cargando la tienda y sus rutas principales."
          />
        }
      >
        <App />
      </Suspense>
    </AppErrorBoundary>
  </React.StrictMode>,
);
