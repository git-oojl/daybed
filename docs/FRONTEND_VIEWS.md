# Frontend view skeletons

These files are intentionally minimal. They define route-level React views and semantic sections only. No UI design, styling, or CSS decisions were added to production views.

## Routing entry points

- `frontend/src/App.jsx` loads the route tree.
- `frontend/src/routes/AppRoutes.jsx` defines public, customer, checkout, back-office, admin, and support routes.
- `frontend/src/routes/routePaths.js` keeps route paths in one place.
- `frontend/src/routes/ProtectedRoute.jsx` is a placeholder for future auth and role checks.
- `frontend/src/auth/viewerAccess.js` documents the expected viewer/session profiles used by the real route skeleton and dev preview helper.

## Viewer/session profiles

The skeleton now separates **layout compatibility** from **viewer access**.

Previewable viewer profiles live in `frontend/src/auth/viewerAccess.js`:

- `guest`: visitor without a session.
- `customer`: logged-in customer.
- `employee`: internal staff user.
- `admin`: internal administrator.

Access groups are intentionally explicit:

- Public store views: `guest`, `customer`, `employee`, `admin`.
- Login and register views: `guest` only.
- Customer account views: `customer`, `admin`.
- Checkout flow: `guest`, `customer`, `admin`.
- Back-office views: `employee`, `admin`.
- Admin views: `admin` only.
- Support views: all profiles.

These are project assumptions, not final backend authorization. Update them when the team confirms the real access rules.

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

## Development view preview helper

A dev-only preview helper was added for frontend work:

- `frontend/src/dev-preview/DevViewSwitcher.jsx`
- `frontend/src/dev-preview/DevViewSwitcher.css`
- `frontend/src/dev-preview/DevPreviewPage.jsx`
- `frontend/src/dev-preview/PreviewSessionProvider.jsx`
- `frontend/src/dev-preview/viewPreviewRegistry.jsx`

When running `npm run dev`, a fixed corner panel appears with selectors for view, layout, and viewer profile. Selecting a combination opens `/dev/preview?view=<viewId>&layout=<layoutId>&viewer=<viewerId>`.

The helper is intentionally styled so developers can find it quickly. This is the only styling added, and it is scoped to `.dev-view-switcher` classes.

Invalid combinations are not rendered. Instead, `/dev/preview` shows a blocked preview message. A preview can be blocked for either of these reasons:

- The view is not allowed in the chosen layout.
- The simulated viewer does not have access to the chosen view.

Edit `allowedLayouts` and `allowedViewers` in `viewPreviewRegistry.jsx` when the team intentionally allows a view to be previewed in additional situations.

Each preview view also includes a `filePath` value. The switcher displays that repository path at the bottom of the panel so developers can jump from the preview to the matching source file quickly.

`usePreviewSession.js` exposes a small `usePreviewSession()` hook for frontend developers who want a page or layout to react to the simulated viewer while working in `/dev/preview`.

The helper is guarded with `import.meta.env.DEV`, so it is not rendered in production builds.
