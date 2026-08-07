import { lazy } from "react";

import {
  accessGroups,
  canViewerAccess,
  getPreviewViewer,
  previewViewers,
} from "../auth/viewerAccess.js";

const AdminLayout = lazy(() => import("../layouts/AdminLayout.jsx"));
const BackOfficeLayout = lazy(() => import("../layouts/BackOfficeLayout.jsx"));
const CheckoutLayout = lazy(() => import("../layouts/CheckoutLayout.jsx"));
const CustomerLayout = lazy(() => import("../layouts/CustomerLayout.jsx"));
const PublicLayout = lazy(() => import("../layouts/PublicLayout.jsx"));
const SupportLayout = lazy(() => import("../layouts/SupportLayout.jsx"));

const LoginPage = lazy(() => import("../pages/account/LoginPage.jsx"));
const MyOrdersPage = lazy(() => import("../pages/account/MyOrdersPage.jsx"));
const OrderDetailPage = lazy(() => import("../pages/account/OrderDetailPage.jsx"));
const ProfilePage = lazy(() => import("../pages/account/ProfilePage.jsx"));
const RegisterPage = lazy(() => import("../pages/account/RegisterPage.jsx"));
const BasicSettingsPage = lazy(() => import("../pages/admin/BasicSettingsPage.jsx"));
const BusinessMetricsPage = lazy(() => import("../pages/admin/BusinessMetricsPage.jsx"));
const InternalUsersPage = lazy(() => import("../pages/admin/InternalUsersPage.jsx"));
const RolesPermissionsPage = lazy(() => import("../pages/admin/RolesPermissionsPage.jsx"));
const CategoriesPage = lazy(() => import("../pages/back-office/CategoriesPage.jsx"));
const DashboardPage = lazy(() => import("../pages/back-office/DashboardPage.jsx"));
const InternalOrderDetailPage = lazy(() => import("../pages/back-office/InternalOrderDetailPage.jsx"));
const InternalOrdersPage = lazy(() => import("../pages/back-office/InternalOrdersPage.jsx"));
const InventoryPage = lazy(() => import("../pages/back-office/InventoryPage.jsx"));
const ProductsPage = lazy(() => import("../pages/back-office/ProductsPage.jsx"));
const CartPage = lazy(() => import("../pages/checkout/CartPage.jsx"));
const CheckoutSummaryPage = lazy(() => import("../pages/checkout/CheckoutSummaryPage.jsx"));
const OrderConfirmationPage = lazy(() => import("../pages/checkout/OrderConfirmationPage.jsx"));
const CatalogPage = lazy(() => import("../pages/public/CatalogPage.jsx"));
const ContactHelpPage = lazy(() => import("../pages/public/ContactHelpPage.jsx"));
const HomePage = lazy(() => import("../pages/public/HomePage.jsx"));
const ProductDetailPage = lazy(() => import("../pages/public/ProductDetailPage.jsx"));
const SavedItemsPage = lazy(() => import("../pages/public/SavedItemsPage.jsx"));
const EmptyStatesPage = lazy(() => import("../pages/support/EmptyStatesPage.jsx"));
const FeedbackMessagesPage = lazy(() => import("../pages/support/FeedbackMessagesPage.jsx"));
const SuccessStatePage = lazy(() => import("../pages/support/SuccessStatePage.jsx"));
const ErrorStatePage = lazy(() => import("../pages/support/ErrorStatePage.jsx"));
const LoadingStatesPage = lazy(() => import("../pages/support/LoadingStatesPage.jsx"));
const NotFoundPage = lazy(() => import("../pages/support/NotFoundPage.jsx"));
const UnauthorizedPage = lazy(() => import("../pages/support/UnauthorizedPage.jsx"));

export const previewLayouts = [
  {
    id: "public",
    label: "Sitio público",
    Component: PublicLayout,
  },
  {
    id: "customer",
    label: "Cuenta del cliente",
    Component: CustomerLayout,
  },
  {
    id: "checkout",
    label: "Flujo de compra",
    Component: CheckoutLayout,
  },
  {
    id: "backOffice",
    label: "Back-office",
    Component: BackOfficeLayout,
  },
  {
    id: "admin",
    label: "Administración",
    Component: AdminLayout,
  },
  {
    id: "support",
    label: "Soporte",
    Component: SupportLayout,
  },
];

export const previewViews = [
  {
    id: "home",
    label: "Inicio",
    group: "Sitio público",
    path: "/",
    defaultLayout: "public",
    allowedLayouts: ["public"],
    allowedViewers: accessGroups.publicStore,
    filePath: "frontend/src/pages/public/HomePage.jsx",
    Component: HomePage,
  },
  {
    id: "catalog",
    label: "Catálogo",
    group: "Sitio público",
    path: "/catalogo",
    defaultLayout: "public",
    allowedLayouts: ["public"],
    allowedViewers: accessGroups.publicStore,
    filePath: "frontend/src/pages/public/CatalogPage.jsx",
    Component: CatalogPage,
  },
  {
    id: "productDetail",
    label: "Detalle de producto",
    group: "Sitio público",
    path: "/productos/1",
    defaultLayout: "public",
    allowedLayouts: ["public"],
    allowedViewers: accessGroups.publicStore,
    filePath: "frontend/src/pages/public/ProductDetailPage.jsx",
    Component: ProductDetailPage,
  },
  {
    id: "savedItems",
    label: "Guardados",
    group: "Sitio público",
    path: "/guardados",
    defaultLayout: "public",
    allowedLayouts: ["public"],
    allowedViewers: accessGroups.publicStore,
    filePath: "frontend/src/pages/public/SavedItemsPage.jsx",
    Component: SavedItemsPage,
  },
  {
    id: "contactHelp",
    label: "Nosotros y contacto",
    group: "Sitio público",
    path: "/contacto-ayuda",
    defaultLayout: "public",
    allowedLayouts: ["public"],
    allowedViewers: accessGroups.publicStore,
    filePath: "frontend/src/pages/public/ContactHelpPage.jsx",
    Component: ContactHelpPage,
  },
  {
    id: "login",
    label: "Iniciar sesión",
    group: "Cuenta del cliente",
    path: "/login",
    defaultLayout: "customer",
    allowedLayouts: ["customer"],
    allowedViewers: accessGroups.all,
    filePath: "frontend/src/pages/account/LoginPage.jsx",
    Component: LoginPage,
  },
  {
    id: "register",
    label: "Crear cuenta",
    group: "Cuenta del cliente",
    path: "/crear-cuenta",
    defaultLayout: "customer",
    allowedLayouts: ["customer"],
    allowedViewers: accessGroups.guestOnly,
    filePath: "frontend/src/pages/account/RegisterPage.jsx",
    Component: RegisterPage,
  },
  {
    id: "profile",
    label: "Perfil",
    group: "Cuenta del cliente",
    path: "/cuenta/perfil",
    defaultLayout: "customer",
    allowedLayouts: ["customer"],
    allowedViewers: accessGroups.authenticated,
    filePath: "frontend/src/pages/account/ProfilePage.jsx",
    Component: ProfilePage,
  },
  {
    id: "myOrders",
    label: "Mis pedidos",
    group: "Cuenta del cliente",
    path: "/cuenta/pedidos",
    defaultLayout: "customer",
    allowedLayouts: ["customer"],
    allowedViewers: accessGroups.authenticated,
    filePath: "frontend/src/pages/account/MyOrdersPage.jsx",
    Component: MyOrdersPage,
  },
  {
    id: "orderDetail",
    label: "Detalle de pedido",
    group: "Cuenta del cliente",
    path: "/cuenta/pedidos/DAY-00801",
    defaultLayout: "customer",
    allowedLayouts: ["customer"],
    allowedViewers: accessGroups.authenticated,
    filePath: "frontend/src/pages/account/OrderDetailPage.jsx",
    Component: OrderDetailPage,
  },
  {
    id: "cart",
    label: "Carrito",
    group: "Flujo de compra",
    path: "/carrito",
    defaultLayout: "checkout",
    allowedLayouts: ["checkout"],
    allowedViewers: accessGroups.checkout,
    filePath: "frontend/src/pages/checkout/CartPage.jsx",
    Component: CartPage,
  },
  {
    id: "checkoutSummary",
    label: "Checkout / Resumen de pedido",
    group: "Flujo de compra",
    path: "/checkout",
    defaultLayout: "checkout",
    allowedLayouts: ["checkout"],
    allowedViewers: accessGroups.checkout,
    filePath: "frontend/src/pages/checkout/CheckoutSummaryPage.jsx",
    Component: CheckoutSummaryPage,
  },
  {
    id: "orderConfirmation",
    label: "Confirmación de pedido",
    group: "Flujo de compra",
    path: "/pedido-confirmado/801",
    defaultLayout: "checkout",
    allowedLayouts: ["checkout"],
    allowedViewers: accessGroups.checkout,
    filePath: "frontend/src/pages/checkout/OrderConfirmationPage.jsx",
    Component: OrderConfirmationPage,
  },
  {
    id: "internalDashboard",
    label: "Dashboard interno",
    group: "Back-office",
    path: "/interno",
    defaultLayout: "backOffice",
    allowedLayouts: ["backOffice"],
    allowedViewers: accessGroups.backOffice,
    filePath: "frontend/src/pages/back-office/DashboardPage.jsx",
    Component: DashboardPage,
  },
  {
    id: "products",
    label: "Productos internos",
    group: "Back-office",
    path: "/interno/productos",
    defaultLayout: "backOffice",
    allowedLayouts: ["backOffice"],
    allowedViewers: accessGroups.backOffice,
    filePath: "frontend/src/pages/back-office/ProductsPage.jsx",
    Component: ProductsPage,
  },
  {
    id: "categories",
    label: "Colecciones y atributos",
    group: "Back-office",
    path: "/interno/categorias",
    defaultLayout: "backOffice",
    allowedLayouts: ["backOffice"],
    allowedViewers: accessGroups.backOffice,
    filePath: "frontend/src/pages/back-office/CategoriesPage.jsx",
    Component: CategoriesPage,
  },
  {
    id: "inventory",
    label: "Inventario",
    group: "Back-office",
    path: "/interno/inventario",
    defaultLayout: "backOffice",
    allowedLayouts: ["backOffice"],
    allowedViewers: accessGroups.backOffice,
    filePath: "frontend/src/pages/back-office/InventoryPage.jsx",
    Component: InventoryPage,
  },
  {
    id: "internalOrders",
    label: "Pedidos de clientes",
    group: "Back-office",
    path: "/interno/pedidos",
    defaultLayout: "backOffice",
    allowedLayouts: ["backOffice"],
    allowedViewers: accessGroups.backOffice,
    filePath: "frontend/src/pages/back-office/InternalOrdersPage.jsx",
    Component: InternalOrdersPage,
  },
  {
    id: "internalOrderDetail",
    label: "Detalle operativo de pedido",
    group: "Back-office",
    path: "/interno/pedidos/DAY-00802",
    defaultLayout: "backOffice",
    allowedLayouts: ["backOffice"],
    allowedViewers: accessGroups.backOffice,
    filePath: "frontend/src/pages/back-office/InternalOrderDetailPage.jsx",
    Component: InternalOrderDetailPage,
  },
  {
    id: "internalUsers",
    label: "Usuarios internos",
    group: "Administración",
    path: "/admin/usuarios",
    defaultLayout: "admin",
    allowedLayouts: ["admin"],
    allowedViewers: accessGroups.adminOnly,
    filePath: "frontend/src/pages/admin/InternalUsersPage.jsx",
    Component: InternalUsersPage,
  },
  {
    id: "rolesPermissions",
    label: "Accesos del equipo",
    group: "Administración",
    path: "/admin/roles-permisos",
    defaultLayout: "admin",
    allowedLayouts: ["admin"],
    allowedViewers: accessGroups.adminOnly,
    filePath: "frontend/src/pages/admin/RolesPermissionsPage.jsx",
    Component: RolesPermissionsPage,
  },
  {
    id: "businessMetrics",
    label: "Métricas del negocio",
    group: "Administración",
    path: "/admin/metricas",
    defaultLayout: "admin",
    allowedLayouts: ["admin"],
    allowedViewers: accessGroups.adminOnly,
    filePath: "frontend/src/pages/admin/BusinessMetricsPage.jsx",
    Component: BusinessMetricsPage,
  },
  {
    id: "basicSettings",
    label: "Configuración básica",
    group: "Administración",
    path: "/admin/configuracion",
    defaultLayout: "admin",
    allowedLayouts: ["admin"],
    allowedViewers: accessGroups.adminOnly,
    filePath: "frontend/src/pages/admin/BasicSettingsPage.jsx",
    Component: BasicSettingsPage,
  },
  {
    id: "notFound",
    label: "Página no encontrada",
    group: "Vistas de soporte",
    path: "/ruta-inexistente-demo",
    defaultLayout: "support",
    allowedLayouts: ["support"],
    allowedViewers: accessGroups.support,
    filePath: "frontend/src/pages/support/NotFoundPage.jsx",
    Component: NotFoundPage,
  },
  {
    id: "unauthorized",
    label: "Acceso no autorizado",
    group: "Vistas de soporte",
    path: "/no-autorizado",
    defaultLayout: "support",
    allowedLayouts: ["support"],
    allowedViewers: accessGroups.support,
    filePath: "frontend/src/pages/support/UnauthorizedPage.jsx",
    Component: UnauthorizedPage,
  },
  {
    id: "loadingStates",
    label: "Estados de carga",
    group: "Vistas de soporte",
    path: "/soporte/cargando",
    defaultLayout: "support",
    allowedLayouts: ["support"],
    allowedViewers: accessGroups.support,
    filePath: "frontend/src/pages/support/LoadingStatesPage.jsx",
    Component: LoadingStatesPage,
  },
  {
    id: "emptyStates",
    label: "Estados vacíos",
    group: "Vistas de soporte",
    path: "/soporte/vacio",
    defaultLayout: "support",
    allowedLayouts: ["support"],
    allowedViewers: accessGroups.support,
    filePath: "frontend/src/pages/support/EmptyStatesPage.jsx",
    Component: EmptyStatesPage,
  },
  {
    id: "feedbackMessages",
    label: "Índice de respuestas",
    group: "Vistas de soporte",
    path: "/soporte/mensajes",
    defaultLayout: "support",
    allowedLayouts: ["support"],
    allowedViewers: accessGroups.support,
    filePath: "frontend/src/pages/support/FeedbackMessagesPage.jsx",
    Component: FeedbackMessagesPage,
  },
  {
    id: "successState",
    label: "Confirmación",
    group: "Vistas de soporte",
    path: "/soporte/exito",
    defaultLayout: "support",
    allowedLayouts: ["support"],
    allowedViewers: accessGroups.support,
    filePath: "frontend/src/pages/support/SuccessStatePage.jsx",
    Component: SuccessStatePage,
  },
  {
    id: "errorState",
    label: "Error",
    group: "Vistas de soporte",
    path: "/soporte/error",
    defaultLayout: "support",
    allowedLayouts: ["support"],
    allowedViewers: accessGroups.support,
    filePath: "frontend/src/pages/support/ErrorStatePage.jsx",
    Component: ErrorStatePage,
  },
];

export { getPreviewViewer, previewViewers };

export function getPreviewView(viewId) {
  return previewViews.find((view) => view.id === viewId) ?? previewViews[0];
}

export function getPreviewLayout(layoutId) {
  return (
    previewLayouts.find((layout) => layout.id === layoutId) ?? previewLayouts[0]
  );
}

export function getAllowedPreviewViewer(view, preferredViewerId) {
  if (canPreviewViewer(view, preferredViewerId)) {
    return getPreviewViewer(preferredViewerId);
  }

  const firstAllowedViewer = previewViewers.find((viewer) =>
    canPreviewViewer(view, viewer.id),
  );

  return firstAllowedViewer ?? previewViewers[0];
}

export function canPreviewLayout(view, layoutId) {
  return view.allowedLayouts.includes(layoutId);
}

export function canPreviewViewer(view, viewerId) {
  return canViewerAccess(view.allowedViewers, viewerId);
}

const dynamicPreviewRoots = {
  productDetail: "/productos",
  orderDetail: "/cuenta/pedidos",
  orderConfirmation: "/pedido-confirmado",
  internalOrderDetail: "/interno/pedidos",
};

export function getViewIdFromPath(pathname) {
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const exactMatch = previewViews.find(
    (view) => view.path.replace(/\/$/, "") === normalizedPath,
  );

  if (exactMatch) {
    return exactMatch.id;
  }

  const dynamicMatch = Object.entries(dynamicPreviewRoots)
    .filter(([, routeRoot]) => normalizedPath.startsWith(`${routeRoot}/`))
    .sort(([, leftRoot], [, rightRoot]) => rightRoot.length - leftRoot.length)[0];

  return dynamicMatch?.[0];
}

export function getPreviewPath(viewId, layoutId, viewerId, routeLocation = null) {
  const view = getPreviewView(viewId);
  const params = new URLSearchParams({
    layout: layoutId,
    view: view.id,
    viewer: viewerId,
    route: routeLocation || view.path,
  });

  return `/dev/preview?${params.toString()}`;
}
