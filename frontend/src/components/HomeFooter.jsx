import { Link } from "react-router-dom";
import "../assets/home-page.css";
import { routePaths } from "../routes/routePaths.js";

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

export default function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer__inner">
        <div className="home-footer__brand">
          <Link to={routePaths.public.home} className="home-footer__logo">DayBed</Link>
          <p className="home-footer__statement">
            Muebles cálidos, funcionales y bien elegidos para espacios que se viven todos los días.
          </p>
          <p className="home-footer__address">
            Blvd. Cucapah 20100 Sur, El Lago, Tijuana, B.C.
          </p>
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
          <a href="tel:+526645550100">+52 664 555 0100</a>
          <a href="mailto:contacto@daybed.local">contacto@daybed.local</a>
          <p>Lunes a viernes · 9:00–18:00</p>
          <Link to={`${routePaths.public.contactHelp}#contact-form`} className="home-footer__contact-link">Escríbenos</Link>
        </div>
      </div>

      <div className="home-footer__bottom">
        <p className="home-footer__copy">© 2026 DayBed · Tijuana, Baja California</p>
      </div>
    </footer>
  );
}
