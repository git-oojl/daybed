import { lazy, Suspense } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { accessGroups } from "../auth/viewerAccess.js";
import AdminLayout from "../layouts/AdminLayout.jsx";
import BackOfficeLayout from "../layouts/BackOfficeLayout.jsx";
import CheckoutLayout from "../layouts/CheckoutLayout.jsx";
import CustomerLayout from "../layouts/CustomerLayout.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import SupportLayout from "../layouts/SupportLayout.jsx";
import BasicSettingsPage from "../pages/admin/BasicSettingsPage.jsx";
import BusinessMetricsPage from "../pages/admin/BusinessMetricsPage.jsx";
import InternalUsersPage from "../pages/admin/InternalUsersPage.jsx";
import RolesPermissionsPage from "../pages/admin/RolesPermissionsPage.jsx";
import LoginPage from "../pages/account/LoginPage.jsx";
import MyOrdersPage from "../pages/account/MyOrdersPage.jsx";
import OrderDetailPage from "../pages/account/OrderDetailPage.jsx";
import ProfilePage from "../pages/account/ProfilePage.jsx";
import RegisterPage from "../pages/account/RegisterPage.jsx";
import DashboardPage from "../pages/back-office/DashboardPage.jsx";
import InternalOrderDetailPage from "../pages/back-office/InternalOrderDetailPage.jsx";
import InternalOrdersPage from "../pages/back-office/InternalOrdersPage.jsx";
import InventoryPage from "../pages/back-office/InventoryPage.jsx";
import ProductsPage from "../pages/back-office/ProductsPage.jsx";
import CategoriesPage from "../pages/back-office/CategoriesPage.jsx";
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
import ProtectedRoute from "./ProtectedRoute.jsx";
import { routePaths } from "./routePaths.js";

const DevPreviewPage = import.meta.env.DEV
  ? lazy(() => import("../dev-preview/DevPreviewPage.jsx"))
  : null;

const DevViewSwitcher = import.meta.env.DEV
  ? lazy(() => import("../dev-preview/DevViewSwitcher.jsx"))
  : null;

function AppRoutes() {
  const showDevTools = import.meta.env.DEV;

  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================ */}
        {/* RUTAS PÚBLICAS - Acceso para TODOS */}
        {/* ============================================ */}
        <Route element={<PublicLayout />}>
          <Route path={routePaths.public.home} element={<HomePage />} />
          <Route path={routePaths.public.catalog} element={<CatalogPage />} />
          <Route path={routePaths.public.productDetail} element={<ProductDetailPage />} />
          <Route path={routePaths.public.contactHelp} element={<ContactHelpPage />} />
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
          </Route>
          
          <Route
            element={
              <ProtectedRoute allowedViewers={accessGroups.customerAccount}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path={routePaths.account.profile} element={<ProfilePage />} />
            <Route path={routePaths.account.orders} element={<MyOrdersPage />} />
            <Route path={routePaths.account.orderDetail} element={<OrderDetailPage />} />
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
          <Route path={routePaths.checkout.summary} element={<CheckoutSummaryPage />} />
          <Route path={routePaths.checkout.confirmation} element={<OrderConfirmationPage />} />
          <Route path={routePaths.checkout.confirmationDetail} element={<OrderConfirmationPage />} />
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
          <Route path={routePaths.backOffice.dashboard} element={<DashboardPage />} />
          <Route path={routePaths.backOffice.products} element={<ProductsPage />} />
          <Route path={routePaths.backOffice.categories} element={<CategoriesPage />} />
          <Route path={routePaths.backOffice.inventory} element={<InventoryPage />} />
          <Route path={routePaths.backOffice.orders} element={<InternalOrdersPage />} />
          <Route path={routePaths.backOffice.orderDetail} element={<InternalOrderDetailPage />} />
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
          <Route path={routePaths.admin.internalUsers} element={<InternalUsersPage />} />
          <Route path={routePaths.admin.rolesPermissions} element={<RolesPermissionsPage />} />
          <Route path={routePaths.admin.businessMetrics} element={<BusinessMetricsPage />} />
          <Route path={routePaths.admin.basicSettings} element={<BasicSettingsPage />} />
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
          <Route path={routePaths.support.unauthorized} element={<UnauthorizedPage />} />
          <Route path={routePaths.support.loadingStates} element={<LoadingStatesPage />} />
          <Route path={routePaths.support.emptyStates} element={<EmptyStatesPage />} />
          <Route path={routePaths.support.feedbackMessages} element={<FeedbackMessagesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      
      {showDevTools && DevViewSwitcher ? (
        <Suspense fallback={null}>
          <DevViewSwitcher />
        </Suspense>
      ) : null}
    </BrowserRouter>
  );
}

export default AppRoutes;