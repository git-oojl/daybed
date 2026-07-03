import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/home-page.css";
import { routePaths } from "../routes/routePaths.js";

const NAV_LINKS = [
  { label: "Inicio", path: routePaths.public.home },
  { label: "Tienda", path: routePaths.public.catalog },
  { label: "Sobre Nosotros", path: routePaths.public.contactHelp },
  { label: "Contacto", path: routePaths.public.contactHelp },
];

function IconUser() {
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
    </svg>
  );
}

function IconSearch() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M20 20l-3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconHeart({ filled }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
    >
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCart() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L17 7H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.5" fill="currentColor" />
      <circle cx="16" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="home-header">
      <div className="home-header__inner">
        <Link
          to={routePaths.public.home}
          className="home-header__logo"
          onClick={closeMenu}
        >
          DayBed
        </Link>

        <nav
          className={`home-nav${menuOpen ? " home-nav--open" : ""}`}
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`home-nav__link${location.pathname === link.path ? " home-nav__link--active" : ""}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="home-header__actions">
          <button
            type="button"
            className="home-header__icon-btn"
            aria-label="Mi cuenta"
            onClick={() => navigate(routePaths.account.login)}
          >
            <IconUser />
          </button>
          <button
            type="button"
            className="home-header__icon-btn"
            aria-label="Buscar"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            <IconSearch />
          </button>
          <button
            type="button"
            className="home-header__icon-btn"
            aria-label="Lista de deseos"
            onClick={() => navigate(routePaths.public.catalog)}
          >
            <IconHeart filled={false} />
          </button>
          <button
            type="button"
            className="home-header__icon-btn"
            aria-label="Carrito"
            onClick={() => navigate(routePaths.checkout.cart)}
          >
            <IconCart />
          </button>
          <button
            type="button"
            className="home-header__menu-btn"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="home-search">
          <input
            type="search"
            className="home-search__input"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
