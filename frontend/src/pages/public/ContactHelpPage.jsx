import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaQuestionCircle,
  FaTruck,
} from "react-icons/fa";
import "../../assets/home-page.css";
import "../../assets/CSS/public/contact-help.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import PageHero from "../../components/layout/PageHero.jsx";
import OpenStreetMapEmbed from "../../components/store/OpenStreetMapEmbed.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { routePaths } from "../../routes/routePaths.js";

const FAQS = [
  {
    id: "payments",
    question: "¿Qué métodos de pago aceptan?",
    answer: "Puedes pagar con tarjeta, transferencia o efectivo contra entrega cuando la zona y el pedido lo permiten. El método disponible se confirma antes de finalizar la compra.",
  },
  {
    id: "delivery",
    question: "¿Cómo funciona la entrega?",
    answer: "Calculamos distancia, tiempo estimado y costo con tu dirección. Antes de despachar confirmamos accesos, medidas y una ventana de entrega contigo.",
  },
  {
    id: "returns",
    question: "¿Qué hago si mi producto llega dañado?",
    answer: "Contáctanos con tu número de pedido y fotografías dentro de las primeras 48 horas. Nuestro equipo revisará el caso y te explicará la solución disponible.",
  },
  {
    id: "orders",
    question: "¿Dónde puedo seguir mi pedido?",
    answer: "Inicia sesión y entra a Mis pedidos. Ahí encontrarás el estado actual, productos, dirección, pago y datos de entrega de cada compra.",
  },
];

const CONTACT_CARDS = [
  { title: "Llámanos", value: "+52 664 555 0100", detail: "Lun–Vie · 9:00–18:00", href: "tel:+526645550100", icon: <FaPhone /> },
  { title: "Escríbenos", value: "contacto@daybed.local", detail: "Respuesta en horario laboral", href: "mailto:contacto@daybed.local", icon: <FaEnvelope /> },
  { title: "Visítanos", value: "Blvd. Cucapah 20100 Sur", detail: "El Lago, Tijuana, B.C.", href: null, icon: <FaMapMarkerAlt /> },
  { title: "Postventa", value: "Seguimiento de pedidos", detail: "Entrega, cambios y soporte", href: routePaths.account.orders, icon: <FaTruck /> },
];

export default function ContactHelpPage() {
  const [activeFaq, setActiveFaq] = useState("payments");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
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
    if (!formData.name.trim()) nextErrors.name = "Escribe tu nombre";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = "Escribe un correo válido";
    if (!formData.subject.trim()) nextErrors.subject = "Cuéntanos el motivo";
    if (!formData.message.trim()) nextErrors.message = "Escribe tu mensaje";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSent(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    window.setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="home-page contact-page">
      <HomeHeader />
      <PageHero
        title="Nosotros y contacto"
        eyebrow="Daybed · Tijuana"
        image="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=82"
      />

      <main className="contact-container">
        <section className="contact-section contact-section--story" aria-labelledby="about-daybed">
          <div className="about-us">
            <div className="about-us__content">
              <p className="contact-section__eyebrow">Nuestra forma de hacer tienda</p>
              <h2 id="about-daybed" className="contact-section__title">Piezas que hacen espacio para la vida</h2>
              <p className="about-us__text">Daybed nació para acercar muebles funcionales y cálidos a hogares de Tijuana. Elegimos piezas que resuelven el día a día sin convertir la casa en un catálogo: materiales honestos, proporciones cómodas y diseños fáciles de combinar.</p>
              <p className="about-us__text">Te acompañamos desde la medida inicial hasta la entrega. Queremos que sepas qué compras, cuánto ocupa y cómo llegará a tu espacio.</p>
              <div className="about-us__values">
                <span><FaCheckCircle /> Selección con intención</span>
                <span><FaClock /> Atención clara y cercana</span>
                <span><FaTruck /> Entrega coordinada</span>
              </div>
            </div>
            <div className="about-us__image"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1100&q=82" alt="Sala cálida con mobiliario contemporáneo" /></div>
          </div>
        </section>

        <section className="contact-section" aria-labelledby="contact-info">
          <p className="contact-section__eyebrow">Estamos cerca</p>
          <h2 id="contact-info" className="contact-section__title">Hablemos de tu espacio</h2>
          <div className="contact-grid">
            {CONTACT_CARDS.map((card) => {
              const content = <><div className="contact-card__icon">{card.icon}</div><h3>{card.title}</h3><p className="contact-card__value">{card.value}</p><p className="contact-card__detail">{card.detail}</p></>;
              return card.href?.startsWith("/") ? <Link className="contact-card" to={card.href} key={card.title}>{content}</Link> : card.href ? <a className="contact-card" href={card.href} key={card.title}>{content}</a> : <article className="contact-card" key={card.title}>{content}</article>;
            })}
          </div>
        </section>

        <section className="contact-section contact-location" aria-labelledby="daybed-location">
          <div className="contact-location__intro">
            <p className="contact-section__eyebrow">Showroom y punto de salida</p>
            <h2 id="daybed-location" className="contact-section__title">Encuéntranos en Tijuana</h2>
            <p>Visítanos para ver materiales y proporciones. Desde este punto coordinamos las entregas locales de Daybed.</p>
            <div className="contact-location__details"><strong>Blvd. Cucapah 20100 Sur, El Lago</strong><span>Lunes a viernes · 9:00–18:00</span><span>Recomendamos agendar antes de visitar.</span></div>
          </div>
          <OpenStreetMapEmbed />
        </section>

        <section className="contact-section contact-section--split" id="faqs">
          <div className="contact-section__intro">
            <p className="contact-section__eyebrow">Antes de comprar</p>
            <h2 className="contact-section__title"><FaQuestionCircle /> Preguntas frecuentes</h2>
            <p>Las respuestas esenciales sobre pago, entrega, seguimiento y cuidado de tu compra.</p>
          </div>
          <div className="faqs-list">
            {FAQS.map((faq) => (
              <article className="faq-item" key={faq.id}>
                <button type="button" className={activeFaq === faq.id ? "faq-item__question faq-item__question--active" : "faq-item__question"} onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)} aria-expanded={activeFaq === faq.id}>
                  <span>{faq.question}</span><span aria-hidden="true">{activeFaq === faq.id ? "−" : "+"}</span>
                </button>
                {activeFaq === faq.id ? <div className="faq-item__answer"><p>{faq.answer}</p></div> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section contact-section--form" id="contact-form" aria-labelledby="contact-form-title">
          <div className="contact-form__intro">
            <p className="contact-section__eyebrow">Atención personal</p>
            <h2 id="contact-form-title" className="contact-section__title">Cuéntanos qué necesitas</h2>
            <p>Incluye tu número de pedido cuando tu mensaje sea sobre una compra. Así podremos orientarte con mayor precisión.</p>
          </div>
          <div>
            {sent ? <div className="contact__alert contact__alert--success"><FaCheckCircle /><span>Recibimos tu mensaje. Nuestro equipo te responderá en horario laboral.</span></div> : null}
            <form className="contact-form" onSubmit={submitForm} noValidate>
              <div className="contact-form__row"><Field label="Nombre" name="name" value={formData.name} error={errors.name} onChange={updateField} /><Field label="Correo" name="email" type="email" value={formData.email} error={errors.email} onChange={updateField} /></div>
              <Field label="Asunto" name="subject" value={formData.subject} error={errors.subject} onChange={updateField} />
              <Field label="Mensaje" name="message" value={formData.message} error={errors.message} onChange={updateField} multiline />
              <button type="submit" className="contact-form__btn">Enviar mensaje</button>
            </form>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

function Field({ label, name, value, error, onChange, type = "text", multiline = false }) {
  return <div className="contact-form__group"><label htmlFor={name}>{label}</label>{multiline ? <textarea id={name} name={name} value={value} onChange={onChange} rows={5} aria-invalid={Boolean(error)} /> : <input id={name} name={name} type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)} />}{error ? <span className="contact-form__error">{error}</span> : null}</div>;
}
