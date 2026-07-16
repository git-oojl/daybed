export const backendRoles = {
  customer: "cliente",
  employee: "empleado",
  admin: "administrador",
};

export const viewerRoles = {
  guest: "guest",
  customer: "customer",
  employee: "employee",
  admin: "admin",
};

const backendRoleToViewer = {
  [backendRoles.customer]: viewerRoles.customer,
  [backendRoles.employee]: viewerRoles.employee,
  [backendRoles.admin]: viewerRoles.admin,
};

const viewerRoleToBackend = {
  [viewerRoles.customer]: backendRoles.customer,
  [viewerRoles.employee]: backendRoles.employee,
  [viewerRoles.admin]: backendRoles.admin,
};

export function getViewerRoleFromBackendRole(role) {
  return backendRoleToViewer[role] ?? viewerRoles.guest;
}

export function getBackendRoleFromViewerRole(role) {
  return viewerRoleToBackend[role] ?? null;
}

export function getViewerIdForUser(user) {
  if (!user) {
    return viewerRoles.guest;
  }

  return getViewerRoleFromBackendRole(user.role);
}

export function userHasViewerAccess(user, allowedViewers) {
  return allowedViewers.includes(getViewerIdForUser(user));
}
