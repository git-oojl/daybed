import { backendRoles, viewerRoles } from "./roleMapping.js";

export const previewViewers = [
  {
    id: viewerRoles.guest,
    label: "Visitante no autenticado",
    description: "Sin sesión iniciada",
    backendRole: null,
    isAuthenticated: false,
    roles: [],
  },
  {
    id: viewerRoles.customer,
    label: "Cliente",
    description: "Cliente con sesión iniciada",
    backendRole: backendRoles.customer,
    isAuthenticated: true,
    roles: [viewerRoles.customer],
  },
  {
    id: viewerRoles.employee,
    label: "Empleado interno",
    description: "Usuario interno sin permisos administrativos completos",
    backendRole: backendRoles.employee,
    isAuthenticated: true,
    roles: [viewerRoles.employee],
  },
  {
    id: viewerRoles.admin,
    label: "Administrador",
    description: "Usuario interno con permisos administrativos",
    backendRole: backendRoles.admin,
    isAuthenticated: true,
    roles: [viewerRoles.admin],
  },
];

export const accessGroups = {
  all: [
    viewerRoles.guest,
    viewerRoles.customer,
    viewerRoles.employee,
    viewerRoles.admin,
  ],
  guestOnly: [viewerRoles.guest],
  publicStore: [
    viewerRoles.guest,
    viewerRoles.customer,
    viewerRoles.employee,
    viewerRoles.admin,
  ],
  authenticated: [viewerRoles.customer, viewerRoles.employee, viewerRoles.admin],
  customerAccount: [viewerRoles.customer, viewerRoles.admin],
  checkout: [viewerRoles.customer, viewerRoles.admin],
  backOffice: [viewerRoles.employee, viewerRoles.admin],
  adminOnly: [viewerRoles.admin],
  support: [
    viewerRoles.guest,
    viewerRoles.customer,
    viewerRoles.employee,
    viewerRoles.admin,
  ],
};

export function getPreviewViewer(viewerId) {
  return (
    previewViewers.find((viewer) => viewer.id === viewerId) ?? previewViewers[0]
  );
}

export function canViewerAccess(allowedViewers = accessGroups.all, viewerId) {
  return allowedViewers.includes(viewerId);
}
