// ContactHelpPage.jsx
import { useState } from "react";
import "../../assets/home-page.css";
import "../../assets/CSS/public/contact-help.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { FaCheckCircle } from "react-icons/fa";

// ============================================
// ICONOS SVG
// ============================================
function IconPhone() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m22 6-10 7L2 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg
      width="24"
      height="24"
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

function IconClock() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 8h1.5a1 1 0 0 1 1 1v6M14.5 8H16a1 1 0 0 1 1 1v6M8 14h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function IconUsers() {
  return (
    <svg
      width="24"
      height="24"
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
      <path
        d="M17 12a3 3 0 1 0 0-6M7 12a3 3 0 1 1 0-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconFileText() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 3v4a1 1 0 0 0 1 1h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9h1M9 13h6M9 17h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3s6 1 6 6v4.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V9c0-5 6-6 6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ContactHelpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preguntas frecuentes
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "¿Cuáles son los horarios de atención?",
      answer:
        "Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 horas y sábados de 10:00 a 14:00 horas. Cerramos los domingos y días festivos.",
    },
    {
      id: 2,
      question: "¿Cómo puedo realizar un pedido?",
      answer:
        "Puedes realizar un pedido navegando por nuestro catálogo, agregando los productos al carrito y siguiendo el proceso de checkout. También puedes contactarnos por teléfono para asistencia personalizada.",
    },
    {
      id: 3,
      question: "¿Cuáles son los métodos de pago disponibles?",
      answer:
        "Aceptamos tarjetas de crédito/débito, transferencias bancarias y pago contra entrega. En esta versión, el flujo de pago se simula para fines académicos.",
    },
    {
      id: 4,
      question: "¿Cuánto tiempo tarda la entrega?",
      answer:
        "El tiempo de entrega varía según tu ubicación. Generalmente, los pedidos se entregan en un plazo de 3 a 5 días hábiles para envíos estándar y 1 a 2 días para envíos express.",
    },
    {
      id: 5,
      question: "¿Puedo devolver un producto?",
      answer:
        "Sí, ofrecemos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar en su empaque original y en las mismas condiciones. Consulta nuestra política de devoluciones para más detalles.",
    },
    {
      id: 6,
      question: "¿Ofrecen garantía en sus productos?",
      answer:
        "Todos nuestros productos cuentan con garantía de 1 año contra defectos de fabricación. La garantía no cubre daños por uso inadecuado o desgaste normal.",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      setFormErrors({ ...formErrors, [name]: "Este campo es requerido" });
    } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFormErrors({ ...formErrors, [name]: "Correo electrónico inválido" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.name.trim()) errors.name = "Nombre requerido";
    if (!formData.email.trim()) errors.email = "Email requerido";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Correo inválido";
    }
    if (!formData.subject.trim()) errors.subject = "Asunto requerido";
    if (!formData.message.trim()) errors.message = "Mensaje requerido";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <div className="home-page contact-page">
      <HomeHeader />

      {/* HERO */}
      <section className="checkout-hero" aria-label="Resumen de pedido">
        <div className="checkout-hero__overlay">
          <h1 className="checkout-hero__title">Contacto y ayuda</h1>
        </div>
      </section>

      <main className="contact-container">
        {/* ===== SOBRE NOSOTROS ===== */}
        <section className="contact-section" aria-labelledby="about-us">
          <div className="about-us">
            <div className="about-us__content">
              <h2 id="about-us" className="contact-section__title">
                Sobre nosotros
              </h2>
              <p className="about-us__text">
                En <strong>DayBed</strong> creemos que cada hogar merece ser un
                espacio de confort y estilo. Desde nuestra fundación, nos hemos
                dedicado a ofrecer muebles de alta calidad que transforman los
                espacios en hogares.
              </p>
              <p className="about-us__text">
                Nuestra misión es brindar a nuestros clientes una experiencia de
                compra excepcional, con productos que combinan diseño,
                funcionalidad y durabilidad. Trabajamos con los mejores
                materiales y artesanos para garantizar la satisfacción de cada
                cliente.
              </p>
              <div className="about-us__values">
                <div className="about-us__value">
                  <FaCheckCircle className="about-us__value-icon" aria-hidden="true" />
                  <span>Calidad garantizada</span>
                </div>
                <div className="about-us__value">
                  <FaCheckCircle className="about-us__value-icon" aria-hidden="true" />
                  <span>Diseño único</span>
                </div>
                <div className="about-us__value">
                  <FaCheckCircle className="about-us__value-icon" aria-hidden="true" />
                  <span>Compromiso con el cliente</span>
                </div>
              </div>
            </div>
            <div className="about-us__image">
              <div className="about-us__image-placeholder">
                <IconUsers />
                <span>+10 años de experiencia</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== INFORMACIÓN DE CONTACTO ===== */}
        <section className="contact-section" aria-labelledby="contact-info">
          <h2 id="contact-info" className="contact-section__title">
            Información de contacto
          </h2>
          <p className="contact-section__desc">
            Estamos aquí para ayudarte. Contáctanos a través de cualquiera de
            nuestros canales.
          </p>

          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-card__icon">
                <IconPhone />
              </div>
              <h3 className="contact-card__title">Teléfono</h3>
              <p className="contact-card__value">+52 55 1234 5678</p>
              <p className="contact-card__detail">Lun-Vie 9:00 - 18:00</p>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon">
                <IconMail />
              </div>
              <h3 className="contact-card__title">Correo electrónico</h3>
              <p className="contact-card__value">hola@elroble.mx</p>
              <p className="contact-card__detail">Respuesta en 24h</p>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon">
                <IconMapPin />
              </div>
              <h3 className="contact-card__title">Dirección</h3>
              <p className="contact-card__value">Av. Insurgentes 123</p>
              <p className="contact-card__detail">Roma Norte, CDMX</p>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon">
                <IconClock />
              </div>
              <h3 className="contact-card__title">Horario de atención</h3>
              <p className="contact-card__value">Lun-Vie 9:00 - 18:00</p>
              <p className="contact-card__detail">Sáb 10:00 - 14:00</p>
            </div>
          </div>
        </section>

        {/* ===== CANALES DE AYUDA ===== */}
        <section className="contact-section" aria-labelledby="help-channels">
          <h2 id="help-channels" className="contact-section__title">
            Canales de ayuda
          </h2>
          <p className="contact-section__desc">
            Elige el canal que mejor se adapte a tus necesidades.
          </p>

          <div className="channels-grid">
            <div className="channel-card">
              <div className="channel-card__icon">
                <IconWhatsApp />
              </div>
              <h3 className="channel-card__title">WhatsApp</h3>
              <p className="channel-card__desc">
                Atención rápida por mensajería instantánea
              </p>
              <a
                href="https://wa.me/525512345678"
                target="_blank"
                rel="noopener noreferrer"
                className="channel-card__link"
              >
                +52 55 1234 5678
              </a>
            </div>

            <div className="channel-card">
              <div className="channel-card__icon">
                <IconHelp />
              </div>
              <h3 className="channel-card__title">Centro de ayuda</h3>
              <p className="channel-card__desc">
                Resuelve tus dudas con nuestras preguntas frecuentes
              </p>
              <a href="#faqs" className="channel-card__link">
                Ver preguntas frecuentes
              </a>
            </div>

            <div className="channel-card">
              <div className="channel-card__icon">
                <IconMessage />
              </div>
              <h3 className="channel-card__title">Formulario de contacto</h3>
              <p className="channel-card__desc">
                Envíanos un mensaje y te responderemos pronto
              </p>
              <a href="#contact-form" className="channel-card__link">
                Ir al formulario
              </a>
            </div>
          </div>
        </section>

        {/* ===== PREGUNTAS FRECUENTES ===== */}
        <section className="contact-section" aria-labelledby="faqs" id="faqs">
          <h2 id="faqs" className="contact-section__title">
            Preguntas frecuentes
          </h2>
          <p className="contact-section__desc">
            Encuentra respuestas a las preguntas más comunes.
          </p>

          <div className="faqs-list">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <button
                  className={`faq-item__question ${activeFaq === faq.id ? "faq-item__question--active" : ""}`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-item__icon">
                    {activeFaq === faq.id ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === faq.id && (
                  <div className="faq-item__answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== TÉRMINOS Y CONDICIONES ===== */}
        <section className="contact-section" aria-labelledby="terms">
          <h2 id="terms" className="contact-section__title">
            <IconFileText />
            Términos y condiciones
          </h2>
          <p className="contact-section__desc">
            Lee nuestros términos y condiciones para conocer más sobre nuestras
            políticas.
          </p>

          <div className="legal-content">
            <div className="legal-content__item">
              <h4>1. Aceptación de los términos</h4>
              <p>
                Al utilizar nuestro sitio web y realizar compras, aceptas
                cumplir con estos términos y condiciones. Si no estás de
                acuerdo, por favor no utilices nuestros servicios.
              </p>
            </div>
            <div className="legal-content__item">
              <h4>2. Productos y precios</h4>
              <p>
                Todos los precios están expresados en pesos mexicanos (MXN) e
                incluyen impuestos. Nos reservamos el derecho de modificar
                precios sin previo aviso.
              </p>
            </div>
            <div className="legal-content__item">
              <h4>3. Pedidos y pagos</h4>
              <p>
                Los pedidos se registran una vez que se completa el flujo de
                pago simulado. Aceptamos tarjetas de crédito, transferencias
                bancarias y pago contra entrega.
              </p>
            </div>
            <div className="legal-content__item">
              <h4>4. Envíos y entregas</h4>
              <p>
                Realizamos entregas en toda la República Mexicana. Los tiempos
                de entrega pueden variar según la ubicación y la disponibilidad
                del producto.
              </p>
            </div>
            <div className="legal-content__item">
              <h4>5. Devoluciones y garantías</h4>
              <p>
                Ofrecemos garantía de 1 año en todos nuestros productos. Las
                devoluciones son aceptadas dentro de los 30 días posteriores a
                la compra.
              </p>
            </div>
          </div>
        </section>

        {/* ===== POLÍTICA DE PRIVACIDAD ===== */}
        <section className="contact-section" aria-labelledby="privacy">
          <h2 id="privacy" className="contact-section__title">
            <IconShield />
            Política de privacidad
          </h2>
          <p className="contact-section__desc">
            Conoce cómo protegemos y manejamos tus datos personales.
          </p>

          <div className="legal-content">
            <div className="legal-content__item">
              <h4>1. Recopilación de información</h4>
              <p>
                Recopilamos información personal como nombre, dirección de
                correo electrónico, teléfono y dirección de envío para procesar
                tus pedidos y mejorar tu experiencia.
              </p>
            </div>
            <div className="legal-content__item">
              <h4>2. Uso de la información</h4>
              <p>
                Utilizamos tu información para procesar pedidos, enviar
                actualizaciones, mejorar nuestro servicio y personalizar tu
                experiencia de compra.
              </p>
            </div>
            <div className="legal-content__item">
              <h4>3. Protección de datos</h4>
              <p>
                Implementamos medidas de seguridad para proteger tu información
                personal. No compartimos tus datos con terceros sin tu
                consentimiento.
              </p>
            </div>
            <div className="legal-content__item">
              <h4>4. Cookies</h4>
              <p>
                Utilizamos cookies para mejorar la experiencia del usuario y
                analizar el tráfico del sitio web. Puedes deshabilitar las
                cookies en tu navegador.
              </p>
            </div>
            <div className="legal-content__item">
              <h4>5. Derechos del usuario</h4>
              <p>
                Tienes derecho a acceder, rectificar y eliminar tus datos
                personales en cualquier momento. Contáctanos para ejercer estos
                derechos.
              </p>
            </div>
          </div>
        </section>

        {/* ===== FORMULARIO DE AYUDA ===== */}
        <section
          className="contact-section contact-section--form"
          aria-labelledby="contact-form"
          id="contact-form"
        >
          <h2 id="contact-form" className="contact-section__title">
            <IconMessage />
            Formulario de ayuda
          </h2>
          <p className="contact-section__desc">
            Completa el formulario y nos pondremos en contacto contigo.
          </p>

          {success && (
            <div className="contact__alert contact__alert--success">
              <IconCheck />
              <span>
                ¡Mensaje enviado exitosamente! Te responderemos pronto.
              </span>
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-form__row">
              <div className="contact-form__group">
                <label htmlFor="name">Nombre completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ana Martínez"
                  className={
                    formErrors.name ? "contact-form__input--error" : ""
                  }
                />
                {formErrors.name && (
                  <span className="contact-form__error">{formErrors.name}</span>
                )}
              </div>

              <div className="contact-form__group">
                <label htmlFor="email">Correo electrónico *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ana@email.com"
                  className={
                    formErrors.email ? "contact-form__input--error" : ""
                  }
                />
                {formErrors.email && (
                  <span className="contact-form__error">
                    {formErrors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="contact-form__group">
              <label htmlFor="subject">Asunto *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Consulta sobre mi pedido"
                className={
                  formErrors.subject ? "contact-form__input--error" : ""
                }
              />
              {formErrors.subject && (
                <span className="contact-form__error">
                  {formErrors.subject}
                </span>
              )}
            </div>

            <div className="contact-form__group">
              <label htmlFor="message">Mensaje *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Escribe tu mensaje aquí..."
                rows="5"
                className={
                  formErrors.message ? "contact-form__input--error" : ""
                }
              />
              {formErrors.message && (
                <span className="contact-form__error">
                  {formErrors.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="contact-form__btn"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
