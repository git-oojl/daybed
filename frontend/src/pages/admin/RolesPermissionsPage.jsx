// RolesPermissionsPage.jsx
import { useEffect, useMemo, useState } from "react";
import "../../assets/CSS/admin/roles-permissions.css";
import { accessService } from "../../services/backendServices.js";
import HomeHeader from "../../components/HomeHeader.jsx";

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

const ROLE_META = {
  administrador: {
    icon: <IconShield />,
    color: "#B88E2F",
  },
  empleado: {
    icon: <IconUser />,
    color: "#6B7280",
  },
};

const VISIBLE_ROLE_IDS = ["administrador", "empleado"];

function groupPermissions(catalog) {
  return catalog.reduce((groups, permission) => {
    const group = groups.get(permission.category) ?? [];
    group.push(permission);
    groups.set(permission.category, group);
    return groups;
  }, new Map());
}

function getErrorMessage(error) {
  return error?.message || "No se pudo completar la operación.";
}

export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState("empleado");
  const [rolesData, setRolesData] = useState(null);
  const [draftEmployeePermissions, setDraftEmployeePermissions] = useState([]);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadRoles() {
      setLoading(true);
      setError(null);
      try {
        const response = await accessService.roles();
        if (!active) return;
        setRolesData(response);
        const employeeRole = response.roles.find((role) => role.id === "empleado");
        setDraftEmployeePermissions(employeeRole?.permission_codes ?? []);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRoles();
    return () => {
      active = false;
    };
  }, []);

  const visibleRoles = useMemo(() => {
    return (rolesData?.roles ?? []).filter((role) =>
      VISIBLE_ROLE_IDS.includes(role.id),
    );
  }, [rolesData]);

  const selectedRoleData = useMemo(() => {
    return visibleRoles.find((role) => role.id === selectedRole) ?? visibleRoles[0];
  }, [selectedRole, visibleRoles]);

  const groupedPermissions = useMemo(() => {
    return Array.from(groupPermissions(rolesData?.permission_catalog ?? []));
  }, [rolesData]);

  const selectedPermissionSet = useMemo(() => {
    const permissionCodes =
      selectedRoleData?.id === "empleado"
        ? draftEmployeePermissions
        : selectedRoleData?.effective_permission_codes ?? [];
    return new Set(permissionCodes);
  }, [draftEmployeePermissions, selectedRoleData]);
  const selectedRoleName = selectedRoleData?.name ?? "";
  const canEditSelectedRole = selectedRoleData?.id === "empleado";

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    setEditingPermissions(false);
    setSuccess(null);
    setError(null);
  };

  const toggleEmployeePermission = (permissionCode) => {
    setSuccess(null);
    setDraftEmployeePermissions((current) => {
      if (current.includes(permissionCode)) {
        return current.filter((code) => code !== permissionCode);
      }
      return [...current, permissionCode].sort();
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await accessService.updateEmployeeRole(draftEmployeePermissions);
      setRolesData(response);
      const employeeRole = response.roles.find((role) => role.id === "empleado");
      setDraftEmployeePermissions(employeeRole?.permission_codes ?? []);
      setEditingPermissions(false);
      setSuccess("Permisos de empleado guardados.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const employeeRole = rolesData?.roles.find((role) => role.id === "empleado");
    setDraftEmployeePermissions(employeeRole?.permission_codes ?? []);
    setEditingPermissions(false);
    setSuccess(null);
    setError(null);
  };

  // ============================================
  // ✅ RENDER CON HOMEHEADER Y HOMEFOOTER
  // ============================================
  return (
    <div className="home-page roles-permissions">
      <HomeHeader />

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
                Gestiona el paquete operativo configurable para empleados
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="roles-permissions__content">
        {success && (
          <div className="roles-permissions__alert roles-permissions__alert--success">
            <IconCheck />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="roles-permissions__alert roles-permissions__alert--error">
            <span>{error}</span>
          </div>
        )}

        <section
          className="roles-permissions__section"
          aria-labelledby="asignacion-roles"
        >
          <h2
            id="asignacion-roles"
            className="roles-permissions__section-title"
          >
            <IconUserCog />
            Roles internos
          </h2>
          <p className="roles-permissions__section-desc">
            Administrador es fijo. Empleado tiene permisos operativos
            configurables.
          </p>

          {loading ? (
            <div className="roles-permissions__empty">Cargando permisos...</div>
          ) : (
            <div className="roles-permissions__roles-grid">
              {visibleRoles.map((role) => {
                const meta = ROLE_META[role.id];
                return (
                  <button
                    key={role.id}
                    className={`roles-permissions__role-card ${
                      selectedRoleData?.id === role.id
                        ? "roles-permissions__role-card--active"
                        : ""
                    }`}
                    onClick={() => handleSelectRole(role.id)}
                    type="button"
                  >
                    <div
                      className="roles-permissions__role-icon"
                      style={{ color: meta?.color }}
                    >
                      {meta?.icon}
                    </div>
                    <div className="roles-permissions__role-info">
                      <h3 className="roles-permissions__role-name">
                        {role.name}
                      </h3>
                      <p className="roles-permissions__role-desc">
                        {role.description}
                      </p>
                      <span className="roles-permissions__role-users">
                        <IconUsers />
                        {role.user_count} usuarios
                      </span>
                    </div>
                    {selectedRoleData?.id === role.id && (
                      <div className="roles-permissions__role-check">
                        <IconCheck />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

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
                Permisos efectivos del rol <strong>{selectedRoleName}</strong>
              </p>
            </div>
            {canEditSelectedRole && !loading && (
              <div className="roles-permissions__section-actions">
                {editingPermissions ? (
                  <>
                    <button
                      className="roles-permissions__btn roles-permissions__btn--secondary"
                      onClick={handleCancel}
                      disabled={saving}
                      type="button"
                    >
                      <IconCancel />
                      Cancelar
                    </button>
                    <button
                      className="roles-permissions__btn roles-permissions__btn--primary"
                      onClick={handleSave}
                      disabled={saving}
                      type="button"
                    >
                      <IconSave />
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </>
                ) : (
                  <button
                    className="roles-permissions__btn roles-permissions__btn--primary"
                    onClick={() => setEditingPermissions(true)}
                    type="button"
                  >
                    Editar permisos
                  </button>
                )}
              </div>
            )}
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
                  {groupedPermissions.flatMap(([category, permissions]) =>
                    permissions.map((permission, index) => {
                      const hasPermission = selectedPermissionSet.has(
                        permission.code,
                      );
                      return (
                        <tr key={permission.code}>
                          <td className="roles-permissions__table-group">
                            {index === 0 ? category : ""}
                          </td>
                          <td className="roles-permissions__table-perm">
                            {permission.label}
                          </td>
                          <td className="roles-permissions__table-status">
                            {editingPermissions && canEditSelectedRole ? (
                              <label className="roles-permissions__toggle">
                                <input
                                  type="checkbox"
                                  checked={hasPermission}
                                  onChange={() =>
                                    toggleEmployeePermission(permission.code)
                                  }
                                />
                                <span className="roles-permissions__slider" />
                              </label>
                            ) : (
                              <span
                                className={`roles-permissions__status-badge ${
                                  hasPermission
                                    ? "roles-permissions__status-badge--active"
                                    : "roles-permissions__status-badge--inactive"
                                }`}
                              >
                                {hasPermission ? "Activo" : "Inactivo"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section
          className="roles-permissions__section"
          aria-labelledby="visitante-anonimo"
        >
          <h2
            id="visitante-anonimo"
            className="roles-permissions__section-title"
          >
            <IconUsers />
            Visitante no autenticado
          </h2>
          <p className="roles-permissions__section-desc">
            Referencia de acceso público: catálogo, detalle de producto,
            registro e inicio de sesión. No es un rol asignable ni configurable.
          </p>
        </section>
      </div>

    </div>
  );
}