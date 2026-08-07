# Daybed frontend boot reliability

This document is the required response to a blank or permanently loading Vite/React screen.

## Containment implemented

- `main.jsx` loads `App.jsx` through `React.lazy`, so a rejected application import reaches `AppErrorBoundary` instead of emptying `#root`.
- `index.html` contains a small static Daybed boot card. If the entry module itself cannot execute, the browser still shows a useful state rather than a white page.
- `AppErrorBoundary` offers **Volver a Inicio**, **Recargar página**, preview-state cleanup and development-only technical details.
- Normal routes and preview routes use visible `Suspense` fallbacks.
- The preview registry stores page/layout modules behind `lazy(() => import(...))`; a broken page no longer enters the startup import graph.
- The backend health check has a 3-second timeout and never determines whether route children may render.
- Axios requests have a finite timeout, so authentication/bootstrap work cannot remain pending forever.
- Vite `vite:preloadError` receives one automatic reload attempt for stale deployed chunks. A second failure is left visible to the error boundary instead of looping.
- `useStoreSettings` supports both named and default imports to prevent another import-contract mismatch.
- Font Awesome package imports are checked by a test against the actual installed `react-icons` exports.

## Required local validation

Install dependencies, then run:

```bash
npm run lint
npm run build
npm test
```

Or run the combined gate:

```bash
npm run validate
```

A successful JSX parse is not a substitute for `npm run build`. Vite/Rollup must verify local exports, package exports and dynamic imports.

## Browser route smoke test

Start Django and Vite, install Playwright if it is not already available, then run:

```bash
DAYBED_SMOKE_BASE_URL=http://localhost:5173 npm run test:smoke
```

On PowerShell:

```powershell
$env:DAYBED_SMOKE_BASE_URL="http://localhost:5173"
npm run test:smoke
```

The smoke suite opens the homepage, catalogue, product detail, login, account, checkout, admin and preview routes directly. It fails on an empty `#root`, an uncaught page error, a console error or the root recovery screen.

## Blank-screen troubleshooting order

1. Open the browser console and use the **first** red error.
2. Inspect failed JavaScript/chunk requests in Network.
3. Inspect `#root`:
   - empty means boot/static-import failure;
   - loading forever means unresolved initialization;
   - populated but invisible means CSS/overlay/layout.
4. Read the Vite terminal.
5. Run `npm run build`.
6. For package names, inspect the exports from the installed version rather than relying on memory or unrelated documentation.
7. If the error URL contains `node_modules/.vite/deps`, stop Vite and clear its optimized cache:

```bash
rm -rf node_modules/.vite
npm run dev
```

PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

## Environment changes

After changing `VITE_*`, restart Vite. After changing Django or OpenRouteService environment variables, restart Django. Missing or stale external-routing configuration must remain a delivery-feature error; it must never control frontend boot or authentication.
