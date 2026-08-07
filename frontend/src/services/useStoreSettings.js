import { useCallback, useEffect, useState } from "react";
import { subscribeToSessionReplaced } from "../auth/sessionEvents.js";
import { storeService } from "./backendServices.js";

export const DEFAULT_STORE_SETTINGS = {
  store_name: "Daybed",
  contact_phone: "+52 664 000 0000",
  contact_email: "contacto@daybed.local",
  business_hours: "Lun–Sáb · 10:00–19:00",
  support_instructions: "Escríbenos con tu número de pedido y te ayudaremos.",
  street: "Sucursal principal",
  neighborhood: "Zona Centro",
  city: "Tijuana",
  state: "Baja California",
  postal_code: "22000",
  latitude: 32.5149,
  longitude: -117.0382,
  free_shipping_threshold: null,
  cancellation_window_hours: 12,
  default_preparation_days: 4,
  announcement_message: "",
  instagram_url: "",
  facebook_url: "",
  storefront_available: true,
  show_cart_estimate: true,
};

let cachedSettings = null;
let inFlight = null;
let settingsGeneration = 0;

export function primeStoreSettings(settings) {
  cachedSettings = { ...DEFAULT_STORE_SETTINGS, ...(settings || {}) };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("daybed:store-settings-updated", { detail: cachedSettings }));
  }
  return cachedSettings;
}

export async function loadStoreSettings({ force = false } = {}) {
  if (!force && cachedSettings) return cachedSettings;
  if (!force && inFlight) return inFlight;

  const generation = settingsGeneration;
  const request = storeService.settings()
    .then((settings) => {
      if (generation !== settingsGeneration) {
        return cachedSettings || { ...DEFAULT_STORE_SETTINGS };
      }
      return primeStoreSettings(settings);
    })
    .catch((error) => {
      if (generation !== settingsGeneration) {
        return cachedSettings || { ...DEFAULT_STORE_SETTINGS };
      }
      if (!cachedSettings) cachedSettings = { ...DEFAULT_STORE_SETTINGS };
      throw error;
    })
    .finally(() => {
      if (inFlight === request) inFlight = null;
    });
  inFlight = request;
  return request;
}

export function clearStoreSettingsCache() {
  settingsGeneration += 1;
  cachedSettings = null;
  inFlight = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("daybed:store-settings-updated", {
      detail: { ...DEFAULT_STORE_SETTINGS },
    }));
  }
}

subscribeToSessionReplaced(() => clearStoreSettingsCache());

export function useStoreSettings() {
  const [settings, setSettings] = useState(() => cachedSettings || DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await loadStoreSettings({ force: true });
      setSettings(next);
      return next;
    } catch (requestError) {
      setError(requestError);
      setSettings(cachedSettings || DEFAULT_STORE_SETTINGS);
      return cachedSettings || DEFAULT_STORE_SETTINGS;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadStoreSettings()
      .then((next) => active && setSettings(next))
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false));
    const receive = (event) => setSettings(event.detail || DEFAULT_STORE_SETTINGS);
    window.addEventListener("daybed:store-settings-updated", receive);
    return () => {
      active = false;
      window.removeEventListener("daybed:store-settings-updated", receive);
    };
  }, []);

  return { settings, loading, error, reload };
}

export default useStoreSettings;
