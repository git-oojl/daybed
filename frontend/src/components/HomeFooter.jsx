import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/home-page.css";
import { routePaths } from "../routes/routePaths.js";

const FOOTER_LINKS = [
  { label: "Inicio", path: routePaths.public.home },
  { label: "Tienda", path: routePaths.public.catalog },
  { label: "Sobre Nosotros", path: routePaths.public.contactHelp },
  { label: "Contacto", path: routePaths.public.contactHelp },
];

const HELP_LINKS = [
  { label: "Opciones de Pago", path: routePaths.public.contactHelp },
  { label: "Devoluciones", path: routePaths.public.contactHelp },
  { label: "Políticas de privacidad", path: routePaths.public.contactHelp },
];

const BENEFITS = [
  {
    id: "quality",
    title: "CALIDAD SUPERIOR",
    text: "Fabricado con materiales de primera",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 21h8M12 17v4M6 4h12l1 4-7 4-7-4 1-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "warranty",
    title: "Protección de garantía",
    text: "Garantía de 2 años",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l7 3v6c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "shipping",
    title: "Envío gratis",
    text: "Pedidos +$20,000",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7h11v8H3V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 10h4l3 3v2h-7v-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="1.5" fill="currentColor" />
        <circle cx="17" cy="17" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "support",
    title: "Soporte 24/7",
    text: "Atención dedicada",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 14h2v3H6v-3ZM16 14h2v3h-2v-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HomeFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const handleNewsletter = (event) => {
    event.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      setNewsletterMsg("Ingresa un correo válido");
      return;
    }

    setNewsletterMsg("¡Gracias por suscribirte!");
    setNewsletterEmail("");
  };

  return (
    <footer className="home-footer">
      <div className="home-footer__inner">
        <div>
          <p className="home-footer__logo">DayBed</p>
          <p className="home-footer__address">
            Blvd. Cucapah 20100-Sur, El Lago, 22210 Tijuana, B.C., Mexico
          </p>
        </div>

        <div>
          <p className="home-footer__heading">Links</p>
          <ul className="home-footer__links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="home-footer__heading">Ayuda</p>
          <ul className="home-footer__links">
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="home-footer__heading">Noticias</p>
          <form className="home-newsletter" onSubmit={handleNewsletter}>
            <input
              type="email"
              className="home-newsletter__input"
              placeholder="Ingresa tu correo electrónico"
              value={newsletterEmail}
              onChange={(event) => {
                setNewsletterEmail(event.target.value);
                setNewsletterMsg("");
              }}
            />
            <button type="submit" className="home-newsletter__btn">
              Suscribirse
            </button>
          </form>
          {newsletterMsg && <p className="home-newsletter__msg">{newsletterMsg}</p>}
        </div>
      </div>

      <div className="home-footer__benefits">
        {BENEFITS.map((benefit) => (
          <div key={benefit.id} className="home-footer__benefit">
            <span className="home-footer__benefit-icon">{benefit.icon}</span>
            <p className="home-footer__benefit-title">{benefit.title}</p>
            <p className="home-footer__benefit-text">{benefit.text}</p>
          </div>
        ))}
      </div>

      <p className="home-footer__copy">
        2023 DayBed. Todos los derechos reservados
      </p>
    </footer>
  );
}
