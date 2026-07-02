import {
  accessGroups,
  canViewerAccess,
  getPreviewViewer,
  previewViewers,
} from "../auth/viewerAccess.js";
import AdminLayout from "../layouts/AdminLayout.jsx";
import BackOfficeLayout from "../layouts/BackOfficeLayout.jsx";
import CheckoutLayout from "../layouts/CheckoutLayout.jsx";
import CustomerLayout from "../layouts/CustomerLayout.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import SupportLayout from "../layouts/SupportLayout.jsx";
import LoginPage from "../pages/account/LoginPage.jsx";
import MyOrdersPage from "../pages/account/MyOrdersPage.jsx";
import OrderDetailPage from "../pages/account/OrderDetailPage.jsx";
import ProfilePage from "../pages/account/ProfilePage.jsx";
import RegisterPage from "../pages/account/RegisterPage.jsx";
import BasicSettingsPage from "../pages/admin/BasicSettingsPage.jsx";
import BusinessMetricsPage from "../pages/admin/BusinessMetricsPage.jsx";
import InternalUsersPage from "../pages/admin/InternalUsersPage.jsx";
import RolesPermissionsPage from "../pages/admin/RolesPermissionsPage.jsx";
import CategoriesPage from "../pages/back-office/CategoriesPage.jsx";
import DashboardPage from "../pages/back-office/DashboardPage.jsx";
import InternalOrderDetailPage from "../pages/back-office/InternalOrderDetailPage.jsx";
import InternalOrdersPage from "../pages/back-office/InternalOrdersPage.jsx";
import InventoryPage from "../pages/back-office/InventoryPage.jsx";
import ProductsPage from "../pages/back-office/ProductsPage.jsx";
import CartPage from "../pages/checkout/CartPage.jsx";
import CheckoutSummaryPage from "../pages/checkout/CheckoutSummaryPage.jsx";
import OrderConfirmationPage from "../pages/checkout/OrderConfirmationPage.jsx";
import CatalogPage from "../pages/public/CatalogPage.jsx";
import ContactHelpPage from "../pages/public/ContactHelpPage.jsx";
import HomePage from "../pages/public/HomePage.jsx";
import ProductDetailPage from "../pages/public/ProductDetailPage.jsx";
import EmptyStatesPage from "../pages/support/EmptyStatesPage.jsx";
import FeedbackMessagesPage from "../pages/support/FeedbackMessagesPage.jsx";
import LoadingStatesPage from "../pages/support/LoadingStatesPage.jsx";
import NotFoundPage from "../pages/support/NotFoundPage.jsx";
import UnauthorizedPage from "../pages/support/UnauthorizedPage.jsx";

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
    path: "/productos/demo-producto",
    defaultLayout: "public",
    allowedLayouts: ["public"],
    allowedViewers: accessGroups.publicStore,
    filePath: "frontend/src/pages/public/ProductDetailPage.jsx",
    Component: ProductDetailPage,
  },
  {
    id: "contactHelp",
    label: "Contacto / Ayuda",
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
    allowedViewers: accessGroups.guestOnly,
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
    allowedViewers: accessGroups.customerAccount,
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
    allowedViewers: accessGroups.customerAccount,
    filePath: "frontend/src/pages/account/MyOrdersPage.jsx",
    Component: MyOrdersPage,
  },
  {
    id: "orderDetail",
    label: "Detalle de pedido",
    group: "Cuenta del cliente",
    path: "/cuenta/pedidos/demo-pedido",
    defaultLayout: "customer",
    allowedLayouts: ["customer"],
    allowedViewers: accessGroups.customerAccount,
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
    path: "/pedido-confirmado/demo-pedido",
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
    label: "Productos",
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
    label: "Categorías",
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
    label: "Pedidos internos",
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
    label: "Detalle de pedido interno",
    group: "Back-office",
    path: "/interno/pedidos/demo-pedido",
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
    label: "Roles y permisos",
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
    label: "Mensajes de error y éxito",
    group: "Vistas de soporte",
    path: "/soporte/mensajes",
    defaultLayout: "support",
    allowedLayouts: ["support"],
    allowedViewers: accessGroups.support,
    filePath: "frontend/src/pages/support/FeedbackMessagesPage.jsx",
    Component: FeedbackMessagesPage,
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

export function canPreviewLayout(view, layoutId) {
  return view.allowedLayouts.includes(layoutId);
}

export function canPreviewViewer(view, viewerId) {
  return canViewerAccess(view.allowedViewers, viewerId);
}
