// BasicSettingsPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/CSS/admin/settings-page.css";
import { storeService } from "../../services/backendServices.js";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import OpenStreetMapEmbed from "../../components/store/OpenStreetMapEmbed.jsx";

// ============================================
// ICONOS (MANTENER IGUALES)
// ============================================
function IconStore() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9l9-6 9 6M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-4h6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 3h4l2 4v6h-6V3ZM8 13h2M14 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 19h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCurrency() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8h5a2 2 0 1 1 0 4H9M9 12h4a2 2 0 1 1 0 4H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDistance() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20L20 4M8 3L3 8M21 16L16 21M12 22l-3-3M22 12l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCancel() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================
// CONSTANTES Y FUNCIONES
// ============================================
const EMPTY_FORM = {
  store_name: "",
  contact_phone: "",
  contact_email: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
  postal_code: "",
  latitude: "",
  longitude: "",
  delivery_base_fee: "",
  delivery_price_per_km: "",
  free_shipping_threshold: "",
  show_cart_estimate: true,
};

function normalizeSettings(settings) {
  return {
    ...EMPTY_FORM,
    ...settings,
    free_shipping_threshold: settings.free_shipping_threshold ?? "",
  };
}

function toPatchPayload(formData) {
  return {
    ...formData,
    free_shipping_threshold:
      formData.free_shipping_threshold === "" ? null : formData.free_shipping_threshold,
  };
}

function getErrorMessage(error) {
  if (error?.fieldErrors) {
    const firstField = Object.keys(error.fieldErrors)[0];
    if (firstField) return `${firstField}: ${error.fieldErrors[firstField]}`;
  }
  return error?.message || "No se pudo guardar la configuración.";
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return `$${amount.toFixed(2)} MXN`;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function BasicSettingsPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loadedSettings, setLoadedSettings] = useState(EMPTY_FORM);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    let active = true;

    storeService
      .settings()
      .then((settingsResponse) => {
        if (!active) return;
        const settings = normalizeSettings(settingsResponse);
        setLoadedSettings(settings);
        setFormData(settings);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "No se pudo cargar la configuración.");
        }
      })
      .finally(() => {
        if (active) setPageLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const saved = normalizeSettings(
        await storeService.updateSettings(toPatchPayload(formData)),
      );
      setLoadedSettings(saved);
      setFormData(saved);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(loadedSettings);
    setError("");
    setSuccess(false);
  };

  const shippingExample = useMemo(() => {
    const distance = 10;
    const subtotal = 10_000;
    const threshold = Number(formData.free_shipping_threshold || 0);
    if (threshold > 0 && subtotal >= threshold) return 0;
    return (
      Number(formData.delivery_base_fee || 0) +
      distance * Number(formData.delivery_price_per_km || 0)
    );
  }, [
    formData.delivery_base_fee,
    formData.delivery_price_per_km,
    formData.free_shipping_threshold,
  ]);

  // ============================================
  // ✅ RENDER PRINCIPAL CON HOMEHEADER Y HOMEFOOTER
  // ============================================
  return (
    <div className="home-page admin-settings">
      <HomeHeader />

      <PageHero title="Configuración de tienda" eyebrow="Administración" image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1800&q=82" current="Configuración" />

      {pageLoading && (
        <div className="admin-settings__alert">
          <span>Cargando configuración...</span>
        </div>
      )}

      {success && (
        <div className="admin-settings__alert admin-settings__alert--success">
          <IconCheck />
          <span>Configuración guardada exitosamente</span>
        </div>
      )}

      {error && (
        <div className="admin-settings__alert admin-settings__alert--error">
          <span>{error}</span>
        </div>
      )}

      <form className="admin-settings__form" onSubmit={handleSubmit}>
        <div className="admin-settings__grid">
          {/* COLUMNA IZQUIERDA */}
          <div className="admin-settings__col">
            {/* DATOS GENERALES */}
            <div className="admin-settings__card">
              <div className="admin-settings__card-header">
                <div className="admin-settings__card-icon">
                  <IconStore />
                </div>
                <div>
                  <h2 className="admin-settings__card-title">Datos generales</h2>
                  <p className="admin-settings__card-desc">Información básica de tu tienda</p>
                </div>
              </div>

              <div className="admin-settings__card-body">
                <div className="admin-settings__field">
                  <label htmlFor="store_name">Nombre de la tienda <span className="admin-settings__required">*</span></label>
                  <input type="text" id="store_name" name="store_name" value={formData.store_name} onChange={handleChange} disabled={pageLoading || saving} />
                </div>

                <div className="admin-settings__row">
                  <div className="admin-settings__field">
                    <label htmlFor="contact_phone">Teléfono de contacto <span className="admin-settings__required">*</span></label>
                    <input type="tel" id="contact_phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} disabled={pageLoading || saving} />
                  </div>

                  <div className="admin-settings__field">
                    <label htmlFor="contact_email">Email de atención <span className="admin-settings__required">*</span></label>
                    <input type="email" id="contact_email" name="contact_email" value={formData.contact_email} onChange={handleChange} disabled={pageLoading || saving} />
                  </div>
                </div>
              </div>
            </div>

            {/* UBICACIÓN */}
            <div className="admin-settings__card">
              <div className="admin-settings__card-header">
                <div className="admin-settings__card-icon">
                  <IconLocation />
                </div>
                <div>
                  <h2 className="admin-settings__card-title">Ubicación</h2>
                  <p className="admin-settings__card-desc">Dirección física y origen de entrega</p>
                </div>
              </div>

              <div className="admin-settings__card-body">
                <div className="admin-settings__field">
                  <label htmlFor="street">Calle y número <span className="admin-settings__required">*</span></label>
                  <input type="text" id="street" name="street" value={formData.street} onChange={handleChange} disabled={pageLoading || saving} />
                </div>

                <div className="admin-settings__field">
                  <label htmlFor="neighborhood">Colonia <span className="admin-settings__required">*</span></label>
                  <input type="text" id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleChange} disabled={pageLoading || saving} />
                </div>

                <div className="admin-settings__row">
                  <div className="admin-settings__field">
                    <label htmlFor="city">Ciudad <span className="admin-settings__required">*</span></label>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} disabled={pageLoading || saving} />
                  </div>

                  <div className="admin-settings__field">
                    <label htmlFor="state">Estado <span className="admin-settings__required">*</span></label>
                    <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} disabled={pageLoading || saving} />
                  </div>
                </div>

                <div className="admin-settings__row">
                  <div className="admin-settings__field">
                    <label htmlFor="postal_code">Código postal <span className="admin-settings__required">*</span></label>
                    <input type="text" id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleChange} disabled={pageLoading || saving} />
                  </div>

                  <div className="admin-settings__field">
                    <label htmlFor="latitude">Latitud <span className="admin-settings__required">*</span></label>
                    <input type="number" id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} step="0.00000001" min="-90" max="90" disabled={pageLoading || saving} />
                  </div>
                </div>

                <div className="admin-settings__field">
                  <label htmlFor="longitude">Longitud <span className="admin-settings__required">*</span></label>
                  <input type="number" id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} step="0.00000001" min="-180" max="180" disabled={pageLoading || saving} />
                </div>

                <div className="admin-settings__map-preview">
                  <OpenStreetMapEmbed
                    compact
                    latitude={formData.latitude || undefined}
                    longitude={formData.longitude || undefined}
                    label={formData.latitude && formData.longitude
                      ? `${formData.store_name || "Daybed"} · ${formData.street || "Origen de entrega"}, ${formData.city || "Tijuana"}`
                      : "Daybed · ubicación de referencia hasta guardar coordenadas"}
                    title="Origen de entregas de Daybed en OpenStreetMap"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="admin-settings__col">
            {/* TARIFAS DE ENVÍO */}
            <div className="admin-settings__card">
              <div className="admin-settings__card-header">
                <div className="admin-settings__card-icon">
                  <IconTruck />
                </div>
                <div>
                  <h2 className="admin-settings__card-title">Tarifas de envío</h2>
                  <p className="admin-settings__card-desc">Costos de entrega para tus clientes</p>
                </div>
              </div>

              <div className="admin-settings__card-body">
                <div className="admin-settings__field">
                  <label>Moneda</label>
                  <div className="admin-settings__currency-selector">
                    <span className="admin-settings__currency-btn admin-settings__currency-btn--active">MXN</span>
                  </div>
                  <span className="admin-settings__field-hint">La tienda opera con pesos mexicanos.</span>
                </div>

                <div className="admin-settings__row">
                  <div className="admin-settings__field">
                    <label htmlFor="delivery_base_fee">Tarifa base de entrega <span className="admin-settings__required">*</span></label>
                    <div className="admin-settings__input-group">
                      <span className="admin-settings__input-currency">$</span>
                      <input type="number" id="delivery_base_fee" name="delivery_base_fee" value={formData.delivery_base_fee} onChange={handleChange} step="0.01" min="0" disabled={pageLoading || saving} />
                    </div>
                    <span className="admin-settings__field-hint">Costo fijo por envío</span>
                  </div>

                  <div className="admin-settings__field">
                    <label htmlFor="delivery_price_per_km">Precio por kilómetro <span className="admin-settings__required">*</span></label>
                    <div className="admin-settings__input-group">
                      <span className="admin-settings__input-currency">$</span>
                      <input type="number" id="delivery_price_per_km" name="delivery_price_per_km" value={formData.delivery_price_per_km} onChange={handleChange} step="0.01" min="0" disabled={pageLoading || saving} />
                    </div>
                    <span className="admin-settings__field-hint">Costo variable por distancia</span>
                  </div>
                </div>

                <div className="admin-settings__example">
                  <div className="admin-settings__example-header">
                    <IconDistance />
                    <span>Ejemplo de cálculo</span>
                  </div>
                  <div className="admin-settings__example-body">
                    <div className="admin-settings__example-row">
                      <span>Distancia:</span>
                      <span>10 km</span>
                    </div>
                    <div className="admin-settings__example-row">
                      <span>Subtotal ejemplo:</span>
                      <span>{formatMoney(10000)}</span>
                    </div>
                    <div className="admin-settings__example-row admin-settings__example-total">
                      <span>Total estimado:</span>
                      <span>{formatMoney(shippingExample)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OPCIONES AVANZADAS */}
            <div className="admin-settings__card">
              <div className="admin-settings__card-header">
                <div className="admin-settings__card-icon">
                  <IconCurrency />
                </div>
                <div>
                  <h2 className="admin-settings__card-title">Opciones avanzadas</h2>
                  <p className="admin-settings__card-desc">Configuraciones adicionales de envío</p>
                </div>
              </div>

              <div className="admin-settings__card-body">
                <div className="admin-settings__toggle">
                  <div className="admin-settings__toggle-info">
                    <label htmlFor="free_shipping_threshold">Envío gratis a partir de:</label>
                    <span className="admin-settings__toggle-hint">
                      Deja el campo vacío para desactivar el envío gratis.
                    </span>
                  </div>
                  <div className="admin-settings__input-group admin-settings__input-group--small">
                    <span className="admin-settings__input-currency">$</span>
                    <input type="number" id="free_shipping_threshold" name="free_shipping_threshold" value={formData.free_shipping_threshold} onChange={handleChange} step="0.01" min="0" placeholder="Sin umbral" disabled={pageLoading || saving} />
                  </div>
                </div>

                <div className="admin-settings__toggle">
                  <div className="admin-settings__toggle-info">
                    <label htmlFor="show_cart_estimate">Mostrar costo estimado en el carrito</label>
                    <span className="admin-settings__toggle-hint">
                      Controla si el carrito puede mostrar referencias de envío cuando la vista lo soporte.
                    </span>
                  </div>
                  <label className="admin-settings__switch">
                    <input type="checkbox" id="show_cart_estimate" name="show_cart_estimate" checked={formData.show_cart_estimate} onChange={handleChange} disabled={pageLoading || saving} />
                    <span className="admin-settings__slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="admin-settings__actions">
              <button type="button" className="admin-settings__btn admin-settings__btn--secondary" onClick={handleReset} disabled={pageLoading || saving}>
                <IconCancel />
                Cancelar
              </button>
              <button type="submit" className="admin-settings__btn admin-settings__btn--primary" disabled={pageLoading || saving}>
                {saving ? (
                  "Guardando..."
                ) : (
                  <>
                    <IconSave />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      <HomeFooter />
    </div>
  );
}