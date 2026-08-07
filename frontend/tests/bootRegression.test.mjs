import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("store settings hook supports named and default imports", async () => {
  const source = await read("src/services/useStoreSettings.js");
  assert.match(source, /export function useStoreSettings\s*\(/);
  assert.match(source, /export default useStoreSettings\s*;/);
});

test("development health checks never blank the route tree", async () => {
  const bridge = await read("src/dev-preview/DevPreviewRouteBridge.jsx");
  assert.doesNotMatch(
    bridge,
    /backendStatus\.state\s*===\s*["']checking["'][\s\S]{0,240}return null/,
  );

  const statusHook = await read("src/dev-preview/useBackendStatus.js");
  assert.match(statusHook, /HEALTH_TIMEOUT_MS\s*=\s*3000/);
  assert.match(statusHook, /controller\.abort\(["']health-check-timeout["']\)/);
});

test("preview registry lazy-loads page and layout modules", async () => {
  const registry = await read("src/dev-preview/viewPreviewRegistry.jsx");
  assert.doesNotMatch(
    registry,
    /^import\s+\w+\s+from\s+["']\.\.\/pages\//m,
  );
  assert.doesNotMatch(
    registry,
    /^import\s+\w+\s+from\s+["']\.\.\/layouts\//m,
  );
  assert.match(registry, /lazy\(\(\)\s*=>\s*import\(/);
});

test("application root has visible loading and render recovery", async () => {
  const main = await read("src/main.jsx");
  const routes = await read("src/routes/AppRoutes.jsx");
  const boundary = await read("src/components/support/AppErrorBoundary.jsx");
  const html = await read("index.html");

  assert.match(main, /const App = lazy\(\(\) => import\(["']\.\/App\.jsx["']\)\)/);
  assert.match(main, /<AppErrorBoundary>/);
  assert.match(main, /<RouteLoading/);
  assert.doesNotMatch(routes, /fallback=\{null\}/);
  assert.match(boundary, /Esta vista no pudo abrirse/);
  assert.match(boundary, /Volver a Inicio/);
  assert.match(html, /class=["']daybed-boot["']/);
});

test("known incompatible Font Awesome 5 names are not imported from fa6", async () => {
  const files = [
    "src/pages/public/CatalogPage.jsx",
    "src/pages/back-office/CategoriesPage.jsx",
  ];
  for (const file of files) {
    const source = await read(file);
    assert.doesNotMatch(
      source,
      /import\s*\{[^}]*\b(?:FaCheckCircle|FaExclamationTriangle|FaSearch)\b[^}]*\}\s*from\s*["']react-icons\/fa6["']/s,
      `${file} imports an incompatible icon name from react-icons/fa6`,
    );
  }
});
