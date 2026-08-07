import { Link } from "react-router-dom";
import "../assets/home-page.css";
import { routePaths } from "../routes/routePaths.js";
import useStoreSettings from "../services/useStoreSettings.js";

const STORE_LINKS = [
  { label: "Tienda", path: routePaths.public.catalog },
  { label: "Guardados", path: routePaths.public.savedItems },
  { label: "Nosotros y contacto", path: routePaths.public.contactHelp },
];

const ACCOUNT_LINKS = [
  { label: "Mi perfil", path: routePaths.account.profile },
  { label: "Mis pedidos", path: routePaths.account.orders },
  { label: "Carrito", path: routePaths.checkout.cart },
];

function telephoneHref(value) {
  return `tel:${String(value || "").replace(/[^+\d]/g, "")}`;
}

export default function HomeFooter() {
  const { settings } = useStoreSettings();
  const address = [settings.street, settings.neighborhood, settings.city, settings.state]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="home-footer">
      <div className="home-footer__inner">
        <div className="home-footer__brand">
          <Link to={routePaths.public.home} className="home-footer__logo">{settings.store_name || "Daybed"}</Link>
          <p className="home-footer__statement">
            Muebles cálidos, funcionales y bien elegidos para espacios que se viven todos los días.
          </p>
          <p className="home-footer__address">{address}</p>
          {settings.announcement_message ? <p className="home-footer__announcement">{settings.announcement_message}</p> : null}
        </div>

        <div>
          <p className="home-footer__heading">Explora</p>
          <ul className="home-footer__links">
            {STORE_LINKS.map((link) => <li key={link.label}><Link to={link.path}>{link.label}</Link></li>)}
          </ul>
        </div>

        <div>
          <p className="home-footer__heading">Tu cuenta</p>
          <ul className="home-footer__links">
            {ACCOUNT_LINKS.map((link) => <li key={link.label}><Link to={link.path}>{link.label}</Link></li>)}
          </ul>
        </div>

        <div className="home-footer__contact">
          <p className="home-footer__heading">Atención</p>
          <a href={telephoneHref(settings.contact_phone)}>{settings.contact_phone}</a>
          <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
          <p>{settings.business_hours}</p>
          <Link to={`${routePaths.public.contactHelp}#contact-form`} className="home-footer__contact-link">Escríbenos</Link>
          <div className="home-footer__socials">
            {settings.instagram_url ? <a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a> : null}
            {settings.facebook_url ? <a href={settings.facebook_url} target="_blank" rel="noreferrer">Facebook</a> : null}
          </div>
        </div>
      </div>

      <div className="home-footer__bottom">
        <p className="home-footer__copy">© 2026 {settings.store_name || "Daybed"} · {settings.city}, {settings.state}</p>
      </div>
    </footer>
  );
}
