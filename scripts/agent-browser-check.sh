#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

if [[ ! -d "$ROOT/frontend/node_modules/playwright" ]]; then
  echo "Playwright is not installed in frontend/node_modules. Run make bootstrap first." >&2
  exit 2
fi
if [[ ! -d "$PLAYWRIGHT_BROWSERS_DIR" ]]; then
  echo "Vendored Playwright browsers are missing: $PLAYWRIGHT_BROWSERS_DIR" >&2
  echo "Rebuild/upgrade the fat bundle on an internet-connected Debian x86_64 host." >&2
  exit 3
fi

(
  cd "$ROOT/frontend"
  node --input-type=module <<'NODE'
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

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

const screenshotPath = path.join(os.tmpdir(), `daybed-browser-check-${process.pid}.png`);
try {
  const page = await browser.newPage();
  await page.setContent('<main id="ok">daybed-browser-ok</main>');
  const text = await page.locator('#ok').innerText();
  if (text !== 'daybed-browser-ok') throw new Error(`Unexpected browser DOM text: ${text}`);
  await page.screenshot({ path: screenshotPath });
  console.log(`Playwright Chromium OK: ${browser.version()}`);
} finally {
  await browser.close();
  await rm(screenshotPath, { force: true });
}
NODE
)
