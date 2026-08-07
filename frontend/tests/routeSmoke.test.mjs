import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.DAYBED_SMOKE_BASE_URL;
const routes = [
  "/",
  "/catalogo/",
  "/productos/1",
  "/login",
  "/cuenta/perfil",
  "/carrito",
  "/checkout",
  "/cuenta/pedidos",
  "/admin/configuracion",
  "/admin/roles-permisos",
  "/dev/preview?view=home&layout=public&viewer=guest",
];

test("direct routes populate #root without uncaught page errors", async (t) => {
  if (!baseUrl) {
    t.skip("Set DAYBED_SMOKE_BASE_URL after starting Vite to run browser smoke tests.");
    return;
  }

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (error) {
    throw new Error(
      "DAYBED_SMOKE_BASE_URL is set, but Playwright is unavailable. Install Playwright before running test:smoke.",
      { cause: error },
    );
  }

  const launchOptions = {
    headless: true,
    args: ["--disable-gpu", "--disable-gpu-sandbox", "--disable-dev-shm-usage"],
  };
  let browser;
  let launchError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      browser = await chromium.launch(launchOptions);
      break;
    } catch (error) {
      launchError = error;
      if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
  if (!browser) throw launchError;
  try {
    for (const route of routes) {
      await t.test(route, async () => {
        const page = await browser.newPage();
        const pageErrors = [];
        const consoleErrors = [];
        const unexpectedExternalRequests = [];
        const transparentPng = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        );

        await page.route("**/*", async (browserRoute) => {
          const request = browserRoute.request();
          const url = new URL(request.url());
          if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
            await browserRoute.continue();
            return;
          }
          if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
            await browserRoute.fulfill({ status: 200, contentType: "text/css", body: "" });
            return;
          }
          if (url.hostname === "images.unsplash.com") {
            await browserRoute.fulfill({ status: 200, contentType: "image/png", body: transparentPng });
            return;
          }
          if (url.hostname === "www.openstreetmap.org") {
            await browserRoute.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>offline map placeholder</title>" });
            return;
          }
          unexpectedExternalRequests.push(request.url());
          await browserRoute.abort("blockedbyclient");
        });

        page.on("pageerror", (error) => pageErrors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });

        await page.goto(new URL(route, baseUrl).href, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await page.waitForTimeout(750);

        const rootText = (await page.locator("#root").innerText()).trim();
        assert.ok(rootText.length > 0, `${route} left #root empty`);
        assert.doesNotMatch(rootText, /Esta vista no pudo abrirse/);
        assert.deepEqual(pageErrors, [], `${route} emitted page errors`);
        assert.deepEqual(consoleErrors, [], `${route} emitted console errors`);
        assert.deepEqual(
          unexpectedExternalRequests,
          [],
          `${route} attempted unexpected external requests`,
        );
        await page.close();
      });
    }
  } finally {
    await browser.close();
  }
});
