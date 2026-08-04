import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/CSS/account/profile-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { useAuthStore } from "../../auth/authStore.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { accountService } from "../../services/backendServices.js";
import { routePaths } from "../../routes/routePaths.js";

function IconUser() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 20.5a9 9 0 0 1 18 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m22 6-10 7L2 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9M16.5 3.5l4 4L7 21l-5 1 1-5L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLoading() {
  return (
    <svg
      className="profile-loading__spinner"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#B88E2F"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  state: "",
  city: "",
};

const ROLE_LABELS = {
  cliente: "Cliente",
  empleado: "Empleado",
  administrador: "Administrador",
};

const ROLE_BADGE_CLASSES = {
  cliente: "profile-role-badge--customer",
  empleado: "profile-role-badge--employee",
  administrador: "profile-role-badge--admin",
};

const EMPLOYEE_SHORTCUTS = [
  {
    permission: "dashboard.view",
    title: "Dashboard operativo",
    description: "Métricas y actividad interna",
    path: routePaths.backOffice.dashboard,
  },
  {
    permission: "products.view",
    title: "Productos",
    description: "Catálogo y categorías internas",
    path: routePaths.backOffice.products,
  },
  {
    permission: "inventory.view",
    title: "Inventario",
    description: "Stock y alertas de bajo inventario",
    path: routePaths.backOffice.inventory,
  },
  {
    permission: "orders.view",
    title: "Pedidos",
    description: "Seguimiento operativo de pedidos",
    path: routePaths.backOffice.orders,
  },
];

const ADMIN_SHORTCUTS = [
  {
    title: "Mis pedidos",
    description: "Vista de cliente para validar compras",
    path: routePaths.account.orders,
  },
  {
    title: "Carrito",
    description: "Probar flujo de compra como administrador",
    path: routePaths.checkout.cart,
  },
  {
    title: "Guardados",
    description: "Lista local de productos guardados",
    path: routePaths.public.savedItems,
  },
  {
    title: "Métricas del negocio",
    description: "Panel administrativo",
    path: routePaths.admin.businessMetrics,
  },
  {
    title: "Usuarios internos",
    description: "Gestión de cuentas y roles",
    path: routePaths.admin.internalUsers,
  },
  {
    title: "Roles y permisos",
    description: "Paquete operativo de empleados",
    path: routePaths.admin.rolesPermissions,
  },
  {
    title: "Configuración básica",
    description: "Datos públicos de tienda",
    path: routePaths.admin.basicSettings,
  },
];

function formFromProfile(profile) {
  return {
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    state: profile?.state ?? "",
    city: profile?.city ?? "",
  };
}

function getDisplayName(profile) {
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  return fullName || profile?.username || profile?.email || "Usuario";
}

function getErrorMessage(error) {
  return error?.message || "No se pudo completar la operación.";
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
    clearSession,
    setUser,
  } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await accountService.me();
      setProfile(data);
      setEditForm(formFromProfile(data));
      setUser(data);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate(routePaths.account.login);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [isAuthenticated, authLoading, navigate, fetchProfile]);

  const viewerId = getViewerIdForUser(profile ?? user);
  const roleLabel = ROLE_LABELS[profile?.role] ?? profile?.role ?? "Usuario";
  const roleBadgeClass =
    ROLE_BADGE_CLASSES[profile?.role] ?? "profile-role-badge--customer";

  const employeeShortcuts = useMemo(() => {
    const effectivePermissionCodes = profile?.effective_permission_codes ?? [];
    if (viewerId === "admin") {
      return EMPLOYEE_SHORTCUTS;
    }
    return EMPLOYEE_SHORTCUTS.filter((shortcut) =>
      effectivePermissionCodes.includes(shortcut.permission),
    );
  }, [profile?.effective_permission_codes, viewerId]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setSuccessMessage("");

    try {
      const payload = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
        state: editForm.state,
        city: editForm.city,
      };
      const updated = await accountService.updateMe(payload);

      setProfile(updated);
      setEditForm(formFromProfile(updated));
      setUser(updated);
      setEditing(false);
      setSuccessMessage("Perfil actualizado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      await logout();
      navigate(routePaths.public.home);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setFormError(null);
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setFormError(null);
    setSuccessMessage("");

    try {
      await accountService.changePassword(passwordForm);
      setSuccessMessage("Contraseña actualizada. Vuelve a iniciar sesión.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      clearSession();
      navigate(routePaths.account.login);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleCancel = () => {
    setEditForm(formFromProfile(profile));
    setEditing(false);
    setFormError(null);
  };

  if (loading || authLoading) {
    return (
      <div className="home-page profile-page">
        <HomeHeader />
        <div className="profile-loading">
          <IconLoading />
          <p>Cargando tu perfil...</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="home-page profile-page">
        <HomeHeader />
        <div className="profile-error">
          <p>{loadError}</p>
          <button onClick={fetchProfile} type="button">
            Reintentar
          </button>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="home-page profile-page">
        <HomeHeader />
        <div className="profile-empty">
          <p>No se encontraron datos de perfil</p>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="home-page profile-page">
      <HomeHeader />

      <section className="profile-hero" aria-label="Perfil de usuario">
        <div className="profile-hero__overlay">
          <div className="profile-hero__content">
            <h1 className="profile-hero__title">Mi perfil</h1>
            <p className="profile-hero__breadcrumb">
              <a href={routePaths.public.home}>Inicio</a>
              <span aria-hidden="true">&gt;</span>
              Mi perfil
            </p>
          </div>
        </div>
      </section>

      <main className="profile-container">
        {successMessage && (
          <div className="profile__alert profile__alert--success">
            <IconCheck />
            <span>{successMessage}</span>
          </div>
        )}

        {formError && (
          <div className="profile__alert profile__alert--error">
            <span>{formError}</span>
          </div>
        )}

        <div className="profile-grid">
          <section className="profile-card" aria-labelledby="profile-personal">
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon">
                  <IconUser />
                </div>
                <div>
                  <h2 id="profile-personal" className="profile-card__title">
                    Información personal
                  </h2>
                  <p className="profile-card__desc">
                    Datos compartidos para todos los usuarios autenticados
                  </p>
                </div>
              </div>
              {!editing && (
                <button
                  className="profile-card__edit-btn"
                  onClick={() => setEditing(true)}
                  disabled={saving}
                  type="button"
                >
                  <IconEdit />
                  Editar
                </button>
              )}
            </div>

            <div className="profile-card__body">
              {editing ? (
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="profile-form__row">
                    <div className="profile-form__group">
                      <label htmlFor="first_name">Nombre</label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={editForm.first_name}
                        onChange={handleProfileChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="profile-form__group">
                      <label htmlFor="last_name">Apellido</label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={editForm.last_name}
                        onChange={handleProfileChange}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleProfileChange}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="phone">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleProfileChange}
                      disabled={saving}
                    />
                  </div>

                  <div className="profile-form__row">
                    <div className="profile-form__group">
                      <label htmlFor="state">Estado</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={editForm.state}
                        onChange={handleProfileChange}
                        disabled={saving}
                      />
                    </div>
                    <div className="profile-form__group">
                      <label htmlFor="city">Ciudad</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={editForm.city}
                        onChange={handleProfileChange}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="profile-form__actions">
                    <button
                      type="button"
                      className="profile-form__btn profile-form__btn--secondary"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="profile-form__btn profile-form__btn--primary"
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="profile-info__item">
                    <span className="profile-info__label">Nombre</span>
                    <span className="profile-info__value">
                      {getDisplayName(profile)}
                    </span>
                  </div>
                  <div className="profile-info__item">
                    <span className="profile-info__label">Usuario</span>
                    <span className="profile-info__value">{profile.username}</span>
                  </div>
                  <div className="profile-info__item">
                    <span className="profile-info__label">Rol</span>
                    <span
                      className={`profile-role-badge ${roleBadgeClass}`}
                    >
                      {roleLabel}
                    </span>
                  </div>
                  <div className="profile-info__item">
                    <span className="profile-info__label">Estado</span>
                    <span className="profile-info__value">
                      {profile.state || "No definido"}
                    </span>
                  </div>
                  <div className="profile-info__item">
                    <span className="profile-info__label">Ciudad</span>
                    <span className="profile-info__value">
                      {profile.city || "No definida"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="profile-card" aria-labelledby="profile-contact">
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon">
                  <IconMail />
                </div>
                <div>
                  <h2 id="profile-contact" className="profile-card__title">
                    Datos de contacto
                  </h2>
                  <p className="profile-card__desc">
                    Información personal de contacto
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-card__body">
              <div className="profile-contact-info">
                <div className="profile-contact-info__item">
                  <div className="profile-contact-info__icon">
                    <IconMail />
                  </div>
                  <div>
                    <p className="profile-contact-info__label">
                      Correo electrónico
                    </p>
                    <p className="profile-contact-info__value">{profile.email}</p>
                  </div>
                </div>
                <div className="profile-contact-info__item">
                  <div className="profile-contact-info__icon">
                    <IconPhone />
                  </div>
                  <div>
                    <p className="profile-contact-info__label">Teléfono</p>
                    <p className="profile-contact-info__value">
                      {profile.phone || "No definido"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-card" aria-labelledby="profile-shortcuts">
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon">
                  <IconUser />
                </div>
                <div>
                  <h2 id="profile-shortcuts" className="profile-card__title">
                    Accesos
                  </h2>
                  <p className="profile-card__desc">
                    Enlaces útiles según tu rol y permisos efectivos
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-card__body">
              {viewerId === "customer" && (
                <div className="profile-employee-options">
                  <button
                    className="profile-employee-option"
                    onClick={() => navigate(routePaths.public.catalog)}
                    type="button"
                  >
                    <IconUser />
                    <span>
                      <span className="profile-employee-option__title">
                        Tienda
                      </span>
                      <span className="profile-employee-option__desc">
                        Explora el catálogo activo
                      </span>
                    </span>
                  </button>
                  <button
                    className="profile-employee-option"
                    onClick={() => navigate(routePaths.account.orders)}
                    type="button"
                  >
                    <IconUser />
                    <span>
                      <span className="profile-employee-option__title">
                        Mis pedidos
                      </span>
                      <span className="profile-employee-option__desc">
                        Historial y seguimiento de compras
                      </span>
                    </span>
                  </button>
                  <button
                    className="profile-employee-option"
                    onClick={() => navigate(routePaths.checkout.cart)}
                    type="button"
                  >
                    <IconUser />
                    <span>
                      <span className="profile-employee-option__title">
                        Carrito
                      </span>
                      <span className="profile-employee-option__desc">
                        Revisa productos antes de pagar
                      </span>
                    </span>
                  </button>
                  <button
                    className="profile-employee-option"
                    onClick={() => navigate(routePaths.public.savedItems)}
                    type="button"
                  >
                    <IconUser />
                    <span>
                      <span className="profile-employee-option__title">
                        Guardados
                      </span>
                      <span className="profile-employee-option__desc">
                        Productos marcados para revisar después
                      </span>
                    </span>
                  </button>
                </div>
              )}

              {viewerId === "employee" && (
                <ShortcutList shortcuts={employeeShortcuts} navigate={navigate} />
              )}

              {viewerId === "admin" && (
                <ShortcutList
                  shortcuts={ADMIN_SHORTCUTS}
                  navigate={navigate}
                  admin
                />
              )}
            </div>
          </section>

          <section
            className="profile-card"
            aria-labelledby="profile-password"
          >
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon">
                  <IconLogout />
                </div>
                <div>
                  <h2 id="profile-password" className="profile-card__title">
                    Contraseña
                  </h2>
                  <p className="profile-card__desc">
                    Cambia tu contraseña verificando la actual
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-card__body">
              <form onSubmit={handleSavePassword} className="profile-form">
                <div className="profile-form__group">
                  <label htmlFor="current_password">Contraseña actual</label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    required
                    disabled={passwordSaving}
                  />
                </div>
                <div className="profile-form__group">
                  <label htmlFor="new_password">Nueva contraseña</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    required
                    disabled={passwordSaving}
                  />
                </div>
                <div className="profile-form__group">
                  <label htmlFor="confirm_password">Confirmar contraseña</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    required
                    disabled={passwordSaving}
                  />
                </div>
                <div className="profile-form__actions">
                  <button
                    type="submit"
                    className="profile-form__btn profile-form__btn--primary"
                    disabled={
                      passwordSaving ||
                      !passwordForm.current_password ||
                      !passwordForm.new_password ||
                      passwordForm.new_password !== passwordForm.confirm_password
                    }
                  >
                    {passwordSaving ? "Guardando..." : "Cambiar contraseña"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section
            className="profile-card profile-card--danger"
            aria-labelledby="profile-actions"
          >
            <div className="profile-card__header">
              <div className="profile-card__header-left">
                <div className="profile-card__icon profile-card__icon--danger">
                  <IconLogout />
                </div>
                <div>
                  <h2 id="profile-actions" className="profile-card__title">
                    Acciones de cuenta
                  </h2>
                  <p className="profile-card__desc">
                    Cierra la sesión actual
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-card__body">
              <div className="profile-actions">
                <button
                  className="profile-actions__btn profile-actions__btn--logout"
                  onClick={handleLogout}
                  disabled={saving}
                  type="button"
                >
                  <IconLogout />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

function ShortcutList({ shortcuts, navigate, admin = false }) {
  if (shortcuts.length === 0) {
    return (
      <p className="profile-addresses__empty">
        No tienes accesos internos habilitados.
      </p>
    );
  }

  const listClass = admin ? "profile-admin-options" : "profile-employee-options";
  const itemClass = admin ? "profile-admin-option" : "profile-employee-option";
  const titleClass = `${itemClass}__title`;
  const descClass = `${itemClass}__desc`;

  return (
    <div className={listClass}>
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.path}
          className={itemClass}
          onClick={() => navigate(shortcut.path)}
          type="button"
        >
          <IconUser />
          <span>
            <span className={titleClass}>{shortcut.title}</span>
            <span className={descClass}>{shortcut.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
