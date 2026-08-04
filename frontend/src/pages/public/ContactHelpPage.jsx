import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaQuestionCircle,
  FaRoute,
  FaShieldAlt,
} from "react-icons/fa";
import "../../assets/home-page.css";
import "../../assets/CSS/public/contact-help.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";

const FAQS = [
  {
    id: "payments",
    question: "Que metodos de pago puedo probar?",
    answer:
      "El checkout simula tarjeta, transferencia y efectivo contra entrega. No se hacen cargos reales.",
  },
  {
    id: "delivery",
    question: "Como se calcula la entrega?",
    answer:
      "La direccion se valida con geocodificacion y la ruta usa OpenRouteService cuando hay API key configurada.",
  },
  {
    id: "returns",
    question: "Puedo devolver un producto?",
    answer:
      "Para esta demo, las devoluciones se documentan como flujo de soporte: el cliente contacta a tienda con su numero de pedido.",
  },
  {
    id: "orders",
    question: "Donde veo mi pedido?",
    answer:
      "Inicia sesion y entra a Mis pedidos. Ahi puedes revisar productos, direccion, estado, pago y datos de entrega.",
  },
];

const CONTACT_CARDS = [
  {
    title: "Telefono",
    value: "+52 664 555 0100",
    detail: "Lun-Vie 9:00 - 18:00",
    icon: <FaPhone aria-hidden="true" />,
  },
  {
    title: "Correo",
    value: "contacto@daybed.local",
    detail: "Respuesta en horario laboral",
    icon: <FaEnvelope aria-hidden="true" />,
  },
  {
    title: "Tienda",
    value: "Av. Reforma 1200",
    detail: "Zona Centro, Tijuana",
    icon: <FaMapMarkerAlt aria-hidden="true" />,
  },
  {
    title: "Pedidos",
    value: "Seguimiento interno",
    detail: "Ruta, pago y estado simulados",
    icon: <FaRoute aria-hidden="true" />,
  },
];

export default function ContactHelpPage() {
  const [activeFaq, setActiveFaq] = useState("payments");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submitForm = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Nombre requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Correo valido requerido";
    }
    if (!formData.subject.trim()) nextErrors.subject = "Asunto requerido";
    if (!formData.message.trim()) nextErrors.message = "Mensaje requerido";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSent(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    window.setTimeout(() => setSent(false), 4200);
  };

  return (
    <div className="home-page contact-page">
      <HomeHeader />

      <section className="contact-hero" aria-label="Contacto y ayuda">
        <div className="contact-hero__overlay">
          <div className="contact-hero__content">
            <h1 className="contact-hero__title">Contacto y ayuda</h1>
            <p className="contact-hero__breadcrumb">
              <Link to={routePaths.public.home}>Inicio</Link>
              <span aria-hidden="true">&gt;</span>
              <span>Contacto y ayuda</span>
            </p>
          </div>
        </div>
      </section>

      <main className="contact-container">
        <section className="contact-section" aria-labelledby="about-daybed">
          <div className="about-us">
            <div className="about-us__content">
              <h2 id="about-daybed" className="contact-section__title">
                Sobre Daybed
              </h2>
              <p className="about-us__text">
                Daybed es una tienda de muebles enfocada en piezas funcionales
                para salas, recamaras, comedores, oficina y exterior. El sitio
                conecta catalogo, carrito, checkout, entrega, pedidos e
                inventario para probar una operacion completa.
              </p>
              <div className="about-us__values">
                <span className="about-us__value">
                  <FaCheckCircle aria-hidden="true" /> Catalogo conectado
                </span>
                <span className="about-us__value">
                  <FaShieldAlt aria-hidden="true" /> Pagos simulados
                </span>
                <span className="about-us__value">
                  <FaClock aria-hidden="true" /> Seguimiento de pedidos
                </span>
              </div>
            </div>
            <div className="about-us__image" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80"
                alt=""
              />
            </div>
          </div>
        </section>

        <section className="contact-section" aria-labelledby="contact-info">
          <h2 id="contact-info" className="contact-section__title">
            Informacion de tienda
          </h2>
          <div className="contact-grid">
            {CONTACT_CARDS.map((card) => (
              <article className="contact-card" key={card.title}>
                <div className="contact-card__icon">{card.icon}</div>
                <h3 className="contact-card__title">{card.title}</h3>
                <p className="contact-card__value">{card.value}</p>
                <p className="contact-card__detail">{card.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" aria-labelledby="faqs" id="faqs">
          <h2 id="faqs" className="contact-section__title">
            <FaQuestionCircle aria-hidden="true" />
            Preguntas frecuentes
          </h2>
          <div className="faqs-list">
            {FAQS.map((faq) => (
              <article className="faq-item" key={faq.id}>
                <button
                  type="button"
                  className={`faq-item__question ${
                    activeFaq === faq.id ? "faq-item__question--active" : ""
                  }`}
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-item__icon" aria-hidden="true">
                    {activeFaq === faq.id ? "-" : "+"}
                  </span>
                </button>
                {activeFaq === faq.id ? (
                  <div className="faq-item__answer">
                    <p>{faq.answer}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section
          className="contact-section contact-section--form"
          aria-labelledby="contact-form"
          id="contact-form"
        >
          <h2 id="contact-form" className="contact-section__title">
            Escribir a soporte
          </h2>
          <p className="contact-section__desc">
            Este formulario registra una respuesta simulada para validar la
            experiencia de contacto sin depender de correo externo.
          </p>

          {sent ? (
            <div className="contact__alert contact__alert--success">
              <FaCheckCircle aria-hidden="true" />
              <span>Mensaje simulado enviado. Te responderemos pronto.</span>
            </div>
          ) : null}

          <form className="contact-form" onSubmit={submitForm} noValidate>
            <div className="contact-form__row">
              <Field
                label="Nombre"
                name="name"
                value={formData.name}
                error={errors.name}
                onChange={updateField}
              />
              <Field
                label="Correo"
                name="email"
                type="email"
                value={formData.email}
                error={errors.email}
                onChange={updateField}
              />
            </div>
            <Field
              label="Asunto"
              name="subject"
              value={formData.subject}
              error={errors.subject}
              onChange={updateField}
            />
            <Field
              label="Mensaje"
              name="message"
              value={formData.message}
              error={errors.message}
              onChange={updateField}
              multiline
            />
            <button type="submit" className="contact-form__btn">
              Enviar mensaje
            </button>
          </form>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

function Field({
  label,
  name,
  value,
  error,
  onChange,
  type = "text",
  multiline = false,
}) {
  const inputClass = error ? "contact-form__input--error" : "";
  return (
    <div className="contact-form__group">
      <label htmlFor={name}>{label}</label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={5}
          className={inputClass}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={inputClass}
        />
      )}
      {error ? <span className="contact-form__error">{error}</span> : null}
    </div>
  );
}
