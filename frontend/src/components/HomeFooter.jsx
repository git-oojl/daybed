import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/home-page.css";
import { routePaths } from "../routes/routePaths.js";

const FOOTER_LINKS = [
  { label: "Inicio", path: routePaths.public.home },
  { label: "Tienda", path: routePaths.public.catalog },
  { label: "Guardados", path: routePaths.public.savedItems },
  { label: "Contacto y ayuda", path: routePaths.public.contactHelp },
];

const HELP_LINKS = [
  { label: "Opciones de Pago", path: routePaths.public.contactHelp },
  { label: "Devoluciones", path: routePaths.public.contactHelp },
  { label: "Políticas de privacidad", path: routePaths.public.contactHelp },
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
          {newsletterMsg && (
            <p className="home-newsletter__msg">{newsletterMsg}</p>
          )}
        </div>
      </div>

      <p className="home-footer__copy">
        2026 DayBed. Todos los derechos reservados.
      </p>
    </footer>
  );
}
