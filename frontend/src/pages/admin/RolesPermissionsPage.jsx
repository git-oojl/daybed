// RolesPermissionsPage.jsx
import { useState, useMemo, useCallback } from "react";
import "../../assets/CSS/admin/roles-permissions.css";

// ============================================
// ICONOS SVG
// ============================================
function IconShield() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3s6 1 6 6v4.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V9c0-5 6-6 6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUserCog() {
  return (
    <svg
      width="20"
      height="20"
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
      <path
        d="M19 10v4M21 12h-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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

function IconEdit() {
  return (
    <svg
      width="16"
      height="16"
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

function IconUser() {
  return (
    <svg
      width="16"
      height="16"
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

function IconUsers() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 12a3 3 0 1 0 0-6M7 12a3 3 0 1 1 0-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 20.5a9 9 0 0 1 18 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSave() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 21v-8H7v8M7 3v5h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCancel() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 18L18 6M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================
// DEFINICIÓN DE ROLES Y PERMISOS (FUERA DEL COMPONENTE)
// ============================================
const ROLES = [
  {
    id: "administrador",
    name: "Administrador",
    description: "Control total del sistema",
    icon: <IconShield />,
    color: "#B88E2F",
    users: 3,
  },
  {
    id: "empleado",
    name: "Empleado",
    description: "Acceso a funciones básicas",
    icon: <IconUser />,
    color: "#6B7280",
    users: 8,
  },
  {
    id: "editor",
    name: "Editor",
    description: "Gestión de contenido y productos",
    icon: <IconEdit />,
    color: "#3B82F6",
    users: 4,
  },
  {
    id: "invitado",
    name: "Invitado",
    description: "Acceso limitado de solo lectura",
    icon: <IconUsers />,
    color: "#8B5CF6",
    users: 2,
  },
];

const PERMISSION_GROUPS = [
  {
    id: "dashboard",
    label: "Dashboard",
    permissions: [
      {
        id: "dashboard_view",
        label: "Ver dashboard",
        admin: true,
        employee: false,
        editor: true,
        guest: false,
      },
      {
        id: "dashboard_edit",
        label: "Editar widgets",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
    ],
  },
  {
    id: "usuarios",
    label: "Usuarios",
    permissions: [
      {
        id: "users_view",
        label: "Ver usuarios",
        admin: true,
        employee: false,
        editor: true,
        guest: false,
      },
      {
        id: "users_create",
        label: "Crear usuarios",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
      {
        id: "users_edit",
        label: "Editar usuarios",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
      {
        id: "users_delete",
        label: "Eliminar usuarios",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
    ],
  },
  {
    id: "productos",
    label: "Productos",
    permissions: [
      {
        id: "products_view",
        label: "Ver productos",
        admin: true,
        employee: true,
        editor: true,
        guest: true,
      },
      {
        id: "products_create",
        label: "Crear productos",
        admin: true,
        employee: false,
        editor: true,
        guest: false,
      },
      {
        id: "products_edit",
        label: "Editar productos",
        admin: true,
        employee: false,
        editor: true,
        guest: false,
      },
      {
        id: "products_delete",
        label: "Eliminar productos",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
    ],
  },
  {
    id: "ventas",
    label: "Ventas",
    permissions: [
      {
        id: "sales_view",
        label: "Ver ventas",
        admin: true,
        employee: true,
        editor: true,
        guest: false,
      },
      {
        id: "sales_export",
        label: "Exportar ventas",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    permissions: [
      {
        id: "settings_view",
        label: "Ver configuración",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
      {
        id: "settings_edit",
        label: "Editar configuración",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    permissions: [
      {
        id: "reports_view",
        label: "Ver reportes",
        admin: true,
        employee: false,
        editor: true,
        guest: false,
      },
      {
        id: "reports_generate",
        label: "Generar reportes",
        admin: true,
        employee: false,
        editor: false,
        guest: false,
      },
    ],
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState("administrador");
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [success, setSuccess] = useState(false);

  // ===== OBTENER PERMISOS DEL ROL SELECCIONADO =====
  const getRolePermissions = useCallback((roleId) => {
    const roleMap = {
      administrador: "admin",
      empleado: "employee",
      editor: "editor",
      invitado: "guest",
    };
    const key = roleMap[roleId] || "admin";
    return PERMISSION_GROUPS.flatMap((group) =>
      group.permissions.map((p) => ({
        ...p,
        groupId: group.id,
        groupLabel: group.label,
        hasPermission: p[key] || false,
      })),
    );
  }, []);

  const currentPermissions = useMemo(() => {
    return getRolePermissions(selectedRole);
  }, [selectedRole, getRolePermissions]);

  // ===== TOGGLE PERMISO =====
  const togglePermission = useCallback(
    (permissionId) => {
      // Simulación de toggle (en producción esto actualizaría el backend)
      console.log(`Toggle permiso ${permissionId} para rol ${selectedRole}`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    },
    [selectedRole],
  );

  // ===== GUARDAR CAMBIOS =====
  const handleSave = useCallback(() => {
    setSuccess(true);
    setEditingPermissions(false);
    setTimeout(() => setSuccess(false), 3000);
  }, []);

  // ===== CANCELAR =====
  const handleCancel = useCallback(() => {
    setEditingPermissions(false);
  }, []);

  // Obtener el nombre del rol seleccionado
  const selectedRoleName = ROLES.find((r) => r.id === selectedRole)?.name || "";

  return (
    
    <div className="roles-permissions">
      {/* ===== HERO HEADER ===== */}
      <section className="roles-permissions-hero" aria-label="Roles y permisos">
        <div className="roles-permissions-hero__overlay">
          <div className="roles-permissions-hero__content">
            <div className="roles-permissions-hero__icon">
              <IconShield />
            </div>
            <div className="roles-permissions-hero__text">
              <h1 className="roles-permissions-hero__title">
                Roles y permisos
              </h1>
              <p className="roles-permissions-hero__subtitle">
                Gestiona la asignación de roles y el control de acceso para
                empleados y administradores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENIDO ===== */}
      <div className="roles-permissions__content">
        {/* ALERTAS */}
        {success && (
          <div className="roles-permissions__alert roles-permissions__alert--success">
            <IconCheck />
            <span>Cambios guardados exitosamente</span>
          </div>
        )}

        {/* ===== ASIGNACIÓN DE ROLES ===== */}
        <section
          className="roles-permissions__section"
          aria-labelledby="asignacion-roles"
        >
          <h2
            id="asignacion-roles"
            className="roles-permissions__section-title"
          >
            <IconUserCog />
            Asignación de roles
          </h2>
          <p className="roles-permissions__section-desc">
            Selecciona un rol para gestionar sus permisos y asignarlo a los
            usuarios
          </p>

          <div className="roles-permissions__roles-grid">
            {ROLES.map((role) => (
              <button
                key={role.id}
                className={`roles-permissions__role-card ${selectedRole === role.id ? "roles-permissions__role-card--active" : ""}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div
                  className="roles-permissions__role-icon"
                  style={{ color: role.color }}
                >
                  {role.icon}
                </div>
                <div className="roles-permissions__role-info">
                  <h3 className="roles-permissions__role-name">{role.name}</h3>
                  <p className="roles-permissions__role-desc">
                    {role.description}
                  </p>
                  <span className="roles-permissions__role-users">
                    <IconUsers />
                    {role.users} usuarios
                  </span>
                </div>
                {selectedRole === role.id && (
                  <div className="roles-permissions__role-check">
                    <IconCheck />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ===== CONTROL DE ACCESO ===== */}
        <section
          className="roles-permissions__section"
          aria-labelledby="control-acceso"
        >
          <div className="roles-permissions__section-header">
            <div>
              <h2
                id="control-acceso"
                className="roles-permissions__section-title"
              >
                <IconLock />
                Control de acceso
              </h2>
              <p className="roles-permissions__section-desc">
                Gestiona los permisos para el rol{" "}
                <strong>{selectedRoleName}</strong>
              </p>
            </div>
            <div className="roles-permissions__section-actions">
              {editingPermissions ? (
                <>
                  <button
                    className="roles-permissions__btn roles-permissions__btn--secondary"
                    onClick={handleCancel}
                  >
                    <IconCancel />
                    Cancelar
                  </button>
                  <button
                    className="roles-permissions__btn roles-permissions__btn--primary"
                    onClick={handleSave}
                  >
                    <IconSave />
                    Guardar cambios
                  </button>
                </>
              ) : (
                <button
                  className="roles-permissions__btn roles-permissions__btn--primary"
                  onClick={() => setEditingPermissions(true)}
                >
                  <IconEdit />
                  Editar permisos
                </button>
              )}
            </div>
          </div>

          <div className="roles-permissions__table-wrapper">
            <div className="roles-permissions__table-scroll">
              <table className="roles-permissions__table">
                <thead>
                  <tr>
                    <th className="roles-permissions__table-group">Módulo</th>
                    <th className="roles-permissions__table-perm">Permiso</th>
                    <th className="roles-permissions__table-status">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPermissions.map((perm, index) => {
                    const isFirstInGroup =
                      index === 0 ||
                      currentPermissions[index - 1]?.groupId !== perm.groupId;
                    return (
                      <tr key={perm.id}>
                        <td className="roles-permissions__table-group">
                          {isFirstInGroup ? perm.groupLabel : ""}
                        </td>
                        <td className="roles-permissions__table-perm">
                          {perm.label}
                        </td>
                        <td className="roles-permissions__table-status">
                          {editingPermissions ? (
                            <label className="roles-permissions__toggle">
                              <input
                                type="checkbox"
                                checked={perm.hasPermission}
                                onChange={() => togglePermission(perm.id)}
                              />
                              <span className="roles-permissions__slider"></span>
                            </label>
                          ) : (
                            <span
                              className={`roles-permissions__status-badge ${perm.hasPermission ? "roles-permissions__status-badge--active" : "roles-permissions__status-badge--inactive"}`}
                            >
                              {perm.hasPermission ? "Activo" : "Inactivo"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
