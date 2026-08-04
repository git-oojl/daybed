import { lazy, Suspense } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { accessGroups } from "../auth/viewerAccess.js";
import AdminLayout from "../layouts/AdminLayout.jsx";
import BackOfficeLayout from "../layouts/BackOfficeLayout.jsx";
import CheckoutLayout from "../layouts/CheckoutLayout.jsx";
import CustomerLayout from "../layouts/CustomerLayout.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import SupportLayout from "../layouts/SupportLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { routePaths } from "./routePaths.js";

const BasicSettingsPage = lazy(
  () => import("../pages/admin/BasicSettingsPage.jsx"),
);
const BusinessMetricsPage = lazy(
  () => import("../pages/admin/BusinessMetricsPage.jsx"),
);
const InternalUsersPage = lazy(
  () => import("../pages/admin/InternalUsersPage.jsx"),
);
const RolesPermissionsPage = lazy(
  () => import("../pages/admin/RolesPermissionsPage.jsx"),
);
const LoginPage = lazy(() => import("../pages/account/LoginPage.jsx"));
const ForgotPasswordPage = lazy(
  () => import("../pages/account/ForgotPasswordPage.jsx"),
);
const MyOrdersPage = lazy(() => import("../pages/account/MyOrdersPage.jsx"));
const OrderDetailPage = lazy(
  () => import("../pages/account/OrderDetailPage.jsx"),
);
const ProfilePage = lazy(() => import("../pages/account/ProfilePage.jsx"));
const RegisterPage = lazy(() => import("../pages/account/RegisterPage.jsx"));
const ResetPasswordPage = lazy(
  () => import("../pages/account/ResetPasswordPage.jsx"),
);
const DashboardPage = lazy(
  () => import("../pages/back-office/DashboardPage.jsx"),
);
const InternalOrderDetailPage = lazy(
  () => import("../pages/back-office/InternalOrderDetailPage.jsx"),
);
const InternalOrdersPage = lazy(
  () => import("../pages/back-office/InternalOrdersPage.jsx"),
);
const InventoryPage = lazy(
  () => import("../pages/back-office/InventoryPage.jsx"),
);
const ProductsPage = lazy(
  () => import("../pages/back-office/ProductsPage.jsx"),
);
const CategoriesPage = lazy(
  () => import("../pages/back-office/CategoriesPage.jsx"),
);
const CartPage = lazy(() => import("../pages/checkout/CartPage.jsx"));
const CheckoutSummaryPage = lazy(
  () => import("../pages/checkout/CheckoutSummaryPage.jsx"),
);
const OrderConfirmationPage = lazy(
  () => import("../pages/checkout/OrderConfirmationPage.jsx"),
);
const CatalogPage = lazy(() => import("../pages/public/CatalogPage.jsx"));
const ContactHelpPage = lazy(
  () => import("../pages/public/ContactHelpPage.jsx"),
);
const HomePage = lazy(() => import("../pages/public/HomePage.jsx"));
const ProductDetailPage = lazy(
  () => import("../pages/public/ProductDetailPage.jsx"),
);
const EmptyStatesPage = lazy(
  () => import("../pages/support/EmptyStatesPage.jsx"),
);
const FeedbackMessagesPage = lazy(
  () => import("../pages/support/FeedbackMessagesPage.jsx"),
);
const LoadingStatesPage = lazy(
  () => import("../pages/support/LoadingStatesPage.jsx"),
);
const NotFoundPage = lazy(() => import("../pages/support/NotFoundPage.jsx"));
const UnauthorizedPage = lazy(
  () => import("../pages/support/UnauthorizedPage.jsx"),
);

const DevPreviewPage = import.meta.env.DEV
  ? lazy(() => import("../dev-preview/DevPreviewPage.jsx"))
  : null;

const DevViewSwitcher = import.meta.env.DEV
  ? lazy(() => import("../dev-preview/DevViewSwitcher.jsx"))
  : null;

const DevPreviewRouteBridge = import.meta.env.DEV
  ? lazy(() => import("../dev-preview/DevPreviewRouteBridge.jsx"))
  : null;

function OperationalRoute({ permission, children }) {
  return (
    <ProtectedRoute
      allowedViewers={accessGroups.backOffice}
      requiredPermission={permission}
    >
      {children}
    </ProtectedRoute>
  );
}

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      Cargando...
    </div>
  );
}

function AppRoutes() {
  const showDevTools = import.meta.env.DEV;
  const routeTree = (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      {/* ============================================ */}
      {/* RUTAS PÚBLICAS - Acceso para TODOS */}
      {/* ============================================ */}
      <Route element={<PublicLayout />}>
        <Route path={routePaths.public.home} element={<HomePage />} />
        <Route path={routePaths.public.catalog} element={<CatalogPage />} />
        <Route
          path={routePaths.public.productDetail}
          element={<ProductDetailPage />}
        />
        <Route
          path={routePaths.public.contactHelp}
          element={<ContactHelpPage />}
        />
      </Route>

      {/* ============================================ */}
      {/* RUTAS DE CLIENTE / CUENTA */}
      {/* ============================================ */}
      <Route element={<CustomerLayout />}>
        <Route
          element={
            <ProtectedRoute allowedViewers={accessGroups.guestOnly}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={routePaths.account.login} element={<LoginPage />} />
          <Route path={routePaths.account.register} element={<RegisterPage />} />
          <Route
            path={routePaths.account.forgotPassword}
            element={<ForgotPasswordPage />}
          />
          <Route
            path={routePaths.account.resetPassword}
            element={<ResetPasswordPage />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedViewers={accessGroups.authenticated}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={routePaths.account.profile} element={<ProfilePage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedViewers={accessGroups.customerAccount}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path={routePaths.account.orders} element={<MyOrdersPage />} />
          <Route
            path={routePaths.account.orderDetail}
            element={<OrderDetailPage />}
          />
        </Route>
      </Route>

      {/* ============================================ */}
      {/* RUTAS DE CHECKOUT */}
      {/* ============================================ */}
      <Route
        element={
          <ProtectedRoute allowedViewers={accessGroups.checkout}>
            <CheckoutLayout />
          </ProtectedRoute>
        }
      >
        <Route path={routePaths.checkout.cart} element={<CartPage />} />
        <Route
          path={routePaths.checkout.summary}
          element={<CheckoutSummaryPage />}
        />
        <Route
          path={routePaths.checkout.confirmation}
          element={<OrderConfirmationPage />}
        />
        <Route
          path={routePaths.checkout.confirmationDetail}
          element={<OrderConfirmationPage />}
        />
      </Route>

      {/* ============================================ */}
      {/* RUTAS DE BACKOFFICE - Solo empleados y admins */}
      {/* ============================================ */}
      <Route
        element={
          <ProtectedRoute allowedViewers={accessGroups.backOffice}>
            <BackOfficeLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={routePaths.backOffice.dashboard}
          element={
            <OperationalRoute permission="dashboard.view">
              <DashboardPage />
            </OperationalRoute>
          }
        />
        <Route
          path={routePaths.backOffice.products}
          element={
            <OperationalRoute permission="products.view">
              <ProductsPage />
            </OperationalRoute>
          }
        />
        <Route
          path={routePaths.backOffice.categories}
          element={
            <OperationalRoute permission="products.view">
              <CategoriesPage />
            </OperationalRoute>
          }
        />
        <Route
          path={routePaths.backOffice.inventory}
          element={
            <OperationalRoute permission="inventory.view">
              <InventoryPage />
            </OperationalRoute>
          }
        />
        <Route
          path={routePaths.backOffice.orders}
          element={
            <OperationalRoute permission="orders.view">
              <InternalOrdersPage />
            </OperationalRoute>
          }
        />
        <Route
          path={routePaths.backOffice.orderDetail}
          element={
            <OperationalRoute permission="orders.view">
              <InternalOrderDetailPage />
            </OperationalRoute>
          }
        />
      </Route>

      {/* ============================================ */}
      {/* RUTAS DE ADMIN - Solo administradores */}
      {/* ============================================ */}
      <Route
        element={
          <ProtectedRoute allowedViewers={accessGroups.adminOnly}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={routePaths.admin.internalUsers}
          element={<InternalUsersPage />}
        />
        <Route
          path={routePaths.admin.rolesPermissions}
          element={<RolesPermissionsPage />}
        />
        <Route
          path={routePaths.admin.businessMetrics}
          element={<BusinessMetricsPage />}
        />
        <Route
          path={routePaths.admin.basicSettings}
          element={<BasicSettingsPage />}
        />
      </Route>

      {/* ============================================ */}
      {/* DEV TOOLS */}
      {/* ============================================ */}
      {showDevTools && DevPreviewPage ? (
        <Route
          path="/dev/preview"
          element={
            <Suspense fallback={null}>
              <DevPreviewPage />
            </Suspense>
          }
        />
      ) : null}

      {/* ============================================ */}
      {/* RUTAS DE SOPORTE */}
      {/* ============================================ */}
      <Route element={<SupportLayout />}>
        <Route
          path={routePaths.support.unauthorized}
          element={<UnauthorizedPage />}
        />
        <Route
          path={routePaths.support.loadingStates}
          element={<LoadingStatesPage />}
        />
        <Route
          path={routePaths.support.emptyStates}
          element={<EmptyStatesPage />}
        />
        <Route
          path={routePaths.support.feedbackMessages}
          element={<FeedbackMessagesPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      </Routes>
    </Suspense>
  );

  return (
    <BrowserRouter>
      {showDevTools && DevPreviewRouteBridge ? (
        <Suspense fallback={null}>
          <DevPreviewRouteBridge>{routeTree}</DevPreviewRouteBridge>
        </Suspense>
      ) : (
        routeTree
      )}
      {showDevTools && DevViewSwitcher ? (
        <Suspense fallback={null}>
          <DevViewSwitcher />
        </Suspense>
      ) : null}
    </BrowserRouter>
  );
  
}

export default AppRoutes;
