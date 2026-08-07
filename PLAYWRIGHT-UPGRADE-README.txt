DAYBED PLAYWRIGHT + CHROMIUM STAGE 2

This patch is for the previously built Daybed fat bundle.
It does NOT contain Chromium yet. Run the upgrade script on internet-connected Debian 13 WSL2 x86_64; that script downloads Playwright 1.62.0 + its exact Chromium into the project's .vendor directory, validates the browser and application, proves npm can reinstall offline, and creates the final upload tarball.

From WSL2:
  mkdir -p ~/src/daybed-browser-upgrade
  cd ~/src/daybed-browser-upgrade
  tar -xzf /path/to/daybed-pase-final-openai-sandbox-linux-x86_64.tar.gz
  tar -xzf /path/to/daybed-playwright-stage2-patch.tar.gz -C daybed-pase-final
  cd daybed-pase-final
  bash scripts/upgrade-browser-bundle.sh

If Playwright reports missing Linux shared libraries on your WSL builder, run this once after the npm install has occurred:
  cd frontend
  sudo env PATH="$PWD/../.vendor/node/bin:$PATH" PLAYWRIGHT_BROWSERS_PATH="$PWD/../.vendor/playwright-browsers" ./node_modules/.bin/playwright install-deps chromium
  cd ..
  bash scripts/upgrade-browser-bundle.sh

Final output:
  ../daybed-pase-final-openai-sandbox-linux-x86_64-playwright.tar.gz

Upload that final output to ChatGPT.
