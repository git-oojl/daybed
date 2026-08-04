// HomeHeader.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSignInAlt,
  FaUserPlus,
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
  FaClipboardList,
  FaTags,
  FaWarehouse,
} from "react-icons/fa";
import "../assets/home-page.css";
import { routePaths } from "../routes/routePaths.js";
import { useAuthStore } from "../auth/authStore.js";
import { getViewerIdForUser } from "../auth/roleMapping.js";
import {
  getSavedProductIds,
  subscribeToSavedItems,
} from "../services/savedItems.js";

// ============================================
// ICONOS
// ============================================
function IconUserLogin() {
  return <FaSignInAlt size={18} />;
}

function IconRegister() {
  return <FaUserPlus size={16} />;
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

function IconOrders() {
  return <FaClipboardList size={16} />;
}

function IconCategories() {
  return <FaTags size={16} />;
}

function IconInventory() {
  return <FaWarehouse size={16} />;
}

// ============================================
// CONSTANTES DE NAVEGACIÓN
// ============================================
const NAV_LINKS = [
  { label: "Inicio", path: routePaths.public.home },
  { label: "Tienda", path: routePaths.public.catalog },
  { label: "Contacto y ayuda", path: routePaths.public.contactHelp },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [savedIds, setSavedIds] = useState(() => getSavedProductIds());
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
  const canUseBuyerTools = !isEmployee;

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

  useEffect(() => subscribeToSavedItems(setSavedIds), []);

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

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setMenuOpen(false);
    navigate(`${routePaths.public.catalog}?search=${encodeURIComponent(query)}`);
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
      return getUserDisplayName(user) || "Mi cuenta";
    }
    return "Cuenta";
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
  // ✅ OPCIONES DEL MENÚ DE USUARIO SEGÚN ROL
  // ============================================
  const getUserMenuItems = () => {
    const items = [];

    if (isGuest) {
      return [
        {
          label: "Iniciar sesión",
          icon: <IconUserLogin />,
          action: () => navigateTo(routePaths.account.login),
        },
        {
          label: "Crear cuenta",
          icon: <IconRegister />,
          action: () => navigateTo(routePaths.account.register),
        },
        { isDivider: true },
        {
          label: "Guardados",
          icon: <IconHeart filled={savedIds.length > 0} />,
          action: () => navigateTo(routePaths.public.savedItems),
        },
      ];
    }

    // ============================================
    // 🛡️ ADMINISTRADOR
    // ============================================
    if (isAdmin) {
      // Perfil
      items.push({
        label: "Perfil",
        icon: <IconProfile />,
        action: () => navigateTo(routePaths.account.profile || "/cuenta/perfil"),
        isAdmin: false,
      });

      items.push({
        label: "Mis pedidos",
        icon: <IconOrders />,
        action: () => navigateTo(routePaths.account.orders || "/cuenta/pedidos"),
        isAdmin: false,
      });

      items.push({
        label: "Carrito",
        icon: <IconCart />,
        action: () => navigateTo(routePaths.checkout.cart || "/carrito"),
        isAdmin: false,
      });

      items.push({
        label: "Guardados",
        icon: <IconHeart filled={savedIds.length > 0} />,
        action: () => navigateTo(routePaths.public.savedItems),
        isAdmin: false,
      });

      // Separador
      items.push({ isDivider: true });

      // ✅ Métricas del negocio (Dashboard del admin)
      items.push({
        label: "Dashboard",
        icon: <IconMetrics />,
        action: () => navigateTo(routePaths.admin.businessMetrics || "/admin/metricas"),
        isAdmin: true,
      });

      // Configuración básica
      items.push({
        label: "Configuración básica",
        icon: <IconSettings />,
        action: () => navigateTo(routePaths.admin.basicSettings || "/admin/configuracion"),
        isAdmin: true,
      });

      // Roles y permisos
      items.push({
        label: "Roles y permisos",
        icon: <IconUsers />,
        action: () => navigateTo(routePaths.admin.rolesPermissions || "/admin/roles-permisos"),
        isAdmin: true,
      });

      // Usuarios internos
      items.push({
        label: "Usuarios internos",
        icon: <IconUsers />,
        action: () => navigateTo(routePaths.admin.internalUsers || "/admin/usuarios"),
        isAdmin: true,
      });

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
    }

    // ============================================
    // 👔 EMPLEADO
    // ============================================
    if (isEmployee) {
      // Perfil
      items.push({
        label: "Perfil",
        icon: <IconProfile />,
        action: () => navigateTo(routePaths.account.profile || "/cuenta/perfil"),
        isAdmin: false,
      });

      // Separador
      items.push({ isDivider: true });

      // Dashboard exclusivo del empleado
      items.push({
        label: "Dashboard",
        icon: <IconDashboard />,
        action: () => navigateTo(routePaths.backOffice.dashboard || "/interno"),
        isAdmin: false,
      });

      // Productos
      items.push({
        label: "Productos",
        icon: <IconProducts />,
        action: () => navigateTo(routePaths.backOffice.products || "/interno/productos"),
        isAdmin: false,
      });

      // Categorías
      items.push({
        label: "Categorías",
        icon: <IconCategories />,
        action: () => navigateTo(routePaths.backOffice.categories || "/interno/categorias"),
        isAdmin: false,
      });

      // Inventario
      items.push({
        label: "Inventario",
        icon: <IconInventory />,
        action: () => navigateTo(routePaths.backOffice.inventory || "/interno/inventario"),
        isAdmin: false,
      });

      // Pedidos internos
      items.push({
        label: "Pedidos internos",
        icon: <IconOrders />,
        action: () => navigateTo(routePaths.backOffice.orders || "/interno/pedidos"),
        isAdmin: false,
      });

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
    }

    // ============================================
    // 👤 CLIENTE
    // ============================================
    if (isCustomer) {
      // Dashboard del cliente (Mis pedidos)
      items.push({
        label: "Dashboard",
        icon: <IconDashboard />,
        action: () => navigateTo(routePaths.account.orders || "/cuenta/pedidos"),
        isAdmin: false,
      });

      // Mi perfil
      items.push({
        label: "Mi perfil",
        icon: <IconProfile />,
        action: () => navigateTo(routePaths.account.profile || "/cuenta/perfil"),
        isAdmin: false,
      });

      items.push({
        label: "Carrito",
        icon: <IconCart />,
        action: () => navigateTo(routePaths.checkout.cart || "/carrito"),
        isAdmin: false,
      });

      items.push({
        label: "Guardados",
        icon: <IconHeart filled={savedIds.length > 0} />,
        action: () => navigateTo(routePaths.public.savedItems),
        isAdmin: false,
      });

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
    }

    // ============================================
    // 🚪 INVITADO
    // ============================================
    return [];
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
          <form className="home-header__search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className="home-header__search-input"
              placeholder="Buscar"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Buscar productos"
            />
            <button type="submit" className="home-header__icon-btn" aria-label="Buscar">
              <IconSearch />
            </button>
          </form>

          {/* Guardados */}
          {canUseBuyerTools && (
            <button
              type="button"
              className="home-header__icon-btn"
              aria-label="Productos guardados"
              onClick={() => navigate(routePaths.public.savedItems)}
            >
              <IconHeart filled={savedIds.length > 0} />
              {savedIds.length > 0 && (
                <span className="home-header__badge">{savedIds.length}</span>
              )}
            </button>
          )}

          {/* Carrito */}
          {canUseBuyerTools && (
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
            <button
              type="button"
              className={`home-header__icon-btn home-header__user-btn ${
                isAuthenticated
                  ? "home-header__user-btn--logged"
                  : "home-header__user-btn--login"
              }`}
              aria-label={getUserButtonLabel()}
              aria-expanded={userMenuOpen}
              onClick={toggleUserMenu}
            >
              {isAuthenticated ? <IconUserProfile /> : <IconUserLogin />}
              {!isAuthenticated && (
                <span className="home-header__user-login-label">Cuenta</span>
              )}
              <span className="home-header__user-chevron">
                <IconChevronDown />
              </span>
            </button>

            {/* DROPDOWN DE USUARIO */}
            {userMenuOpen && (
              <div className="home-header__user-dropdown">
                {/* Header con info del usuario */}
                <div className="home-header__user-header">
                  <div className="home-header__user-avatar">
                    {isAuthenticated
                      ? getUserDisplayName(user).charAt(0)
                      : "D"}
                  </div>
                  <div className="home-header__user-info">
                    <div className="home-header__user-name">
                      {isAuthenticated ? getUserDisplayName(user) : "Invitado"}
                    </div>
                    <div className="home-header__user-email">
                      {user?.email || "Accede para comprar y ver pedidos"}
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
    </header>
  );
}

function getUserDisplayName(user) {
  return (
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    "Usuario"
  );
}
