export const previewViewers = [
  {
    id: "guest",
    label: "Invitado",
    description: "Sin sesión iniciada",
    isAuthenticated: false,
    roles: [],
  },
  {
    id: "customer",
    label: "Cliente",
    description: "Cliente con sesión iniciada",
    isAuthenticated: true,
    roles: ["customer"],
  },
  {
    id: "employee",
    label: "Empleado interno",
    description: "Usuario interno sin permisos administrativos completos",
    isAuthenticated: true,
    roles: ["employee"],
  },
  {
    id: "admin",
    label: "Administrador",
    description: "Usuario interno con permisos administrativos",
    isAuthenticated: true,
    roles: ["admin"],
  },
];

export const accessGroups = {
  all: ["guest", "customer", "employee", "admin"],
  guestOnly: ["guest"],
  publicStore: ["guest", "customer", "employee", "admin"],
  customerAccount: ["customer", "admin"],
  checkout: ["guest", "customer", "admin"],
  backOffice: ["employee", "admin"],
  adminOnly: ["admin"],
  support: ["guest", "customer", "employee", "admin"],
};

export function getPreviewViewer(viewerId) {
  return (
    previewViewers.find((viewer) => viewer.id === viewerId) ?? previewViewers[0]
  );
}

export function canViewerAccess(allowedViewers = accessGroups.all, viewerId) {
  return allowedViewers.includes(viewerId);
}
