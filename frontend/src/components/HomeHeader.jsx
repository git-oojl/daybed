// HomeHeader.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSignInAlt,
  FaUserCircle,
  FaSearch,
  FaHeart,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaTachometerAlt,
  FaCog,
  FaBoxes,
  FaUser,
  FaUsers,
  FaChartBar,
  FaChevronDown,
} from "react-icons/fa";
import "../assets/home-page.css";
import { routePaths } from "../routes/routePaths.js";
import { useAuthStore } from "../auth/authStore.js";
import { getViewerIdForUser } from "../auth/roleMapping.js";

// ============================================
// ICONOS
// ============================================
function IconUserLogin() {
  return <FaSignInAlt size={18} />;
}

function IconUserProfile() {
  return <FaUserCircle size={22} />;
}

function IconSearch() {
  return <FaSearch size={18} />;
}

function IconHeart({ filled }) {
  return <FaHeart size={18} color={filled ? "#B88E2F" : "currentColor"} />;
}

function IconCart() {
  return <FaShoppingCart size={18} />;
}

function IconMenu() {
  return <FaBars size={20} />;
}

function IconClose() {
  return <FaTimes size={20} />;
}

function IconLogout() {
  return <FaSignOutAlt size={16} />;
}

function IconDashboard() {
  return <FaTachometerAlt size={16} />;
}

function IconProfile() {
  return <FaUser size={16} />;
}

function IconProducts() {
  return <FaBoxes size={16} />;
}

function IconUsers() {
  return <FaUsers size={16} />;
}

function IconSettings() {
  return <FaCog size={16} />;
}

function IconMetrics() {
  return <FaChartBar size={16} />;
}

function IconChevronDown() {
  return <FaChevronDown size={12} />;
}

// ============================================
// CONSTANTES DE NAVEGACIÓN
// ============================================
const NAV_LINKS = [
  { label: "Inicio", path: routePaths.public.home },
  { label: "Tienda", path: routePaths.public.catalog },
  { label: "Sobre Nosotros", path: routePaths.public.contactHelp },
  { label: "Contacto", path: routePaths.public.contactHelp },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Estado de autenticación
  const { user, isAuthenticated, logout } = useAuthStore();

  // Determinar el rol del usuario
  const viewerId = getViewerIdForUser(user);
  const isAdmin = viewerId === "admin";
  const isEmployee = viewerId === "employee";
  const isCustomer = viewerId === "customer";
  const isGuest = !isAuthenticated;

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  // ============================================
  // CERRAR SESIÓN
  // ============================================
  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate(routePaths.public.home);
  };

  // ============================================
  // NAVEGACIÓN DEL MENÚ DE USUARIO
  // ============================================
  const navigateTo = (path) => {
    setUserMenuOpen(false);
    navigate(path);
  };

  // ============================================
  // OBTENER ENLACES DE NAVEGACIÓN
  // ============================================
  const getNavLinks = () => {
    return NAV_LINKS;
  };

  // ============================================
  // OBTENER NOMBRE PARA EL BOTÓN DE USUARIO
  // ============================================
  const getUserButtonLabel = () => {
    if (isAuthenticated) {
      return user?.name || "Mi cuenta";
    }
    return "Iniciar sesión";
  };

  // ============================================
  // OBTENER ROL PARA MOSTRAR EN EL DROPDOWN
  // ============================================
  const getRoleLabel = () => {
    if (isAdmin) return "Administrador";
    if (isEmployee) return "Empleado";
    if (isCustomer) return "Cliente";
    return "Invitado";
  };

  // ============================================
  // OPCIONES DEL MENÚ DE USUARIO SEGÚN ROL
  // ============================================
  const getUserMenuItems = () => {
    const items = [];

    // Dashboard según rol
    let dashboardPath = routePaths.account.orders || "/cuenta/pedidos";
    let dashboardLabel = "Dashboard";

    if (isAdmin) {
      dashboardPath = routePaths.admin.businessMetrics || "/admin/metricas";
      dashboardLabel = "Métricas del negocio";
    } else if (isEmployee) {
      dashboardPath = routePaths.backOffice.dashboard || "/interno";
      dashboardLabel = "Dashboard";
    }

    items.push({
      label: dashboardLabel,
      icon: <IconDashboard />,
      action: () => navigateTo(dashboardPath),
      isAdmin: false,
    });

    // Mi perfil - siempre visible para autenticados
    items.push({
      label: "Mi perfil",
      icon: <IconProfile />,
      action: () => navigateTo(routePaths.account.profile || "/cuenta/perfil"),
      isAdmin: false,
    });

    // Separador
    items.push({ isDivider: true });

    // ===== OPCIONES DE ADMINISTRACIÓN (SOLO ADMIN) =====
    if (isAdmin) {
      items.push({
        label: "Métricas del negocio",
        icon: <IconMetrics />,
        action: () => navigateTo(routePaths.admin.businessMetrics || "/admin/metricas"),
        isAdmin: true,
      });
      items.push({
        label: "Usuarios y roles",
        icon: <IconUsers />,
        action: () => navigateTo(routePaths.admin.internalUsers || "/admin/usuarios"),
        isAdmin: true,
      });
      items.push({
        label: "Configuración",
        icon: <IconSettings />,
        action: () => navigateTo(routePaths.admin.basicSettings || "/admin/configuracion"),
        isAdmin: true,
      });
    }

    // ===== OPCIONES DE EMPLEADO (ADMIN Y EMPLEADO) =====
    if (isAdmin || isEmployee) {
      items.push({
        label: "Productos",
        icon: <IconProducts />,
        action: () => navigateTo(routePaths.backOffice.products || "/interno/productos"),
        isAdmin: true,
      });
    }

    // Separador antes de cerrar sesión
    items.push({ isDivider: true });

    // Cerrar sesión
    items.push({
      label: "Cerrar sesión",
      icon: <IconLogout />,
      action: handleLogout,
      isLogout: true,
    });

    return items;
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
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
          {getNavLinks().map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`home-nav__link${
                location.pathname === link.path ? " home-nav__link--active" : ""
              }`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="home-header__actions">
          {/* Búsqueda */}
          <button
            type="button"
            className="home-header__icon-btn"
            aria-label="Buscar"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            <IconSearch />
          </button>

          {/* Favoritos - Solo clientes o invitados */}
          {(isCustomer || isGuest) && (
            <button
              type="button"
              className="home-header__icon-btn"
              aria-label="Lista de deseos"
              onClick={() => navigate(routePaths.public.catalog)}
            >
              <IconHeart filled={false} />
            </button>
          )}

          {/* Carrito - Solo clientes o invitados */}
          {(isCustomer || isGuest) && (
            <button
              type="button"
              className="home-header__icon-btn"
              aria-label="Carrito"
              onClick={() => navigate(routePaths.checkout.cart)}
            >
              <IconCart />
            </button>
          )}

          {/* =============================================
              MENÚ DE USUARIO CON DROPDOWN
              ============================================= */}
          <div className="home-header__user-wrapper" ref={userMenuRef}>
            {isAuthenticated ? (
              // USUARIO AUTENTICADO
              <button
                type="button"
                className={`home-header__icon-btn home-header__user-btn home-header__user-btn--logged`}
                aria-label={getUserButtonLabel()}
                aria-expanded={userMenuOpen}
                onClick={toggleUserMenu}
              >
                <IconUserProfile />
                <span className="home-header__user-chevron">
                  <IconChevronDown />
                </span>
              </button>
            ) : (
              // USUARIO NO AUTENTICADO
              <button
                type="button"
                className="home-header__icon-btn home-header__user-btn home-header__user-btn--login"
                aria-label="Iniciar sesión"
                onClick={() => navigate(routePaths.account.login)}
              >
                <IconUserLogin />
                <span className="home-header__user-login-label">Acceder</span>
              </button>
            )}

            {/* DROPDOWN DE USUARIO (solo autenticado) */}
            {isAuthenticated && userMenuOpen && (
              <div className="home-header__user-dropdown">
                {/* Header con info del usuario */}
                <div className="home-header__user-header">
                  <div className="home-header__user-avatar">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="home-header__user-info">
                    <div className="home-header__user-name">
                      {user?.name || "Usuario"}
                    </div>
                    <div className="home-header__user-email">
                      {user?.email || "usuario@email.com"}
                    </div>
                    <div className="home-header__user-role">
                      {getRoleLabel()}
                    </div>
                  </div>
                </div>

                <div className="home-header__user-divider" />

                {/* Items del menú según rol */}
                <div className="home-header__user-items">
                  {getUserMenuItems().map((item, index) => {
                    if (item.isDivider) {
                      return (
                        <div key={`divider-${index}`} className="home-header__user-divider" />
                      );
                    }
                    return (
                      <button
                        key={item.label}
                        className={`home-header__user-item${
                          item.isAdmin ? " home-header__user-item--admin" : ""
                        }${item.isLogout ? " home-header__user-item--logout" : ""}`}
                        onClick={item.action}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Menú móvil */}
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

      {/* Búsqueda */}
      {searchOpen && (
        <div className="home-search">
          <input
            type="search"
            className="home-search__input"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                navigate(
                  `${routePaths.public.catalog}?search=${encodeURIComponent(
                    searchQuery
                  )}`
                );
                setSearchOpen(false);
              }
            }}
            autoFocus
          />
        </div>
      )}
    </header>
  );
}