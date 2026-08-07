# Daybed — final reliability and customer-experience pass

This revision completes the substantial reliability pass for Daybed as **one furniture store operated by one company**. Customers buy from Daybed, employees operate the shared business, and administrators configure the same global storefront. No seller, marketplace, or employee-owned store model was introduced.

## Blank-screen boot-chain hardening

- Corrected the exact store-settings import contract: `useStoreSettings` now has both a named and default export, so existing callers cannot fail the module graph by choosing the other style.
- Converted every preview page and preview layout in `viewPreviewRegistry.jsx` from eager imports to route-level `React.lazy()` imports. A broken catalogue, checkout or admin module can no longer poison unrelated routes at startup.
- Removed the health-check branch that returned `null`. The public route tree renders immediately while the backend check runs independently with a hard 3-second timeout.
- Replaced invisible route/preview Suspense fallbacks with the shared Daybed loading treatment. The development bridge renders the real route tree while its helper module loads.
- Added a root `AppErrorBoundary` with visible recovery actions, preview-state cleanup and development-only diagnostics. `App.jsx` itself is lazy-loaded so rejected application imports can reach that boundary.
- Added a static boot card inside `index.html`, preventing a completely white document even when the entry module cannot mount React.
- Added one-time Vite stale-chunk recovery through `vite:preloadError`; repeated failures fall through to visible recovery instead of reloading forever.
- Corrected incompatible `react-icons/fa6` imports in catalogue/collection views and added an installed-package export regression test.
- Added finite API-client timeouts so a stalled backend request cannot leave initialization pending indefinitely.
- Added source-contract, health-check, lazy-preview, root-recovery, package-export and direct-route smoke tests plus `npm run validate`.

## Attached-archive audit corrections

The final attached archive was audited again rather than accepted at face value. That verification closed several cross-layer gaps that static feature presence alone did not reveal:

- Customer order responses now use a dedicated safe representation. Internal notes, employee identities, raw payment snapshots, routing-provider fields and stock-operation timestamps remain available only to authorized staff endpoints.
- Checkout now detects a cart that changes between validation and transaction creation. It locks the cart, items and products, compares a stable signature, rechecks category/product availability and reserves stock only for the exact validated selection.
- All access-token renewal paths use the same single-flight coordinator; account replacement and preview transitions invalidate stale responses so an older identity cannot repopulate user or settings state.
- Errors thrown by preview mutations are converted to typed feature-local validation errors instead of being mistaken for network or authentication failures.
- Preview product sorting now honors compound order expressions, and temporary stock reservation/release follows the same terminal-order rules as the backend.
- Customer order detail refreshes on order events and window focus without blanking the existing record, so status updates appear without a destructive reload.
- Login and registration preserve the intended return route, profile-avatar failures recover when the source changes, and the default map coordinates match the shared Daybed showroom settings.
- Backend password validation now matches the eight-character requirement shown by the customer forms.

## Authentication, API reliability and session replacement

- Added a centralized API error taxonomy for expired authentication, permission denial, missing resources, validation failures, unavailable external routing, network loss, cancelled requests and unexpected server failures.
- Added a single-flight access-token refresh coordinator so concurrent `401` responses share one refresh request instead of creating refresh storms.
- Limited refresh to one retry per request and excluded login, logout and refresh endpoints from recursive renewal.
- Invalid refresh tokens now clear access, refresh and cached user data, cancel stale requests and emit one friendly session-expired redirect.
- Account replacement now clears the previous local session before login and uses request generations plus cancellation signals so responses from an earlier account cannot overwrite the new account.
- Preview mode strips authorization headers and resolves requests from session-local fixtures instead of accidentally calling protected backend endpoints with preview identities.
- Entering or leaving preview emits a session-replacement event, clears incompatible request/cache state and resets preview mutations when normal mode is restored.
- Global Daybed settings use the same session-generation protection so a delayed response from a previous identity or mode cannot repopulate stale state.
- Raw JWT/backend messages are normalized before reaching customer-facing screens.

## Preview-mode stability

- Preview identities exist for customer, employee and administrator roles, each with a stable avatar and believable account data.
- Preview state is stored only in browser `sessionStorage` and supports temporary cart changes, saved products, checkout, distinct customer/internal orders, status transitions, filters, metrics ranges, profile updates, collections, products and employee access changes.
- Preview customer orders such as `DAY-00801` and `DAY-00803` open as separate records; internal management also exposes distinct records such as `DAY-00801` and `DAY-00802`.
- Exiting preview resets the temporary fixture store and restores normal route/request behavior without retaining preview credentials.
- The effective-session hook exposes the same `setUser`, logout and identity contract in preview and normal mode, removing the former `setUser is not a function` failure.

## Order identity, stock integrity and status transitions

- Every order has its own `DAY-` code, products, customer snapshot, delivery data, payment state, notes and status history.
- Exact order lookup accepts either the numeric database ID or the public `DAY-00801`-style code without falling back to a generic fixture.
- Added persisted status-history records and legal transition rules. Delivered and cancelled orders are terminal, repeated transitions are rejected, and invalid actions are disabled before submission.
- Successful internal status changes update the detail view immediately and broadcast an order-change event so customer and management lists reload without losing their active filter.
- Checkout reserves stock inside the same database transaction that creates the order. Product rows are locked and revalidated, so stale frontend availability cannot oversell inventory.
- Cancelling an eligible order releases its reserved stock. Repeated cancellation cannot release stock twice.
- Sold-out and insufficient-stock behavior is consistent across home, catalogue, related products, saved items, product detail, cart controls, preview checkout and backend order creation.

## Customer and internal order details

- Rebuilt the customer order detail as a clear summary with order code/date, progress tracker, item imagery, options, quantity, unit/line totals, address, payment, subtotal, shipping, discounts, total, delivery notes, support and cancellation context.
- Customer order maps show the saved destination when coordinates exist and a designed location fallback when they do not. Routing-provider implementation names are never shown to customers.
- Rebuilt the employee/administrator detail around the same underlying order, adding customer contact, product administration links, payment and shipping states, route summary, internal notes, history and only the next valid actions.
- Rebuilt Mis pedidos and the internal order queue as scannable cards rather than nested expandable tables.

## Checkout, delivery and OpenStreetMap

- Checkout account identity is read-only; customers edit delivery-specific contact/address information instead of changing the name and email tied to their account.
- Address input uses structured Mexican fields, whitespace/punctuation normalization and accent-insensitive candidate matching. Ambiguous results are presented for explicit selection and can be corrected without losing the cart.
- Geocoding and route calculation are handled as separate outcomes. A routing timeout, missing key or rejected route cannot clear authentication, destroy the cart or break unrelated pages.
- When coordinates are available but routing is not, checkout preserves the selected destination and OpenStreetMap marker, explains that delivery-cost calculation is temporarily unavailable, and blocks only final submission until a safe price can be calculated.
- OpenStreetMap is used where location adds context: showroom/contact, checkout destination, customer order detail, internal order detail and global Daybed settings.
- Shipping uses the global base fee, per-kilometre rate, maximum radius and free-shipping threshold configured by administrators.

## Navbar, avatars and customer shell

- The desktop header uses three stable grid regions: Daybed identity at left, primary navigation in the center and search/saved/cart/account controls at right.
- Responsive constraints prevent the centered navigation from colliding with actions at desktop, laptop, narrow desktop/tablet and mobile widths.
- Search remains integrated into the header at normal desktop widths.
- Added optional profile-image upload through the existing backend media system for customers, employees and administrators.
- Navbar/profile avatars use safe cropping, initials fallbacks and broken-image recovery. Preview identities have stable local avatars.
- Compact image banners remain the shared page system; customer screens retain the warm Daybed palette and consistent spacing.

## Catalogue, collections and featured merchandising

- Homepage collection links now navigate to meaningful catalogue URL filters and activate visible removable filter chips.
- Catalogue filters support collection, room, furniture type, material, color, style, price, availability, rating, storage, sofa-bed functionality and featured state; sorting remains compatible and query parameters survive refresh.
- Preview fixtures implement the same query parameters instead of returning an unfiltered catalogue.
- Internal product and inventory filters now alter actual results; decorative/nonfunctional controls were removed or connected.
- Rebuilt collection administration as a searchable, compact manager with slug, product count, active state, display order, homepage visibility, filter attributes and optional imagery.
- Added product `featured` state and featured order. Administrators can deliberately select up to four active products for the homepage.
- When no products are manually featured, the homepage deterministically prefers active in-stock products by rating and recency rather than randomizing.
- Shared product cards retain Ver detalle, Agregar al carrito and Guardar/quitar de favoritos actions across home, catalogue and related-product sections.

## One-company Daybed administration

- Renamed and reframed settings as global **Configuración de Daybed / Negocio y tienda online**.
- Only administrators can change the shared business identity, public contact details, showroom address/coordinates, shipping rules, currency display, cancellation window, low-stock default, preparation estimate, announcement, social links and storefront availability.
- Employees operate products, inventory and orders according to assigned permissions; they do not own or configure separate stores.
- Storefront availability, announcements, cart estimates, shipping thresholds, delivery radius, preparation guidance and support/contact details have visible operational effects elsewhere in the application.
- Categories are treated as shared Daybed collections, and products/inventory/orders all belong to the same business.

## Fallbacks, support states and motion

- Replaced raw backend strings, destructive generic failures, blank states and broken-image/map states with localized feature-level fallbacks and the correct next action.
- Authentication expiry returns to login; missing products return to Tienda; invalid customer orders return to Mis pedidos; delivery-service failures remain inside checkout; empty saved/order states direct customers to the catalogue.
- Loading, empty, error, confirmation, profile, cart, checkout, saved items and order pages share the same Daybed support-state language.
- Added restrained product-card, favorite, cart-feedback, page-section, hero and Vive Daybed motion without delaying interaction or causing layout shifts.
- Motion is disabled or reduced through `prefers-reduced-motion` rules.

## Database and test changes

- Added migrations for optional user avatars, merchandising/collection fields, order integrity/status history, the global Daybed settings singleton and contact requests.
- Added or updated backend tests around authentication/session endpoints, order identity, legal transitions, stock reservation/release, sold-out checkout, routing failures, filters, featured limits, collections, settings and avatars.
- Added executable frontend unit tests for single-flight refresh behavior, failed-refresh cleanup, stale refresh reset, delivery-versus-auth classification, invalid-JWT classification and feature-local validation errors.
- Updated sample-data seeding so each order receives its own clean status history and customer-facing payment references do not use prototype wording.

## Validation completed in this environment

- Parsed **83** frontend application JavaScript/JSX/TypeScript files with zero syntax diagnostics; all `.mjs` tests also executed through Node’s test runner.
- Resolved every relative frontend import; zero missing relative imports were found.
- Parsed **22** frontend stylesheets with zero structural errors.
- Compiled the full backend Python source and test tree successfully.
- Ran the available frontend suite: **11 tests passed, 0 failed, 2 skipped**. The installed-package export test and browser route smoke test intentionally skip when dependencies/server are unavailable.
- Audited customer-facing source for raw JWT strings, routing-provider names, marketplace/seller terminology and generic `Reintentar` walls.

## Environment limitations

A full Vite production build and Django/pytest runtime suite could not be executed in the provided container. The available Python interpreter is 3.13 while the backend explicitly targets Python `>=3.12,<3.13`, and the configured package mirrors do not provide every pinned frontend/backend dependency. Static parsing, import validation, Python compilation and the dependency-free Node tests above are real completed checks; they are not substitutes for running the application with its supported dependencies.

After adding or changing `OPENROUTESERVICE_API_KEY` or any other backend environment value, restart the Django process. After changing a `VITE_*` value, restart Vite. A missing, stale or invalid routing key is handled as a checkout delivery-service failure and must not invalidate authentication or the cart.
