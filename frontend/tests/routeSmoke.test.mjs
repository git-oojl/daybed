import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.DAYBED_SMOKE_BASE_URL;

async function resolveSmokeProduct() {
  const response = await fetch(new URL("/api/catalog/products/?in_stock=true&page_size=1", baseUrl));
  assert.equal(response.ok, true, "Smoke test could not resolve a product from the backend.");
  const payload = await response.json();
  const product = payload?.results?.[0];
  assert.ok(product?.id, "Smoke test did not find any in-stock product.");
  assert.ok(product?.name, "Smoke product is missing a name.");
  return product;
}

test("direct routes populate #root without uncaught page errors", async (t) => {
  if (!baseUrl) {
    t.skip("Set DAYBED_SMOKE_BASE_URL after starting Vite to run browser smoke tests.");
    return;
  }

  const smokeProduct = await resolveSmokeProduct();
  const routes = [
    { path: "/", selector: ".home-category", count: 4 },
    { path: "/catalogo/" },
    { path: `/productos/${smokeProduct.id}`, text: smokeProduct.name },
    { path: "/login" },
    { path: "/cuenta/perfil" },
    { path: "/carrito" },
    { path: "/checkout" },
    { path: "/cuenta/pedidos" },
    { path: "/admin/configuracion" },
    { path: "/admin/roles-permisos" },
    { path: "/dev/preview?view=home&layout=public&viewer=guest", selector: ".home-category", count: 4 },
    {
      path: "/dev/preview?view=productDetail&layout=public&viewer=guest&route=%2Fproductos%2F1",
      text: "Daybed Roble Nórdico",
      absentText: "No encontramos esta pieza",
    },
    {
      path: "/dev/preview?view=orderDetail&layout=customer&viewer=customer&route=%2Fcuenta%2Fpedidos%2FDAY-00803",
      text: "PEDIDO DAY-00803",
    },
    {
      path: "/dev/preview?view=internalOrderDetail&layout=backOffice&viewer=employee&route=%2Finterno%2Fpedidos%2FDAY-00802",
      text: "PEDIDO DAY-00802",
    },
  ];

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
    for (const routeCase of routes) {
      const { path: route, text, absentText, selector, count } = routeCase;
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
        if (text) {
          await page.locator("#root").getByText(text, { exact: false }).first().waitFor({ timeout: 7000 });
        } else if (selector) {
          await page.locator(selector).first().waitFor({ timeout: 7000 });
        } else {
          await page.waitForTimeout(750);
        }

        const rootText = (await page.locator("#root").innerText()).trim();
        assert.ok(rootText.length > 0, `${route} left #root empty`);
        assert.doesNotMatch(rootText, /Esta vista no pudo abrirse/);
        if (absentText) assert.ok(!rootText.includes(absentText), `${route} rendered ${absentText}`);
        if (selector && Number.isInteger(count)) {
          assert.equal(await page.locator(selector).count(), count, `${route} expected ${count} ${selector} elements`);
        }
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


test("preview catalogue keeps listing detail inside the simulated route", async (t) => {
  if (!baseUrl) {
    t.skip("Set DAYBED_SMOKE_BASE_URL after starting Vite to run browser smoke tests.");
    return;
  }

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-gpu", "--disable-gpu-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    const consoleErrors = [];
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
      await browserRoute.abort("blockedbyclient");
    });

    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(
      new URL("/dev/preview?view=catalog&layout=public&viewer=guest&route=%2Fcatalogo", baseUrl).href,
      { waitUntil: "domcontentloaded", timeout: 15000 },
    );
    const detailLink = page.getByRole("link", { name: "Ver detalle" }).first();
    await detailLink.waitFor({ timeout: 7000 });
    await detailLink.click();
    await page.waitForURL(/\/dev\/preview\?/, { timeout: 7000 });
    await page.getByText("Daybed Roble Nórdico", { exact: false }).first().waitFor({ timeout: 7000 });

    const url = new URL(page.url());
    const rootText = await page.locator("#root").innerText();
    assert.equal(url.pathname, "/dev/preview");
    assert.equal(url.searchParams.get("view"), "productDetail");
    assert.equal(url.searchParams.get("route"), "/productos/1");
    assert.doesNotMatch(rootText, /No encontramos esta pieza/);
    assert.doesNotMatch(rootText, /can't access property/i);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
  } finally {
    await browser.close();
  }
});
