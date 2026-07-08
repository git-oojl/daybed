// BasicSettingsPage.jsx
import React, { useState, useCallback, useMemo } from "react";
import "../../assets/CSS/settings-page.css";

// ============================================
// ICONOS SVG
// ============================================
function IconStore() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9l9-6 9 6M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 20v-4h6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="13" r="1" fill="currentColor"/>
      <circle cx="15" cy="13" r="1" fill="currentColor"/>
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 3h4l2 4v6h-6V3ZM8 13h2M14 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.5 19h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconCurrency() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 8h5a2 2 0 1 1 0 4H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12h4a2 2 0 1 1 0 4H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconDistance() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20L20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 3L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M21 16L16 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 22l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 12l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconSave() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCancel() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5l4 4L7 21l-5 1 1-5L16.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function BasicSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    storeName: "Mueblería El Roble",
    phone: "+52 55 1234 5678",
    email: "hola@elroble.mx",
    street: "Av. Insurgentes 123",
    colony: "Roma Norte",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "06700",
    baseRate: 150.00,
    pricePerKm: 15.00,
    currency: "MXN",
    freeShippingThreshold: 5000.00,
    useRealMapAPI: false,
    showCartEstimate: true,
  });

  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    setError("");
  }, []);

  const handleNumberChange = useCallback((e) => {
    const { name, value } = e.target;
    if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: 0 }));
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    }
    setError("");
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      console.log("Configuración guardada:", formData);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      storeName: "Mueblería El Roble",
      phone: "+52 55 1234 5678",
      email: "hola@elroble.mx",
      street: "Av. Insurgentes 123",
      colony: "Roma Norte",
      city: "Ciudad de México",
      state: "CDMX",
      zipCode: "06700",
      baseRate: 150.00,
      pricePerKm: 15.00,
      currency: "MXN",
      freeShippingThreshold: 5000.00,
      useRealMapAPI: false,
      showCartEstimate: true,
    });
    setTouched({});
    setError("");
    setSuccess(false);
  };

  const shippingExample = useMemo(() => {
    const distance = 10;
    const total = formData.baseRate + distance * formData.pricePerKm;
    return total;
  }, [formData.baseRate, formData.pricePerKm]);

  return (
    <div className="admin-settings">
      {/* ===== HEADER HERO (estilo checkout-hero) ===== */}
      <section className="admin-settings-hero" aria-label="Configuración básica">
        <div className="admin-settings-hero__overlay">
          <div className="admin-settings-hero__content">
            <div className="admin-settings-hero__icon">
              <IconSettings />
            </div>
            <div className="admin-settings-hero__text">
              <h1 className="admin-settings-hero__title">Configuración básica</h1>
              <p className="admin-settings-hero__subtitle">
                Gestiona los datos generales de tu tienda y tarifas de envío
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ALERTAS */}
      {success && (
        <div className="admin-settings__alert admin-settings__alert--success">
          <IconCheck />
          <span>Configuración guardada exitosamente</span>
        </div>
      )}

      {error && (
        <div className="admin-settings__alert admin-settings__alert--error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* FORMULARIO */}
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
                  <p className="admin-settings__card-desc">
                    Información básica de tu tienda
                  </p>
                </div>
              </div>

              <div className="admin-settings__card-body">
                <div className="admin-settings__field">
                  <label htmlFor="storeName">
                    Nombre de la tienda <span className="admin-settings__required">*</span>
                  </label>
                  <input
                    type="text"
                    id="storeName"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mueblería El Roble"
                  />
                </div>

                <div className="admin-settings__row">
                  <div className="admin-settings__field">
                    <label htmlFor="phone">
                      Teléfono de contacto <span className="admin-settings__required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>

                  <div className="admin-settings__field">
                    <label htmlFor="email">
                      Email de atención <span className="admin-settings__required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="hola@elroble.mx"
                    />
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
                  <p className="admin-settings__card-desc">
                    Dirección física de tu tienda
                  </p>
                </div>
              </div>

              <div className="admin-settings__card-body">
                <div className="admin-settings__field">
                  <label htmlFor="street">
                    Calle y número <span className="admin-settings__required">*</span>
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Av. Insurgentes 123"
                  />
                </div>

                <div className="admin-settings__field">
                  <label htmlFor="colony">
                    Colonia <span className="admin-settings__required">*</span>
                  </label>
                  <input
                    type="text"
                    id="colony"
                    name="colony"
                    value={formData.colony}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Roma Norte"
                  />
                </div>

                <div className="admin-settings__row">
                  <div className="admin-settings__field">
                    <label htmlFor="city">
                      Ciudad <span className="admin-settings__required">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ciudad de México"
                    />
                  </div>

                  <div className="admin-settings__field">
                    <label htmlFor="state">
                      Estado <span className="admin-settings__required">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="CDMX"
                    />
                  </div>
                </div>

                <div className="admin-settings__field">
                  <label htmlFor="zipCode">
                    Código postal <span className="admin-settings__required">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="06700"
                  />
                </div>

                <div className="admin-settings__map-preview">
                  <div className="admin-settings__map-placeholder">
                    <IconLocation />
                    <span>Vista previa del mapa</span>
                    <span className="admin-settings__map-coords">
                      {formData.street}, {formData.colony}, {formData.city}
                    </span>
                  </div>
                  <button type="button" className="admin-settings__map-btn">
                    <IconEdit /> Seleccionar en mapa
                  </button>
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
                  <p className="admin-settings__card-desc">
                    Costos de entrega para tus clientes
                  </p>
                </div>
              </div>

              <div className="admin-settings__card-body">
                <div className="admin-settings__field">
                  <label htmlFor="currency">
                    Moneda <span className="admin-settings__required">*</span>
                  </label>
                  <div className="admin-settings__currency-selector">
                    <button
                      type="button"
                      className={`admin-settings__currency-btn ${formData.currency === "MXN" ? "admin-settings__currency-btn--active" : ""}`}
                      onClick={() => setFormData({ ...formData, currency: "MXN" })}
                    >
                      🇲🇽 MXN
                    </button>
                    <button
                      type="button"
                      className={`admin-settings__currency-btn ${formData.currency === "USD" ? "admin-settings__currency-btn--active" : ""}`}
                      onClick={() => setFormData({ ...formData, currency: "USD" })}
                    >
                      🇺🇸 USD
                    </button>
                    <button
                      type="button"
                      className={`admin-settings__currency-btn ${formData.currency === "EUR" ? "admin-settings__currency-btn--active" : ""}`}
                      onClick={() => setFormData({ ...formData, currency: "EUR" })}
                    >
                      🇪🇺 EUR
                    </button>
                  </div>
                </div>

                <div className="admin-settings__row">
                  <div className="admin-settings__field">
                    <label htmlFor="baseRate">
                      Tarifa base de entrega <span className="admin-settings__required">*</span>
                    </label>
                    <div className="admin-settings__input-group">
                      <span className="admin-settings__input-currency">$</span>
                      <input
                        type="number"
                        id="baseRate"
                        name="baseRate"
                        value={formData.baseRate === 0 ? "" : formData.baseRate}
                        onChange={handleNumberChange}
                        onBlur={handleBlur}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="admin-settings__field-hint">
                      Costo fijo por envío
                    </span>
                  </div>

                  <div className="admin-settings__field">
                    <label htmlFor="pricePerKm">
                      Precio por kilómetro <span className="admin-settings__required">*</span>
                    </label>
                    <div className="admin-settings__input-group">
                      <span className="admin-settings__input-currency">$</span>
                      <input
                        type="number"
                        id="pricePerKm"
                        name="pricePerKm"
                        value={formData.pricePerKm === 0 ? "" : formData.pricePerKm}
                        onChange={handleNumberChange}
                        onBlur={handleBlur}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="admin-settings__field-hint">
                      Costo variable por distancia
                    </span>
                  </div>
                </div>

                <div className="admin-settings__example">
                  <div className="admin-settings__example-header">
                    <IconDistance />
                    <span>Ejemplo de cálculo en vivo</span>
                  </div>
                  <div className="admin-settings__example-body">
                    <div className="admin-settings__example-row">
                      <span>Distancia:</span>
                      <span>10 km</span>
                    </div>
                    <div className="admin-settings__example-row">
                      <span>Tarifa base:</span>
                      <span>${formData.baseRate.toFixed(2)}</span>
                    </div>
                    <div className="admin-settings__example-row">
                      <span>Precio por km:</span>
                      <span>${formData.pricePerKm.toFixed(2)}</span>
                    </div>
                    <div className="admin-settings__example-row admin-settings__example-total">
                      <span>Total estimado:</span>
                      <span>${shippingExample.toFixed(2)} {formData.currency}</span>
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
                  <p className="admin-settings__card-desc">
                    Configuraciones adicionales de envío
                  </p>
                </div>
              </div>

              <div className="admin-settings__card-body">
                <div className="admin-settings__toggle">
                  <div className="admin-settings__toggle-info">
                    <label htmlFor="freeShippingThreshold">
                      Envío gratis a partir de:
                    </label>
                    <span className="admin-settings__toggle-hint">
                      El envío será gratuito cuando el total del pedido supere este monto
                    </span>
                  </div>
                  <div className="admin-settings__input-group admin-settings__input-group--small">
                    <span className="admin-settings__input-currency">$</span>
                    <input
                      type="number"
                      id="freeShippingThreshold"
                      name="freeShippingThreshold"
                      value={formData.freeShippingThreshold === 0 ? "" : formData.freeShippingThreshold}
                      onChange={handleNumberChange}
                      onBlur={handleBlur}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="admin-settings__toggle">
                  <div className="admin-settings__toggle-info">
                    <label htmlFor="useRealMapAPI">
                      Usar API de mapas reales
                    </label>
                    <span className="admin-settings__toggle-hint">
                      Calcula distancias en tiempo real con Google Maps
                    </span>
                  </div>
                  <label className="admin-settings__switch">
                    <input
                      type="checkbox"
                      id="useRealMapAPI"
                      name="useRealMapAPI"
                      checked={formData.useRealMapAPI}
                      onChange={handleChange}
                    />
                    <span className="admin-settings__slider"></span>
                  </label>
                </div>

                <div className="admin-settings__toggle">
                  <div className="admin-settings__toggle-info">
                    <label htmlFor="showCartEstimate">
                      Mostrar costo estimado en el carrito
                    </label>
                    <span className="admin-settings__toggle-hint">
                      Los clientes verán el costo de envío estimado al agregar productos
                    </span>
                  </div>
                  <label className="admin-settings__switch">
                    <input
                      type="checkbox"
                      id="showCartEstimate"
                      name="showCartEstimate"
                      checked={formData.showCartEstimate}
                      onChange={handleChange}
                    />
                    <span className="admin-settings__slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="admin-settings__actions">
              <button
                type="button"
                className="admin-settings__btn admin-settings__btn--secondary"
                onClick={handleReset}
              >
                <IconCancel />
                Cancelar
              </button>
              <button
                type="submit"
                className="admin-settings__btn admin-settings__btn--primary"
                disabled={loading}
              >
                {loading ? (
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
    </div>
  );
}