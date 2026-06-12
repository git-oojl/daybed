# Frontend view skeletons

These files are intentionally minimal. They define route-level React views and semantic sections only. No UI design, styling, or CSS decisions were added.

## Routing entry points

- `frontend/src/App.jsx` loads the route tree.
- `frontend/src/routes/AppRoutes.jsx` defines public, customer, checkout, back-office, admin, and support routes.
- `frontend/src/routes/routePaths.js` keeps route paths in one place.
- `frontend/src/routes/ProtectedRoute.jsx` is a placeholder for future auth and role checks.

## Layout placeholders

- `frontend/src/layouts/PublicLayout.jsx`
- `frontend/src/layouts/CustomerLayout.jsx`
- `frontend/src/layouts/CheckoutLayout.jsx`
- `frontend/src/layouts/BackOfficeLayout.jsx`
- `frontend/src/layouts/AdminLayout.jsx`
- `frontend/src/layouts/SupportLayout.jsx`

Each layout currently renders only `<Outlet />` so frontend developers can add navigation, guards, wrappers, or shared layout later.

## View folders

- Public site: `frontend/src/pages/public/`
- Customer account: `frontend/src/pages/account/`
- Purchase flow: `frontend/src/pages/checkout/`
- Back-office: `frontend/src/pages/back-office/`
- Administration: `frontend/src/pages/admin/`
- Support views: `frontend/src/pages/support/`

## Support components

- `frontend/src/components/support/LoadingState.jsx`
- `frontend/src/components/support/EmptyState.jsx`
- `frontend/src/components/support/ErrorMessage.jsx`
- `frontend/src/components/support/SuccessMessage.jsx`

These are minimal reusable placeholders and can be replaced or expanded later.

## Notes

- `frontend/src/App.css` and `frontend/src/index.css` were cleared to avoid adding visual design.
- The original Vite starter screen was replaced by route-based view skeletons.
- Build and lint passed after installing dependencies locally for validation.
