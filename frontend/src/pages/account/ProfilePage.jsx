// ProfilePage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/home-page.css";
import "../../assets/CSS/account/profile-page.css";
import HomeHeader from "../../components/HomeHeader.jsx";
import HomeFooter from "../../components/HomeFooter.jsx";
import { useAuthStore } from "../../auth/authStore.js";
import { accountService } from "../../services/backendServices.js";
import { routePaths } from "../../routes/routePaths.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";

// ============================================
// ICONOS SVG
// ============================================
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

function IconMail() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();

  // Estados del perfil
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Formulario de edición
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // ============================================
  // ✅ OBTENER DATOS DEL PERFIL - CON useCallback
  // ============================================
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await accountService.me();
      
      setProfile(data);
      setEditForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (err) {
      console.error("Error al cargar perfil:", err);
      setError(err.message || "Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // ✅ VERIFICAR ROL Y CARGAR PERFIL
  // ============================================
  useEffect(() => {
    // Si aún está cargando la autenticación, esperar
    if (authLoading) {
      return;
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      navigate(routePaths.account.login);
      return;
    }

    // Verificar rol del usuario
    const viewerId = getViewerIdForUser(user);
    
    // Solo clientes pueden ver esta página
    if (viewerId !== "customer") {
      navigate(routePaths.support.unauthorized || "/no-autorizado");
      return;
    }
    
    // Cargar datos del perfil
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [isAuthenticated, authLoading, user, navigate, fetchProfile]);

  // ============================================
  // ✅ ACTUALIZAR PERFIL
  // ============================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await accountService.updateMe(editForm);
      
      setProfile(updated);
      setEditForm({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
      });
      setEditing(false);
      setSuccessMessage("Perfil actualizado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // ✅ CERRAR SESIÓN
  // ============================================
  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      await logout();
      navigate(routePaths.public.home);
    }
  };

  // ============================================
  // ✅ HANDLERS DE FORMULARIOS
  // ============================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // ============================================
  // ✅ ESTADOS DE CARGA Y ERROR
  // ============================================
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

  if (error) {
    return (
      <div className="home-page profile-page">
        <HomeHeader />
        <div className="profile-error">
          <p>❌ {error}</p>
          <button onClick={fetchProfile}>Reintentar</button>
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

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================
  return (
    <div className="home-page profile-page">
      <HomeHeader />

      {/* HERO */}
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
        {/* MENSAJE DE ÉXITO */}
        {successMessage && (
          <div className="profile__alert profile__alert--success">
            <IconCheck />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="profile__alert profile__alert--error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="profile-grid">
          {/* ===== INFORMACIÓN PERSONAL ===== */}
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
                    Tus datos personales y de contacto
                  </p>
                </div>
              </div>
              {!editing && (
                <button
                  className="profile-card__edit-btn"
                  onClick={() => setEditing(true)}
                  disabled={saving}
                >
                  <IconEdit />
                  Editar
                </button>
              )}
            </div>

            <div className="profile-card__body">
              {editing ? (
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="profile-form__group">
                    <label htmlFor="name">Nombre completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleProfileChange}
                      placeholder="Tu nombre"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="profile-form__group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleProfileChange}
                      placeholder="tu@email.com"
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
                      placeholder="5512345678"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="profile-form__actions">
                    <button
                      type="button"
                      className="profile-form__btn profile-form__btn--secondary"
                      onClick={() => setEditing(false)}
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
                    <span className="profile-info__value">{profile.name}</span>
                  </div>
                  <div className="profile-info__item">
                    <span className="profile-info__label">
                      Correo electrónico
                    </span>
                    <span className="profile-info__value">{profile.email}</span>
                  </div>
                  <div className="profile-info__item">
                    <span className="profile-info__label">Teléfono</span>
                    <span className="profile-info__value">{profile.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ===== DATOS DE CONTACTO ===== */}
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
                    Información de contacto adicional
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
                    <p className="profile-contact-info__value">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="profile-contact-info__item">
                  <div className="profile-contact-info__icon">
                    <IconPhone />
                  </div>
                  <div>
                    <p className="profile-contact-info__label">Teléfono</p>
                    <p className="profile-contact-info__value">
                      {profile.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== ACCIONES DE CUENTA ===== */}
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
                    Gestiona la seguridad de tu cuenta
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