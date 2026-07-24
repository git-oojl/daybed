// CheckoutSummaryPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/CSS/checkout/checkout-summary.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";
import { cartService, orderService, deliveryService } from "../../services/backendServices.js";
import { useAuthStore } from "../../auth/authStore.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";

// ============================================
// ICONOS SVG (SOLO LOS QUE SE USAN)
// ============================================
function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 20.5a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 3h4l2 4v6h-6V3ZM8 13h2M14 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.5 19h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 8h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

function IconLoading() {
  return (
    <svg className="checkout-loading__spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#B88E2F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================
// ❌ ELIMINADOS:
// - IconEdit (no se usa)
// - IconMap (no se usa)
// ============================================

// ============================================
// FORMATO DE PRECIOS
// ============================================
function formatPrice(amount) {
  return `$${amount.toLocaleString("es-MX")} MX`;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CheckoutSummaryPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Estados del checkout
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  
  // Estados de geocodificación y entrega
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [addressValidated, setAddressValidated] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    calle: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    referencias: "",
  });

  // Estado de campos tocados (validación)
  const [touched, setTouched] = useState({});

  // Términos y condiciones
  const [aceptTerms, setAceptTerms] = useState(false);

  // Métodos de pago
  const [metodoPago, setMetodoPago] = useState("cash");
  const [envio, setEnvio] = useState("standard");

  // ============================================
  // ✅ CARGAR DATOS DEL CHECKOUT
  // (DECLARADO ANTES DE USARLO EN useEffect)
  // ============================================
  const loadCheckoutData = async () => {
    setLoading(true);
    setError(null);

    try {
      const cart = await cartService.get();
      const items = cart.items || [];
      setCartItems(items);

      if (user) {
        setFormData((prev) => ({
          ...prev,
          nombre: user.name || "",
          email: user.email || "",
          telefono: user.phone || "",
        }));
      }

      if (user?.addresses && user.addresses.length > 0) {
        const defaultAddress = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setFormData((prev) => ({
          ...prev,
          calle: defaultAddress.street || "",
          colonia: defaultAddress.colony || "",
          ciudad: defaultAddress.city || "",
          estado: defaultAddress.state || "",
          codigoPostal: defaultAddress.zipCode || "",
        }));
      }
    } catch (err) {
      console.error("Error al cargar checkout:", err);
      setError(err.message || "Error al cargar los datos del checkout");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ VERIFICAR AUTENTICACIÓN Y ROL
  // ============================================
  useEffect(() => {
    const initializeCheckout = async () => {
      if (!authLoading && !isAuthenticated) {
        navigate(routePaths.account.login);
        return;
      }

      if (!authLoading && isAuthenticated) {
        const viewerId = getViewerIdForUser(user);
        if (viewerId !== "customer") {
          navigate(routePaths.support.unauthorized || "/no-autorizado");
          return;
        }
        await loadCheckoutData();
      }
    };

    initializeCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, user, navigate]);

  // ============================================
  // ✅ GEODECODIFICAR Y ESTIMAR ENTREGA
  // ============================================
  const validateAddress = useCallback(async () => {
    const fullAddress = `${formData.calle}, ${formData.colonia}, ${formData.ciudad}, ${formData.estado}, CP ${formData.codigoPostal}`;
    
    setGeocoding(true);
    setAddressValidated(false);
    setGeocodeResult(null);
    setDeliveryEstimate(null);
    setError(null);

    try {
      // 1. Geocodificar dirección
      const geocode = await deliveryService.geocode({ address: fullAddress });
      setGeocodeResult(geocode);

      // 2. Estimar entrega usando las coordenadas
      const estimate = await deliveryService.estimate({
        latitude: geocode.latitude,
        longitude: geocode.longitude,
      });
      setDeliveryEstimate(estimate);
      setAddressValidated(true);

    } catch (err) {
      console.error("Error al validar dirección:", err);
      const errorMessage = err.message || "No pudimos validar la dirección. Por favor, verifica los datos.";
      setError(errorMessage);
      setAddressValidated(false);
    } finally {
      setGeocoding(false);
    }
  }, [formData.calle, formData.colonia, formData.ciudad, formData.estado, formData.codigoPostal]);

  // ============================================
  // ✅ CALCULAR SHIPPING COST
  // ============================================
  const getShippingCost = () => {
    if (deliveryEstimate?.delivery_fee) {
      return parseFloat(deliveryEstimate.delivery_fee);
    }
    return envio === "express" ? 600 : 500;
  };

  // ============================================
  // ✅ CÁLCULOS
  // ============================================
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  const shippingCost = getShippingCost();
  const impuestos = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + impuestos;

  // ============================================
  // ✅ VALIDACIÓN
  // ============================================
  const validateField = (name, value) => {
    if (value.trim() === "") return false;
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
    if (name === "telefono" && !/^[0-9]{10}$/.test(value.replace(/\s/g, ""))) return false;
    if (name === "codigoPostal" && !/^[0-9]{5}$/.test(value)) return false;
    return true;
  };

  const isFieldError = (name) => {
    return touched[name] && !validateField(name, formData[name]) && formData[name] !== "";
  };

  const isFormValid = () => {
    return (
      validateField("nombre", formData.nombre) &&
      validateField("email", formData.email) &&
      validateField("telefono", formData.telefono) &&
      validateField("calle", formData.calle) &&
      validateField("colonia", formData.colonia) &&
      validateField("ciudad", formData.ciudad) &&
      validateField("estado", formData.estado) &&
      validateField("codigoPostal", formData.codigoPostal) &&
      aceptTerms &&
      cartItems.length > 0 &&
      addressValidated
    );
  };

  // ============================================
  // ✅ HANDLERS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Resetear validación de dirección cuando cambian los datos
    if (addressValidated) {
      setAddressValidated(false);
      setGeocodeResult(null);
      setDeliveryEstimate(null);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  // ============================================
  // ✅ CONFIRMAR PEDIDO
  // ============================================
  const handleConfirm = async () => {
    if (!aceptTerms) {
      setError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    if (!addressValidated) {
      setError("Por favor, valida tu dirección antes de continuar");
      return;
    }

    if (!isFormValid()) {
      const allTouched = {};
      Object.keys(formData).forEach((key) => { allTouched[key] = true; });
      setTouched(allTouched);
      setError("Por favor, completa todos los campos requeridos");
      return;
    }

    if (cartItems.length === 0) {
      setError("Tu carrito está vacío. Agrega productos antes de confirmar.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const fullAddress = `${formData.calle}, ${formData.colonia}, ${formData.ciudad}, ${formData.estado}, CP ${formData.codigoPostal}`;

      const payload = {
        shipping_address: {
          street: formData.calle,
          colony: formData.colonia,
          city: formData.ciudad,
          state: formData.estado,
          zip_code: formData.codigoPostal,
          references: formData.referencias || "",
          formatted_address: geocodeResult?.formatted_address || fullAddress,
          latitude: geocodeResult?.latitude,
          longitude: geocodeResult?.longitude,
        },
        payment_method: metodoPago,
        shipping_method: envio,
        delivery_estimate: deliveryEstimate,
        items: cartItems.map((item) => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
        })),
        customer: {
          name: formData.nombre,
          email: formData.email,
          phone: formData.telefono,
        },
      };

      const order = await orderService.checkout(payload);
      await cartService.clear();

      navigate(routePaths.checkout.confirmation, {
        state: { orderId: order.id, orderData: order },
      });
    } catch (err) {
      console.error("Error al confirmar pedido:", err);
      const errorMessage = err.message || err.response?.data?.detail || "Error al procesar el pedido. Por favor, intenta de nuevo.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ ESTIMACIÓN DE ENTREGA
  // ============================================
  const getEstimatedDate = () => {
    const now = new Date();
    const days = envio === "express" ? 2 : 5;
    const estimated = new Date(now.setDate(now.getDate() + days));
    return estimated.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================
  // ✅ ESTADOS DE CARGA
  // ============================================
  if (loading || authLoading) {
    return (
      <div className="home-page checkout-page">
        <HomeHeader />
        <div className="checkout-loading">
          <IconLoading />
          <p>Cargando resumen del pedido...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error && !submitting && !geocoding) {
    return (
      <div className="home-page checkout-page">
        <HomeHeader />
        <div className="checkout-error">
          <p>❌ {error}</p>
          <button onClick={loadCheckoutData}>Reintentar</button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="home-page checkout-page">
        <HomeHeader />
        <section className="checkout-hero" aria-label="Resumen de pedido">
          <div className="checkout-hero__overlay">
            <h1 className="checkout-hero__title">Resumen de pedido</h1>
          </div>
        </section>
        <main className="checkout-container">
          <div className="checkout-empty">
            <p>Tu carrito está vacío</p>
            <Link to={routePaths.public.catalog} className="checkout-empty__btn">
              Ir a la tienda
            </Link>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================
  return (
    <div className="home-page checkout-page">
      <HomeHeader />

      {/* HERO */}
      <section className="checkout-hero" aria-label="Resumen de pedido">
        <div className="checkout-hero__overlay">
          <h1 className="checkout-hero__title">Resumen de pedido</h1>
          <p className="checkout-hero__breadcrumb">
            <Link to={routePaths.public.home}>Inicio</Link>
            <span aria-hidden="true">&gt;</span>
            <Link to={routePaths.checkout.cart}>Carrito</Link>
            <span aria-hidden="true">&gt;</span>
            Checkout
          </p>
        </div>
      </section>

      <main className="checkout-container">
        {error && (
          <div className="checkout__alert checkout__alert--error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form className="checkout-grid" onSubmit={(e) => e.preventDefault()}>
          {/* COLUMNA IZQUIERDA - FORMULARIO */}
          <div className="checkout-form">
            {/* DATOS DEL CLIENTE */}
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <span className="checkout-card__icon"><IconUser /></span>
                Datos del cliente
              </h2>
              <div className="checkout-card__body">
                <div className="checkout-row">
                  <div className="checkout-field checkout-field--full">
                    <label htmlFor="nombre">Nombre completo *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isFieldError("nombre") ? "checkout-input--error" : ""}
                      placeholder="Tu nombre"
                      disabled={submitting}
                    />
                    {isFieldError("nombre") && <span className="checkout-field__error">Campo requerido</span>}
                  </div>
                </div>

                <div className="checkout-row">
                  <div className="checkout-field">
                    <label htmlFor="email">Correo electrónico *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isFieldError("email") ? "checkout-input--error" : ""}
                      placeholder="tu@email.com"
                      disabled={submitting}
                    />
                    {isFieldError("email") && <span className="checkout-field__error">Correo inválido</span>}
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="telefono">Teléfono *</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isFieldError("telefono") ? "checkout-input--error" : ""}
                      placeholder="5512345678"
                      disabled={submitting}
                    />
                    {isFieldError("telefono") && <span className="checkout-field__error">10 dígitos</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECCIÓN DE ENTREGA */}
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <span className="checkout-card__icon"><IconLocation /></span>
                Dirección de entrega
              </h2>
              <div className="checkout-card__body">
                <div className="checkout-row">
                  <div className="checkout-field checkout-field--full">
                    <label htmlFor="calle">Calle y número *</label>
                    <input
                      type="text"
                      id="calle"
                      name="calle"
                      value={formData.calle}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isFieldError("calle") ? "checkout-input--error" : ""}
                      placeholder="Av. Reforma 456"
                      disabled={submitting}
                    />
                    {isFieldError("calle") && <span className="checkout-field__error">Campo requerido</span>}
                  </div>
                </div>

                <div className="checkout-row">
                  <div className="checkout-field checkout-field--full">
                    <label htmlFor="colonia">Colonia *</label>
                    <input
                      type="text"
                      id="colonia"
                      name="colonia"
                      value={formData.colonia}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isFieldError("colonia") ? "checkout-input--error" : ""}
                      placeholder="Col. Juárez"
                      disabled={submitting}
                    />
                    {isFieldError("colonia") && <span className="checkout-field__error">Campo requerido</span>}
                  </div>
                </div>

                <div className="checkout-row">
                  <div className="checkout-field">
                    <label htmlFor="ciudad">Ciudad *</label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isFieldError("ciudad") ? "checkout-input--error" : ""}
                      placeholder="Ciudad de México"
                      disabled={submitting}
                    />
                    {isFieldError("ciudad") && <span className="checkout-field__error">Campo requerido</span>}
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="estado">Estado *</label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isFieldError("estado") ? "checkout-input--error" : ""}
                      placeholder="CDMX"
                      disabled={submitting}
                    />
                    {isFieldError("estado") && <span className="checkout-field__error">Campo requerido</span>}
                  </div>
                </div>

                <div className="checkout-row">
                  <div className="checkout-field">
                    <label htmlFor="codigoPostal">Código postal *</label>
                    <input
                      type="text"
                      id="codigoPostal"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={isFieldError("codigoPostal") ? "checkout-input--error" : ""}
                      placeholder="06600"
                      disabled={submitting}
                    />
                    {isFieldError("codigoPostal") && <span className="checkout-field__error">5 dígitos</span>}
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="referencias">Referencias (opcional)</label>
                    <input
                      type="text"
                      id="referencias"
                      name="referencias"
                      value={formData.referencias}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Entre piso 3 y 4"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* BOTÓN VALIDAR DIRECCIÓN */}
                <div className="checkout-address-actions">
                  <button
                    type="button"
                    className="checkout-validate-btn"
                    onClick={validateAddress}
                    disabled={geocoding || submitting}
                  >
                    {geocoding ? "Validando..." : "Validar dirección"}
                  </button>
                </div>

                {/* VALIDACIÓN DE DIRECCIÓN */}
                {addressValidated && geocodeResult && (
                  <div className="checkout-address-validation">
                    <div className="checkout-address-validation__icon">
                      <IconCheck />
                    </div>
                    <div className="checkout-address-validation__content">
                      <p className="checkout-address-validation__title">
                        Dirección validada
                      </p>
                      <p className="checkout-address-validation__desc">
                        {geocodeResult.formatted_address || `${formData.calle}, ${formData.colonia}, ${formData.ciudad}, ${formData.estado} - CP ${formData.codigoPostal}`}
                      </p>
                      {deliveryEstimate && (
                        <div className="checkout-address-validation__details">
                          <span>Distancia: {deliveryEstimate.distance_km} km</span>
                          <span>Tiempo estimado: {deliveryEstimate.estimated_duration_minutes} min</span>
                          <span>Envío: {formatPrice(parseFloat(deliveryEstimate.delivery_fee))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {geocoding && (
                  <div className="checkout-address-loading">
                    <span className="checkout-address-loading__spinner"></span>
                    <span>Validando dirección...</span>
                  </div>
                )}
              </div>
            </div>

            {/* ESTIMACIÓN DE ENTREGA */}
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <span className="checkout-card__icon"><IconTruck /></span>
                Estimación de entrega
              </h2>
              <div className="checkout-card__body">
                <div className="checkout-shipping-options">
                  <label className={`checkout-shipping-option ${envio === "standard" ? "checkout-shipping-option--selected" : ""}`}>
                    <input
                      type="radio"
                      name="envio"
                      value="standard"
                      checked={envio === "standard"}
                      onChange={() => setEnvio("standard")}
                      disabled={submitting}
                    />
                    <div className="checkout-shipping-option__info">
                      <span className="checkout-shipping-option__title">Envío estándar</span>
                      <span className="checkout-shipping-option__desc">3-5 días hábiles</span>
                      <span className="checkout-shipping-option__price">{formatPrice(500)}</span>
                    </div>
                  </label>

                  <label className={`checkout-shipping-option ${envio === "express" ? "checkout-shipping-option--selected" : ""}`}>
                    <input
                      type="radio"
                      name="envio"
                      value="express"
                      checked={envio === "express"}
                      onChange={() => setEnvio("express")}
                      disabled={submitting}
                    />
                    <div className="checkout-shipping-option__info">
                      <span className="checkout-shipping-option__title">Envío express</span>
                      <span className="checkout-shipping-option__desc">1-2 días hábiles</span>
                      <span className="checkout-shipping-option__price">{formatPrice(600)}</span>
                    </div>
                  </label>
                </div>

                <div className="checkout-estimated-date">
                  <p className="checkout-estimated-date__label">Fecha estimada de entrega:</p>
                  <p className="checkout-estimated-date__value">{getEstimatedDate()}</p>
                </div>
              </div>
            </div>

            {/* MÉTODO DE PAGO */}
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <span className="checkout-card__icon"><IconCreditCard /></span>
                Método de pago
              </h2>
              <div className="checkout-card__body">
                <div className="checkout-payment-options">
                  <label className={`checkout-payment-option ${metodoPago === "card" ? "checkout-payment-option--selected" : ""}`}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value="card"
                      checked={metodoPago === "card"}
                      onChange={() => setMetodoPago("card")}
                      disabled={submitting}
                    />
                    <div className="checkout-payment-option__content">
                      <span className="checkout-payment-option__label">Tarjeta de crédito/débito</span>
                    </div>
                  </label>

                  <label className={`checkout-payment-option ${metodoPago === "transfer" ? "checkout-payment-option--selected" : ""}`}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transfer"
                      checked={metodoPago === "transfer"}
                      onChange={() => setMetodoPago("transfer")}
                      disabled={submitting}
                    />
                    <div className="checkout-payment-option__content">
                      <span className="checkout-payment-option__label">Transferencia bancaria</span>
                    </div>
                  </label>

                  <label className={`checkout-payment-option ${metodoPago === "cash" ? "checkout-payment-option--selected" : ""}`}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value="cash"
                      checked={metodoPago === "cash"}
                      onChange={() => setMetodoPago("cash")}
                      disabled={submitting}
                    />
                    <div className="checkout-payment-option__content">
                      <span className="checkout-payment-option__label">Efectivo contra entrega</span>
                    </div>
                  </label>
                </div>

                {metodoPago === "card" && (
                  <div className="checkout-card-details">
                    <div className="checkout-row">
                      <div className="checkout-field checkout-field--full">
                        <label htmlFor="cardNumber">Número de tarjeta</label>
                        <input type="text" id="cardNumber" placeholder="**** **** **** 1234" disabled={submitting} />
                      </div>
                    </div>
                    <div className="checkout-row">
                      <div className="checkout-field">
                        <label htmlFor="cardExpiry">Vigencia</label>
                        <input type="text" id="cardExpiry" placeholder="MM/AA" disabled={submitting} />
                      </div>
                      <div className="checkout-field">
                        <label htmlFor="cardCvv">CVV</label>
                        <input type="text" id="cardCvv" placeholder="***" disabled={submitting} />
                      </div>
                    </div>
                  </div>
                )}

                {metodoPago === "transfer" && (
                  <div className="checkout-transfer-info">
                    <p>Te enviaremos los datos para transferencia por correo electrónico.</p>
                  </div>
                )}

                {metodoPago === "cash" && (
                  <div className="checkout-cash-info">
                    <p>Pagas al recibir el producto (solo efectivo).</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - RESUMEN DEL PEDIDO */}
          <aside className="checkout-summary">
            <div className="checkout-card checkout-card--summary">
              <h2 className="checkout-card__title">Resumen del pedido</h2>
              <div className="checkout-card__body">
                {cartItems.map((item) => (
                  <div className="checkout-item" key={item.id || item.product_id}>
                    <img className="checkout-item__image" src={item.image || "https://via.placeholder.com/50"} alt={item.name} loading="lazy" />
                    <div className="checkout-item__info">
                      <p className="checkout-item__name">{item.name}</p>
                      <p className="checkout-item__qty">Cantidad: {item.quantity}</p>
                    </div>
                    <span className="checkout-item__price">{formatPrice((item.price || 0) * (item.quantity || 0))}</span>
                  </div>
                ))}

                <div className="checkout-divider" />

                <div className="checkout-totals">
                  <div className="checkout-totals__row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="checkout-totals__row">
                    <span>Envío</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="checkout-totals__row">
                    <span>Impuestos (5%)</span>
                    <span>{formatPrice(impuestos)}</span>
                  </div>
                  <div className="checkout-totals__row checkout-totals__row--total">
                    <span>Total final</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="checkout-divider" />

                <div className="checkout-terms">
                  <label className="checkout-terms__label">
                    <input
                      type="checkbox"
                      checked={aceptTerms}
                      onChange={(e) => setAceptTerms(e.target.checked)}
                      className="checkout-terms__checkbox"
                      disabled={submitting}
                    />
                    <span className="checkout-terms__text">
                      Acepto los <Link to="#" className="checkout-terms__link">términos y condiciones</Link> y <Link to="#" className="checkout-terms__link">política de privacidad</Link>
                    </span>
                  </label>
                  {!aceptTerms && touched.nombre && <p className="checkout-terms__error">Debes aceptar los términos para continuar</p>}
                </div>

                <button
                  type="button"
                  className={`checkout-confirm-btn ${!isFormValid() || submitting ? "checkout-confirm-btn--disabled" : ""}`}
                  onClick={handleConfirm}
                  disabled={!isFormValid() || submitting}
                >
                  {submitting ? "Procesando..." : !addressValidated ? "Valida tu dirección primero" : !aceptTerms ? "Acepta términos para continuar" : "Confirmar pedido"}
                </button>

                <p className="checkout-secure">Pago 100% seguro. Tus datos están protegidos.</p>
              </div>
            </div>
          </aside>
        </form>
      </main>

      <HomeFooter />
    </div>
  );
}