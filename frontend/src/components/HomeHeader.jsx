import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBox,
  FaCartShopping,
  FaChartLine,
  FaChevronDown,
  FaGear,
  FaHeart,
  FaMagnifyingGlass,
  FaRightFromBracket,
  FaStore,
  FaUser,
  FaUsers,
  FaWarehouse,
  FaXmark,
} from "react-icons/fa6";
import "../assets/home-page.css";
import Avatar from "./account/Avatar.jsx";
import { routePaths } from "../routes/routePaths.js";
import { useEffectiveLocation } from "../dev-preview/useEffectiveRouteState.js";
import { useEffectiveSession } from "../auth/useEffectiveSession.js";
import { getViewerIdForUser } from "../auth/roleMapping.js";
import { cartService } from "../services/backendServices.js";
import { getSavedProductIds, subscribeToSavedItems } from "../services/savedItems.js";
import { useStoreSettings } from "../services/useStoreSettings.js";

const NAV_LINKS = [
  { label: "Inicio", path: routePaths.public.home, section: "home" },
  { label: "Tienda", path: routePaths.public.catalog, section: "catalog" },
  { label: "Nosotros y contacto", path: routePaths.public.contactHelp, section: "contactHelp" },
];

function isPrimaryNavActive(item, location) {
  if (item.section === "home") return location.pathname === routePaths.public.home;
  if (item.section === "catalog") {
    return location.pathname === routePaths.public.catalog || location.pathname.startsWith("/productos/");
  }
  return item.section === "contactHelp" && location.pathname === routePaths.public.contactHelp;
}

function displayName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Mi cuenta";
}

export default function HomeHeader() {
  const navigate = useNavigate();
  const location = useEffectiveLocation();
  const menuRef = useRef(null);
  const { user, isAuthenticated, logout } = useEffectiveSession();
  const { settings: storeSettings } = useStoreSettings();
  const viewer = getViewerIdForUser(user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState(() => getSavedProductIds());
  const [cartCount, setCartCount] = useState(0);
  const storeViewer = !isAuthenticated || viewer === "customer";

  useEffect(() => subscribeToSavedItems(setSavedIds), []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadCount() {
      if (!isAuthenticated) {
        setCartCount(0);
        return;
      }
      try {
        const cart = await cartService.get();
        if (active) setCartCount((cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0));
      } catch {
        if (active) setCartCount(0);
      }
    }
    loadCount();
    const update = () => loadCount();
    window.addEventListener("daybed:cart-updated", update);
    return () => {
      active = false;
      window.removeEventListener("daybed:cart-updated", update);
    };
  }, [isAuthenticated]);

  const accountItems = useMemo(() => {
    if (!isAuthenticated) return [];
    const common = [["Mi perfil", routePaths.account.profile, FaUser]];
    const customer = viewer === "customer" ? [
      ["Mis pedidos", routePaths.account.orders, FaBox],
      ["Guardados", routePaths.public.savedItems, FaHeart],
    ] : [];
    const operations = viewer === "admin" || viewer === "employee" ? [
      ["Operación", routePaths.backOffice.dashboard, FaStore],
      ["Productos", routePaths.backOffice.products, FaWarehouse],
      ["Pedidos de clientes", routePaths.backOffice.orders, FaBox],
    ] : [];
    const admin = viewer === "admin" ? [
      ["Métricas", routePaths.admin.businessMetrics, FaChartLine],
      ["Equipo y accesos", routePaths.admin.rolesPermissions, FaUsers],
      ["Configuración de la tienda", routePaths.admin.basicSettings, FaGear],
    ] : [];
    return [...common, ...customer, ...operations, ...admin];
  }, [isAuthenticated, viewer]);

  function submitSearch(event) {
    event.preventDefault();
    const value = search.trim();
    navigate(value ? `${routePaths.public.catalog}?search=${encodeURIComponent(value)}` : routePaths.public.catalog);
  }

  async function signOut() {
    setAccountOpen(false);
    await logout();
    navigate(routePaths.public.home, { replace: true });
  }

  return (
    <header className="home-header">
      {storeSettings.announcement_message || !storeSettings.storefront_available ? (
        <div className={`home-header__announcement ${!storeSettings.storefront_available ? "home-header__announcement--paused" : ""}`} role="status">
          {storeSettings.storefront_available
            ? storeSettings.announcement_message
            : storeSettings.announcement_message || "La tienda online está en pausa temporal. Puedes seguir explorando y guardar tus favoritos."}
        </div>
      ) : null}
      <div className="home-header__inner home-header__inner--stable">
        <div className="home-header__brand-region">
          <Link className="home-header__logo" to={routePaths.public.home} aria-label={`${storeSettings.store_name || "Daybed"}, inicio`}>{storeSettings.store_name || "Daybed"}</Link>
        </div>

        <nav className="home-header__nav-region" aria-label="Navegación principal">
          {NAV_LINKS.map((item) => <Link key={item.path} to={item.path} className={isPrimaryNavActive(item, location) ? "is-active" : ""}>{item.label}</Link>)}
        </nav>

        <div className="home-header__action-region">
          <form className="home-header__search home-header__search--inline" onSubmit={submitSearch} role="search">
            <FaMagnifyingGlass aria-hidden="true" />
            <input aria-label="Buscar productos" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar" />
          </form>
          {storeViewer ? <Link className="home-header__icon-btn" to={routePaths.public.savedItems} aria-label={`Guardados${savedIds.length ? `, ${savedIds.length}` : ""}`}><FaHeart />{savedIds.length ? <span className="home-header__badge">{savedIds.length}</span> : null}</Link> : null}
          {storeViewer ? <Link className="home-header__icon-btn" to={routePaths.checkout.cart} aria-label={`Carrito${cartCount ? `, ${cartCount}` : ""}`}><FaCartShopping aria-hidden="true" />{cartCount ? <span className="home-header__badge">{cartCount}</span> : null}</Link> : null}
          <div className="home-header__user-wrapper" ref={menuRef}>
            <button className={`home-header__user-btn ${isAuthenticated ? "home-header__user-btn--logged" : "home-header__user-btn--login"}`} type="button" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)}>
              {isAuthenticated ? <Avatar user={user} size="sm" /> : <FaUser />}
              <span className="home-header__user-login-label">{isAuthenticated ? displayName(user).split(" ")[0] : "Cuenta"}</span>
              <FaChevronDown className="home-header__user-chevron" />
            </button>
            {accountOpen ? <div className="home-header__user-dropdown">
              {isAuthenticated ? <>
                <div className="home-header__user-header"><Avatar user={user} size="lg" /><div className="home-header__user-info"><strong className="home-header__user-name">{displayName(user)}</strong><span className="home-header__user-email">{user?.email}</span><span className="home-header__user-role">{viewer === "admin" ? "Administrador" : viewer === "employee" ? "Empleado" : "Cliente"}</span></div></div>
                <div className="home-header__user-divider" />
                <div className="home-header__user-items">{accountItems.map(([label, path, Icon]) => <button key={`${label}-${path}`} type="button" className="home-header__user-item" onClick={() => navigate(path)}><Icon />{label}</button>)}<button type="button" className="home-header__user-item home-header__user-item--logout" onClick={signOut}><FaRightFromBracket />Cerrar sesión</button></div>
              </> : <div className="home-header__user-items"><button className="home-header__user-item" type="button" onClick={() => navigate(routePaths.account.login)}><FaUser />Iniciar sesión</button><button className="home-header__user-item" type="button" onClick={() => navigate(routePaths.account.register)}><FaUsers />Crear cuenta</button></div>}
            </div> : null}
          </div>
          <button className="home-header__menu-btn" type="button" aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <FaXmark /> : <FaBars />}</button>
        </div>
      </div>
      {mobileOpen ? <div className="home-header__mobile-panel"><nav>{NAV_LINKS.map((item) => <Link key={item.path} to={item.path}>{item.label}</Link>)}</nav><form onSubmit={submitSearch}><FaMagnifyingGlass /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en Tienda" /></form></div> : null}
    </header>
  );
}
