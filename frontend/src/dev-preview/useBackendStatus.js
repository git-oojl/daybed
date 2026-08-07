import { useEffect, useState } from "react";

import { API_BASE_URL } from "../services/apiClient.js";
import { apiEndpoints } from "../services/apiEndpoints.js";

const HEALTH_TIMEOUT_MS = 3000;

const initialStatus = {
  state: "checking",
  label: "Backend: verificando",
  detail: "Comprobando la conexión sin bloquear la interfaz.",
  checks: [
    {
      label: "Health check",
      status: "pending",
      detail: "La tienda puede renderizar mientras termina esta comprobación.",
    },
    {
      label: "Modo",
      status: "pending",
      detail: "El modo se resolverá cuando responda el backend o venza el tiempo límite.",
    },
  ],
};

function offlineStatus(healthUrl, detail) {
  return {
    state: "offline",
    label: "Backend no disponible",
    detail,
    checks: [
      {
        label: "Health check",
        status: "error",
        detail: `${healthUrl} no respondió dentro del tiempo esperado.`,
      },
      {
        label: "Modo preview",
        status: "safe",
        detail: "La interfaz y el preview continúan disponibles con datos temporales.",
      },
    ],
  };
}

export function useBackendStatus() {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const controller = new AbortController();
    const healthUrl = `${API_BASE_URL}${apiEndpoints.health}`;
    let active = true;
    let timedOut = false;

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort("health-check-timeout");
    }, HEALTH_TIMEOUT_MS);

    async function checkBackend() {
      setStatus(initialStatus);
      try {
        const response = await fetch(healthUrl, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!active) return;

        setStatus({
          state: "online",
          label: "Backend activo",
          detail: healthUrl,
          checks: [
            {
              label: "Health check",
              status: "ok",
              detail: `${healthUrl} respondió correctamente.`,
            },
            {
              label: "Modo normal",
              status: "safe",
              detail: "Las rutas reales pueden usar la sesión y los datos del backend.",
            },
          ],
        });
      } catch (error) {
        if (!active) return;
        if (error?.name === "AbortError" && !timedOut) return;
        setStatus(
          offlineStatus(
            healthUrl,
            timedOut
              ? "La comprobación tardó demasiado; la interfaz sigue visible."
              : "El preview sigue funcionando con datos temporales.",
          ),
        );
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    checkBackend();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort("component-unmounted");
    };
  }, []);

  return status;
}
