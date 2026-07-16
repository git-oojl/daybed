import { useEffect, useState } from "react";

import { API_BASE_URL } from "../services/apiClient.js";
import { apiEndpoints } from "../services/apiEndpoints.js";

const initialStatus = {
  state: "checking",
  label: "Backend: verificando",
  detail: "Probando /api/health/",
  checks: [
    {
      label: "Health check",
      status: "pending",
      detail: "Esperando respuesta del backend.",
    },
    {
      label: "Modo",
      status: "pending",
      detail: "El switcher espera el health check para marcar el default.",
    },
  ],
};

export function useBackendStatus() {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const controller = new AbortController();
    const healthUrl = `${API_BASE_URL}${apiEndpoints.health}`;

    async function checkBackend() {
      setStatus(initialStatus);
      try {
        const response = await fetch(healthUrl, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

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
              detail: "Backend activo: las rutas reales usan sesión y tokens reales.",
            },
          ],
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setStatus({
          state: "offline",
          label: "Backend no disponible",
          detail: "El preview sigue funcionando con estado simulado.",
          checks: [
            {
              label: "Health check",
              status: "error",
              detail: `${healthUrl} no respondió.`,
            },
            {
              label: "Modo preview",
              status: "safe",
              detail: "Backend no disponible: el preview usa sesión simulada.",
            },
          ],
        });
      }
    }

    checkBackend();

    return () => controller.abort();
  }, []);

  return status;
}
