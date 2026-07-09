// CheckoutSummaryPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/CSS/checkout/checkout-summary.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";

// ============================================
// ICONOS SVG
// ============================================
function IconUser() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 20.5a9 9 0 0 1 18 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 3h4l2 4v6h-6V3ZM8 13h2M14 13h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 19h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2 8h20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 20h9M16.5 3.5l4 4L7 21l-5 1 1-5L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: "Ana Martínez",
    email: "ana.martinez@email.com",
    telefono: "5512345678",
    calle: "Av. Reforma 456",
    colonia: "Col. Juárez",
    ciudad: "Ciudad de México",
    estado: "CDMX",
    codigoPostal: "06600",
    referencias: "Entre piso 3 y 4, timbre Martínez",
  });

  // Estado de campos tocados (validación)
  const [touched, setTouched] = useState({});

  // Términos y condiciones
  const [aceptTerms, setAceptTerms] = useState(false);

  // Datos de productos (simulados desde CartPage)
  const items = [
    {
      id: 1,
      name: "Sofa Esquinero",
      price: 8999,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200",
    },
    {
      id: 2,
      name: "Mesa de Centro",
      price: 2499,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=200",
    },
  ];

  // Métodos de pago
  const [metodoPago, setMetodoPago] = useState("cash");
  const [envio, setEnvio] = useState("standard");

  // Cálculos
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingCost = envio === "express" ? 600 : 500;
  const impuestos = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + impuestos;

  // Validación de campos
  const validateField = (name, value) => {
    if (value.trim() === "") return false;
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return false;
    if (name === "telefono" && !/^[0-9]{10}$/.test(value.replace(/\s/g, "")))
      return false;
    if (name === "codigoPostal" && !/^[0-9]{5}$/.test(value)) return false;
    return true;
  };

  const isFieldError = (name) => {
    return (
      touched[name] &&
      !validateField(name, formData[name]) &&
      formData[name] !== ""
    );
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
      aceptTerms
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      // Marcar todos los campos como tocados
      const allTouched = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Si todo es válido, proceder
      console.log("Pedido confirmado", {
        ...formData,
        metodoPago,
        envio,
        items,
        total,
      });
      navigate(routePaths.account.orders);
    }
  };

  const handleConfirm = () => {
    if (!aceptTerms) {
      alert("Debes aceptar los términos y condiciones para continuar");
      return;
    }
    // Simular confirmación
    console.log("Confirmando pedido...");
    navigate(routePaths.account.orders);
  };

  // ESTIMACIÓN DE ENTREGA
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
        <form className="checkout-grid" onSubmit={handleSubmit}>
          {/* COLUMNA IZQUIERDA - FORMULARIO */}
          <div className="checkout-form">
            {/* DATOS DEL CLIENTE */}
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <span className="checkout-card__icon">
                  <IconUser />
                </span>
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
                      className={
                        isFieldError("nombre") ? "checkout-input--error" : ""
                      }
                      placeholder="Ana Martínez"
                    />
                    {isFieldError("nombre") && (
                      <span className="checkout-field__error">
                        Campo requerido
                      </span>
                    )}
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
                      className={
                        isFieldError("email") ? "checkout-input--error" : ""
                      }
                      placeholder="ana@email.com"
                    />
                    {isFieldError("email") && (
                      <span className="checkout-field__error">
                        Correo inválido
                      </span>
                    )}
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
                      className={
                        isFieldError("telefono") ? "checkout-input--error" : ""
                      }
                      placeholder="5512345678"
                    />
                    {isFieldError("telefono") && (
                      <span className="checkout-field__error">10 dígitos</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECCIÓN DE ENTREGA */}
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <span className="checkout-card__icon">
                  <IconLocation />
                </span>
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
                      className={
                        isFieldError("calle") ? "checkout-input--error" : ""
                      }
                      placeholder="Av. Reforma 456"
                    />
                    {isFieldError("calle") && (
                      <span className="checkout-field__error">
                        Campo requerido
                      </span>
                    )}
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
                      className={
                        isFieldError("colonia") ? "checkout-input--error" : ""
                      }
                      placeholder="Col. Juárez"
                    />
                    {isFieldError("colonia") && (
                      <span className="checkout-field__error">
                        Campo requerido
                      </span>
                    )}
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
                      className={
                        isFieldError("ciudad") ? "checkout-input--error" : ""
                      }
                      placeholder="Ciudad de México"
                    />
                    {isFieldError("ciudad") && (
                      <span className="checkout-field__error">
                        Campo requerido
                      </span>
                    )}
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
                      className={
                        isFieldError("estado") ? "checkout-input--error" : ""
                      }
                      placeholder="CDMX"
                    />
                    {isFieldError("estado") && (
                      <span className="checkout-field__error">
                        Campo requerido
                      </span>
                    )}
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
                      className={
                        isFieldError("codigoPostal")
                          ? "checkout-input--error"
                          : ""
                      }
                      placeholder="06600"
                    />
                    {isFieldError("codigoPostal") && (
                      <span className="checkout-field__error">5 dígitos</span>
                    )}
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
                    />
                  </div>
                </div>

                {/* VALIDACIÓN DE DIRECCIÓN */}
                <div className="checkout-address-validation">
                  <div className="checkout-address-validation__icon">
                    <IconCheck />
                  </div>
                  <div className="checkout-address-validation__content">
                    <p className="checkout-address-validation__title">
                      Dirección validada
                    </p>
                    <p className="checkout-address-validation__desc">
                      {formData.calle}, {formData.colonia}, {formData.ciudad},{" "}
                      {formData.estado} - CP {formData.codigoPostal}
                    </p>
                    <div className="checkout-address-validation__actions">
                      <button type="button" className="checkout-btn--link">
                        <IconEdit /> Editar dirección
                      </button>
                      <button type="button" className="checkout-btn--link">
                        Ver en mapa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ESTIMACIÓN DE ENTREGA */}
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <span className="checkout-card__icon">
                  <IconTruck />
                </span>
                Estimación de entrega
              </h2>
              <div className="checkout-card__body">
                <div className="checkout-shipping-options">
                  <label
                    className={`checkout-shipping-option ${envio === "standard" ? "checkout-shipping-option--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="envio"
                      value="standard"
                      checked={envio === "standard"}
                      onChange={() => setEnvio("standard")}
                    />
                    <div className="checkout-shipping-option__info">
                      <span className="checkout-shipping-option__title">
                        Envío estándar
                      </span>
                      <span className="checkout-shipping-option__desc">
                        3-5 días hábiles
                      </span>
                      <span className="checkout-shipping-option__price">
                        {formatPrice(500)}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`checkout-shipping-option ${envio === "express" ? "checkout-shipping-option--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="envio"
                      value="express"
                      checked={envio === "express"}
                      onChange={() => setEnvio("express")}
                    />
                    <div className="checkout-shipping-option__info">
                      <span className="checkout-shipping-option__title">
                        Envío express
                      </span>
                      <span className="checkout-shipping-option__desc">
                        1-2 días hábiles
                      </span>
                      <span className="checkout-shipping-option__price">
                        {formatPrice(600)}
                      </span>
                    </div>
                  </label>
                </div>

                <div className="checkout-estimated-date">
                  <p className="checkout-estimated-date__label">
                    Fecha estimada de entrega:
                  </p>
                  <p className="checkout-estimated-date__value">
                    {getEstimatedDate()}
                  </p>
                </div>
              </div>
            </div>

            {/* MÉTODO DE PAGO */}
            <div className="checkout-card">
              <h2 className="checkout-card__title">
                <span className="checkout-card__icon">
                  <IconCreditCard />
                </span>
                Método de pago
              </h2>
              <div className="checkout-card__body">
                <div className="checkout-payment-options">
                  <label
                    className={`checkout-payment-option ${metodoPago === "card" ? "checkout-payment-option--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value="card"
                      checked={metodoPago === "card"}
                      onChange={() => setMetodoPago("card")}
                    />
                    <div className="checkout-payment-option__content">
                      <span className="checkout-payment-option__label">
                        Tarjeta de crédito/débito
                      </span>
                    </div>
                  </label>

                  <label
                    className={`checkout-payment-option ${metodoPago === "transfer" ? "checkout-payment-option--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transfer"
                      checked={metodoPago === "transfer"}
                      onChange={() => setMetodoPago("transfer")}
                    />
                    <div className="checkout-payment-option__content">
                      <span className="checkout-payment-option__label">
                        Transferencia bancaria
                      </span>
                    </div>
                  </label>

                  <label
                    className={`checkout-payment-option ${metodoPago === "cash" ? "checkout-payment-option--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value="cash"
                      checked={metodoPago === "cash"}
                      onChange={() => setMetodoPago("cash")}
                    />
                    <div className="checkout-payment-option__content">
                      <span className="checkout-payment-option__label">
                        Efectivo contra entrega
                      </span>
                    </div>
                  </label>
                </div>

                {metodoPago === "card" && (
                  <div className="checkout-card-details">
                    <div className="checkout-row">
                      <div className="checkout-field checkout-field--full">
                        <label htmlFor="cardNumber">Número de tarjeta</label>
                        <input
                          type="text"
                          id="cardNumber"
                          placeholder="**** **** **** 1234"
                        />
                      </div>
                    </div>
                    <div className="checkout-row">
                      <div className="checkout-field">
                        <label htmlFor="cardExpiry">Vigencia</label>
                        <input
                          type="text"
                          id="cardExpiry"
                          placeholder="MM/AA"
                        />
                      </div>
                      <div className="checkout-field">
                        <label htmlFor="cardCvv">CVV</label>
                        <input type="text" id="cardCvv" placeholder="***" />
                      </div>
                    </div>
                  </div>
                )}

                {metodoPago === "transfer" && (
                  <div className="checkout-transfer-info">
                    <p>
                      Te enviaremos los datos para transferencia por correo
                      electrónico.
                    </p>
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
                {/* ITEMS */}
                {items.map((item) => (
                  <div className="checkout-item" key={item.id}>
                    <img
                      className="checkout-item__image"
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                    />
                    <div className="checkout-item__info">
                      <p className="checkout-item__name">{item.name}</p>
                      <p className="checkout-item__qty">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <span className="checkout-item__price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="checkout-divider" />

                {/* TOTALES */}
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

                {/* TÉRMINOS Y CONDICIONES */}
                <div className="checkout-terms">
                  <label className="checkout-terms__label">
                    <input
                      type="checkbox"
                      checked={aceptTerms}
                      onChange={(e) => setAceptTerms(e.target.checked)}
                      className="checkout-terms__checkbox"
                    />
                    <span className="checkout-terms__text">
                      Acepto los{" "}
                      <Link to="#" className="checkout-terms__link">
                        términos y condiciones
                      </Link>{" "}
                      y{" "}
                      <Link to="#" className="checkout-terms__link">
                        política de privacidad
                      </Link>
                    </span>
                  </label>
                  {!aceptTerms && touched.nombre && (
                    <p className="checkout-terms__error">
                      Debes aceptar los términos para continuar
                    </p>
                  )}
                </div>

                {/* BOTÓN CONFIRMAR */}
                <button
                  type="button"
                  className={`checkout-confirm-btn ${!isFormValid() ? "checkout-confirm-btn--disabled" : ""}`}
                  onClick={handleConfirm}
                  disabled={!isFormValid()}
                >
                  {!aceptTerms
                    ? "Acepta términos para continuar"
                    : "Confirmar pedido"}
                </button>

                {/* SEGURO */}
                <p className="checkout-secure">
                  Pago 100% seguro. Tus datos están protegidos.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </main>

      <HomeFooter />
    </div>
  );
}
