// InternalUsersPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/CSS/admin/internal-users.css";
import { accountService } from "../../services/backendServices.js";
import { useAuthStore } from "../../auth/authStore.js";
import { getViewerIdForUser } from "../../auth/roleMapping.js";
import { routePaths } from "../../routes/routePaths.js";

// ============================================
// ICONOS SVG
// ============================================
function IconUsers() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 20.5a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 12a3 3 0 1 0 0-6M7 12a3 3 0 1 1 0-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconUserPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 20.5a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 6h6M19 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5l4 4L7 21l-5 1 1-5L16.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12h10l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconToggleOn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="6" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16" cy="12" r="4" fill="currentColor"/>
    </svg>
  );
}

function IconToggleOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="6" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="12" r="4" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M6 12h12M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 20.5a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconLoading() {
  return (
    <svg className="internal-users-loading__spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#B88E2F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function InternalUsersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario para crear/editar usuario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Empleado",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // ============================================
  // ✅ CARGAR USUARIOS
  // (DECLARADO ANTES DE USARLO EN useEffect)
  // ============================================
  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await accountService.users();
      // La respuesta puede ser paginada o un array
      const usersList = response.results || response;
      setUsers(usersList);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ VERIFICAR ROL DEL USUARIO (solo admin)
  // ============================================
  useEffect(() => {
    const initializeUsers = async () => {
      if (!authLoading && !isAuthenticated) {
        navigate(routePaths.account.login);
        return;
      }

      if (!authLoading && isAuthenticated) {
        const viewerId = getViewerIdForUser(user);
        if (viewerId !== "admin") {
          navigate(routePaths.support.unauthorized || "/no-autorizado");
          return;
        }
        await loadUsers();
      }
    };

    initializeUsers();
     
  }, [isAuthenticated, authLoading, user, navigate]);

  // ============================================
  // ✅ MAPEO DE ROLES
  // ============================================
  const mapBackendRoleToDisplay = (role) => {
    const roleMap = {
      administrador: "Administrador",
      empleado: "Empleado",
      editor: "Editor",
      cliente: "Cliente",
    };
    return roleMap[role] || role;
  };

  const mapDisplayRoleToBackend = (role) => {
    const roleMap = {
      Administrador: "administrador",
      Empleado: "empleado",
      Editor: "editor",
    };
    return roleMap[role] || role;
  };

  // ============================================
  // ✅ FILTRAR USUARIOS
  // ============================================
  const filteredUsers = useMemo(() => {
    let result = users;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }

    // Filtrar por rol
    if (filterRole !== "all") {
      const backendRole = mapDisplayRoleToBackend(filterRole);
      result = result.filter((u) => u.role === backendRole);
    }

    return result;
  }, [users, searchTerm, filterRole]);

  // ============================================
  // ✅ ESTADÍSTICAS
  // ============================================
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active !== false).length;
    const admins = users.filter((u) => u.role === "administrador").length;
    return { total, active, admins };
  }, [users]);

  // ============================================
  // ✅ HANDLERS DE BÚSQUEDA Y FILTRO
  // ============================================
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  // ============================================
  // ✅ HANDLERS DEL FORMULARIO
  // ============================================
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Nombre requerido";
    if (!formData.email.trim()) errors.email = "Email requerido";
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email inválido";
    if (!editingUser && !formData.password.trim()) {
      errors.password = "Contraseña requerida";
    }
    if (editingUser && formData.password && formData.password.length < 4) {
      errors.password = "Mínimo 4 caracteres";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================
  // ✅ CREAR USUARIO
  // ============================================
  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: mapDisplayRoleToBackend(formData.role),
        password: formData.password,
        is_active: true,
      };

      await accountService.createUser(payload);
      setSuccess(true);
      setShowCreateModal(false);
      setFormData({ name: "", email: "", role: "Empleado", password: "" });
      await loadUsers();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      const errorMessage = err.message || "Error al crear el usuario";
      setError(errorMessage);
      
      // Si hay errores por campo
      if (err.fieldErrors) {
        setFormErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ EDITAR USUARIO
  // ============================================
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: mapBackendRoleToDisplay(user.role),
      password: "",
    });
    setShowCreateModal(true);
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: mapDisplayRoleToBackend(formData.role),
      };

      // Solo incluir contraseña si se proporcionó una nueva
      if (formData.password) {
        payload.password = formData.password;
      }

      await accountService.updateUser(editingUser.id, payload);
      setSuccess(true);
      setShowCreateModal(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "Empleado", password: "" });
      await loadUsers();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      const errorMessage = err.message || "Error al actualizar el usuario";
      setError(errorMessage);
      
      if (err.fieldErrors) {
        setFormErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ ACTIVAR/DESACTIVAR USUARIO
  // ============================================
  const handleToggleActive = async (userId) => {
    const userToToggle = users.find((u) => u.id === userId);
    if (!userToToggle) return;

    setSubmitting(true);
    setError(null);

    try {
      const newStatus = !userToToggle.is_active;
      await accountService.updateUser(userId, { is_active: newStatus });
      await loadUsers();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al cambiar estado del usuario:", err);
      setError(err.message || "Error al cambiar el estado del usuario");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ ELIMINAR USUARIO
  // ============================================
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    setSubmitting(true);
    setError(null);

    try {
      // Desactivar el usuario en lugar de eliminarlo físicamente
      await accountService.updateUser(userId, { is_active: false });
      await loadUsers();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError(err.message || "Error al eliminar el usuario");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ CANCELAR
  // ============================================
  const handleCancel = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "Empleado", password: "" });
    setFormErrors({});
    setError(null);
  };

  // ============================================
  // ✅ OBTENER CLASE DEL BADGE
  // ============================================
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "administrador":
        return "internal-users__badge--admin";
      case "editor":
        return "internal-users__badge--editor";
      default:
        return "internal-users__badge--employee";
    }
  };

  // ============================================
  // ✅ ESTADOS DE CARGA
  // ============================================
  if (loading || authLoading) {
    return (
      <div className="internal-users">
        <section className="internal-users-hero" aria-label="Usuarios internos">
          <div className="internal-users-hero__overlay">
            <div className="internal-users-hero__content">
              <div className="internal-users-hero__icon">
                <IconUsers />
              </div>
              <div className="internal-users-hero__text">
                <h1 className="internal-users-hero__title">Usuarios internos</h1>
                <p className="internal-users-hero__subtitle">
                  Gestiona empleados y administradores del sistema
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className="internal-users-loading">
          <IconLoading />
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div className="internal-users">
        <section className="internal-users-hero" aria-label="Usuarios internos">
          <div className="internal-users-hero__overlay">
            <div className="internal-users-hero__content">
              <div className="internal-users-hero__icon">
                <IconUsers />
              </div>
              <div className="internal-users-hero__text">
                <h1 className="internal-users-hero__title">Usuarios internos</h1>
                <p className="internal-users-hero__subtitle">
                  Gestiona empleados y administradores del sistema
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className="internal-users-error">
          <p>❌ {error}</p>
          <button onClick={loadUsers}>Reintentar</button>
        </div>
      </div>
    );
  }

  // ============================================
  // ✅ RENDER PRINCIPAL
  // ============================================
  return (
    <div className="internal-users">
      {/* ===== HERO HEADER ===== */}
      <section className="internal-users-hero" aria-label="Usuarios internos">
        <div className="internal-users-hero__overlay">
          <div className="internal-users-hero__content">
            <div className="internal-users-hero__icon">
              <IconUsers />
            </div>
            <div className="internal-users-hero__text">
              <h1 className="internal-users-hero__title">Usuarios internos</h1>
              <p className="internal-users-hero__subtitle">
                Gestiona empleados y administradores del sistema
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENIDO CON SCROLL ===== */}
      <div className="internal-users__content">
        {/* ALERTAS */}
        {success && (
          <div className="internal-users__alert internal-users__alert--success">
            <IconCheck />
            <span>Operación realizada exitosamente</span>
          </div>
        )}

        {error && (
          <div className="internal-users__alert internal-users__alert--error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* ===== ESTADÍSTICAS ===== */}
        <div className="internal-users__stats">
          <div className="internal-users__stat">
            <span className="internal-users__stat-number">{stats.total}</span>
            <span className="internal-users__stat-label">Total usuarios</span>
          </div>
          <div className="internal-users__stat">
            <span className="internal-users__stat-number">{stats.active}</span>
            <span className="internal-users__stat-label">Activos</span>
          </div>
          <div className="internal-users__stat">
            <span className="internal-users__stat-number">{stats.admins}</span>
            <span className="internal-users__stat-label">Administradores</span>
          </div>
        </div>

        {/* ===== CONTROLES ===== */}
        <div className="internal-users__controls">
          <div className="internal-users__search">
            <IconSearch />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={submitting}
            />
            {searchTerm && (
              <button
                className="internal-users__search-clear"
                onClick={() => setSearchTerm("")}
                disabled={submitting}
              >
                <IconClose />
              </button>
            )}
          </div>

          <div className="internal-users__filter">
            <IconFilter />
            <select value={filterRole} onChange={handleFilterChange} disabled={submitting}>
              <option value="all">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Editor">Editor</option>
              <option value="Empleado">Empleado</option>
            </select>
          </div>

          <button
            className="internal-users__add-btn"
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: "", email: "", role: "Empleado", password: "" });
              setFormErrors({});
              setError(null);
              setShowCreateModal(true);
            }}
            disabled={submitting}
          >
            <IconUserPlus />
            Nuevo usuario
          </button>
        </div>

        {/* ===== TABLA DE USUARIOS ===== */}
        <div className="internal-users__table-wrapper">
          <div className="internal-users__table-scroll">
            <table className="internal-users__table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último acceso</th>
                  <th className="internal-users__table-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="internal-users__empty">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="internal-users__user-info">
                          <div className="internal-users__avatar">
                            <IconUser />
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`internal-users__badge ${getRoleBadgeClass(user.role)}`}
                        >
                          {mapBackendRoleToDisplay(user.role)}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`internal-users__toggle ${user.is_active !== false ? "internal-users__toggle--active" : "internal-users__toggle--inactive"}`}
                          onClick={() => handleToggleActive(user.id)}
                          disabled={submitting}
                        >
                          {user.is_active !== false ? (
                            <>
                              <IconToggleOn />
                              Activo
                            </>
                          ) : (
                            <>
                              <IconToggleOff />
                              Inactivo
                            </>
                          )}
                        </button>
                      </td>
                      <td>{user.last_login || "Nunca"}</td>
                      <td>
                        <div className="internal-users__actions">
                          <button
                            className="internal-users__action-btn internal-users__action-btn--edit"
                            onClick={() => handleEditUser(user)}
                            aria-label={`Editar ${user.name}`}
                            disabled={submitting}
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="internal-users__action-btn internal-users__action-btn--delete"
                            onClick={() => handleDeleteUser(user.id)}
                            aria-label={`Eliminar ${user.name}`}
                            disabled={submitting}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MODAL CREAR/EDITAR USUARIO ===== */}
      {showCreateModal && (
        <div className="internal-users__modal-overlay" onClick={handleCancel}>
          <div
            className="internal-users__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="internal-users__modal-header">
              <h2>
                {editingUser ? "Editar usuario" : "Crear usuario interno"}
              </h2>
              <button
                className="internal-users__modal-close"
                onClick={handleCancel}
                disabled={submitting}
              >
                <IconClose />
              </button>
            </div>

            <div className="internal-users__modal-body">
              <div className="internal-users__field">
                <label htmlFor="user-name">
                  Nombre completo <span className="internal-users__required">*</span>
                </label>
                <input
                  type="text"
                  id="user-name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Ana Gómez"
                  className={formErrors.name ? "internal-users__input--error" : ""}
                  disabled={submitting}
                />
                {formErrors.name && (
                  <span className="internal-users__field-error">
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div className="internal-users__field">
                <label htmlFor="user-email">
                  Correo electrónico <span className="internal-users__required">*</span>
                </label>
                <input
                  type="email"
                  id="user-email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="ana@empresa.com"
                  className={formErrors.email ? "internal-users__input--error" : ""}
                  disabled={submitting}
                />
                {formErrors.email && (
                  <span className="internal-users__field-error">
                    {formErrors.email}
                  </span>
                )}
              </div>

              <div className="internal-users__field">
                <label htmlFor="user-role">
                  Rol <span className="internal-users__required">*</span>
                </label>
                <select
                  id="user-role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  disabled={submitting}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Editor">Editor</option>
                  <option value="Empleado">Empleado</option>
                </select>
              </div>

              <div className="internal-users__field">
                <label htmlFor="user-password">
                  {editingUser
                    ? "Contraseña (dejar vacío para mantener)"
                    : "Contraseña *"}
                </label>
                <input
                  type="password"
                  id="user-password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder={
                    editingUser
                      ? "Dejar vacío para mantener"
                      : "Mínimo 4 caracteres"
                  }
                  className={formErrors.password ? "internal-users__input--error" : ""}
                  disabled={submitting}
                />
                {formErrors.password && (
                  <span className="internal-users__field-error">
                    {formErrors.password}
                  </span>
                )}
              </div>
            </div>

            <div className="internal-users__modal-footer">
              <button
                className="internal-users__btn internal-users__btn--secondary"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                className="internal-users__btn internal-users__btn--primary"
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                disabled={submitting}
              >
                {submitting
                  ? "Guardando..."
                  : editingUser
                  ? "Actualizar"
                  : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}