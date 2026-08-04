# Daybed structural polish pass

This revision turns the remaining disconnected screens into one coherent furniture store and gives public, account and operational flows the same visual language.

## Storefront and shared shell

- Unified the header and footer typography across every route, including `/catalogo/`, and centered the primary navigation.
- Standardized all remaining public and back-office banners on the compact image-backed `PageHero` treatment used by Tienda and Mis pedidos.
- Moved catalogue sorting into the left merchandising rail and retained a wider product grid.
- Reused one `StoreProductCard` component in the home page, catalogue and related-product section, including detail, cart and saved-item actions.
- Enforced consistent product-image cropping so mixed source dimensions do not shift card layouts.
- Added subtle card motion and a horizontally moving, reduced-motion-aware `#ViveDaybed` gallery.
- Added tinted/boxed footer columns and preserved the warm beige, stone and brown visual system.
- Optimized the local login and registration backgrounds from JPEG to WebP and retained tinted overlays, styled registration scrolling and contextual back links.

## Checkout, maps and customer orders

- Replaced editable account name/email fields at checkout with a read-only signed-in account summary; only delivery-specific contact and address data remains editable.
- Made OpenStreetMap visible on the public showroom/contact page, checkout after address validation, store settings and internal order details.
- Rebuilt Mis pedidos as searchable, filterable order cards with product previews, delivery facts, totals, payment/status labels and dedicated detail links.
- Rebuilt customer and checkout loading, empty and failure states as designed destinations rather than raw warnings.
- Preserved the five-stage customer tracking view and a separate cancelled state.

## Operations and administration

- Rebuilt the customer-order queue and implemented a full internal order detail page with customer contact, product imagery/SKUs, payment controls, totals, delivery map, route facts and status progression.
- Renamed and clarified operational destinations: Productos internos, Colecciones y atributos, Pedidos de clientes and Accesos del equipo.
- Expanded product administration beyond stock quantities to include SKU, minimum stock, status, descriptions, materials, color, style, dimensions, weight, imagery and flexible specifications.
- Reframed categories as store collections with collection-specific attributes and descriptions.
- Replaced role-wide permission toggles with per-employee access settings and a reusable employee default; administrator accounts are protected from demotion, deactivation and deletion.
- Made business metric date filters drive real backend query ranges and removed fake fallback datasets.
- Separated customer self-service accounts from internal-user management.

## Preview, reviews and support states

- Unified preview and authenticated session reads so profile, cart, checkout, orders, reviews and operational screens all honor the selected preview role.
- Added preview fixtures and writable local behavior for the redesigned orders, collections, metrics and employee-access screens.
- Retained database-backed seeded reviews, aggregate ratings and verified-purchase labels.
- Rebuilt all support views and shared loading, empty, success and error components with the same Daybed visual system.
- Made the developer switcher remember whether it was collapsed.

## Validation performed

- Parsed all 75 frontend JavaScript/JSX files successfully.
- Detected no unresolved relative imports or unused frontend imports.
- Parsed all 22 frontend stylesheets successfully.
- Compiled the backend Python source tree successfully.
- Added backend coverage for review behavior, metric ranges, per-employee permission overrides and protected administrator accounts.

A full Vite build and Django runtime test suite could not be executed in the provided environment: the configured frontend package mirror does not resolve every pinned dependency, and the installed Python version is 3.13 while the backend declares Python 3.12 support. The returned archive excludes partial dependencies, generated caches and build output.
