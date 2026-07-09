// InternalUsersPage.jsx
import { useState, useMemo } from "react";
import "../../assets/CSS/admin/internal-users.css";

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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function InternalUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [success, setSuccess] = useState(false);

  // Datos de usuarios simulados
  const [users, setUsers] = useState([
    { id: 1, name: "Ana Gómez", email: "ana@empresa.com", role: "Administrador", active: false, lastLogin: "2026-07-07" },
    { id: 2, name: "Carlos Ruiz", email: "carlos@empresa.com", role: "Empleado", active: false, lastLogin: "2026-06-15" },
    { id: 3, name: "Laura Méndez", email: "laura@empresa.com", role: "Editor", active: true, lastLogin: "2026-07-06" },
    { id: 4, name: "Roberto Sánchez", email: "roberto@empresa.com", role: "Empleado", active: true, lastLogin: "2026-07-05" },
    { id: 5, name: "María Torres", email: "maria@empresa.com", role: "Administrador", active: false, lastLogin: "2026-06-20" },
  ]);

  // Formulario para crear/editar usuario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Empleado",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    let result = users;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        u => u.name.toLowerCase().includes(term) || 
             u.email.toLowerCase().includes(term)
      );
    }
    
    if (filterRole !== "all") {
      result = result.filter(u => u.role === filterRole);
    }
    
    return result;
  }, [users, searchTerm, filterRole]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.active).length;
    const admins = users.filter(u => u.role === "Administrador").length;
    return { total, active, admins };
  }, [users]);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Nombre requerido";
    if (!formData.email.trim()) errors.email = "Email requerido";
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email inválido";
    if (!editingUser && !formData.password.trim()) errors.password = "Contraseña requerida";
    if (editingUser && formData.password && formData.password.length < 4) errors.password = "Mínimo 4 caracteres";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = () => {
    if (!validateForm()) return;

    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      active: true,
      lastLogin: "Nunca",
    };

    setUsers(prev => [...prev, newUser]);
    setFormData({ name: "", email: "", role: "Empleado", password: "" });
    setShowCreateModal(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setShowCreateModal(true);
  };

  const handleUpdateUser = () => {
    if (!validateForm()) return;

    setUsers(prev => prev.map(u => 
      u.id === editingUser.id 
        ? { ...u, name: formData.name, email: formData.email, role: formData.role }
        : u
    ));
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "Empleado", password: "" });
    setShowCreateModal(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleToggleActive = (userId) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, active: !u.active } : u
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "Empleado", password: "" });
    setFormErrors({});
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case "Administrador": return "internal-users__badge--admin";
      case "Editor": return "internal-users__badge--editor";
      default: return "internal-users__badge--employee";
    }
  };

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
            />
            {searchTerm && (
              <button 
                className="internal-users__search-clear"
                onClick={() => setSearchTerm("")}
              >
                <IconClose />
              </button>
            )}
          </div>

          <div className="internal-users__filter">
            <IconFilter />
            <select value={filterRole} onChange={handleFilterChange}>
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
              setShowCreateModal(true);
            }}
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
                        <span className={`internal-users__badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`internal-users__toggle ${user.active ? "internal-users__toggle--active" : "internal-users__toggle--inactive"}`}
                          onClick={() => handleToggleActive(user.id)}
                        >
                          {user.active ? (
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
                      <td>{user.lastLogin}</td>
                      <td>
                        <div className="internal-users__actions">
                          <button
                            className="internal-users__action-btn internal-users__action-btn--edit"
                            onClick={() => handleEditUser(user)}
                            aria-label={`Editar ${user.name}`}
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="internal-users__action-btn internal-users__action-btn--delete"
                            onClick={() => handleDeleteUser(user.id)}
                            aria-label={`Eliminar ${user.name}`}
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
          <div className="internal-users__modal" onClick={(e) => e.stopPropagation()}>
            <div className="internal-users__modal-header">
              <h2>{editingUser ? "Editar usuario" : "Crear usuario interno"}</h2>
              <button className="internal-users__modal-close" onClick={handleCancel}>
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
                />
                {formErrors.name && (
                  <span className="internal-users__field-error">{formErrors.name}</span>
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
                />
                {formErrors.email && (
                  <span className="internal-users__field-error">{formErrors.email}</span>
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
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Editor">Editor</option>
                  <option value="Empleado">Empleado</option>
                </select>
              </div>

              <div className="internal-users__field">
                <label htmlFor="user-password">
                  {editingUser ? "Contraseña (dejar vacío para mantener)" : "Contraseña *"}
                </label>
                <input
                  type="password"
                  id="user-password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder={editingUser ? "Dejar vacío para mantener" : "Mínimo 4 caracteres"}
                  className={formErrors.password ? "internal-users__input--error" : ""}
                />
                {formErrors.password && (
                  <span className="internal-users__field-error">{formErrors.password}</span>
                )}
              </div>
            </div>

            <div className="internal-users__modal-footer">
              <button
                className="internal-users__btn internal-users__btn--secondary"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button
                className="internal-users__btn internal-users__btn--primary"
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
              >
                {editingUser ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}