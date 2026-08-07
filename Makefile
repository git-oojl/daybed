SHELL := /usr/bin/env bash

.PHONY: doctor restore-vendor bootstrap validate browser-check browser-deps smoke backend-test frontend-test backend frontend serve clean-local bundle rebuild-bundle upgrade-browser accept-bundle

doctor:
	bash scripts/agent-doctor.sh

restore-vendor:
	@test -n "$(VENDOR_ARCHIVE)" || (echo 'Usage: make restore-vendor VENDOR_ARCHIVE=/path/to/environment-anchor.tar.gz' >&2; exit 2)
	bash scripts/restore-vendor.sh "$(VENDOR_ARCHIVE)"

bootstrap:
	bash scripts/agent-bootstrap.sh

validate:
	bash scripts/agent-validate.sh

browser-check:
	bash scripts/agent-browser-check.sh

browser-deps:
	bash scripts/install-playwright-system-deps.sh

smoke:
	bash scripts/agent-smoke.sh

backend-test:
	cd backend && .venv/bin/python -m pytest -q

frontend-test:
	cd frontend && npm test

backend:
	cd backend && .venv/bin/python manage.py runserver 0.0.0.0:8000

frontend:
	cd frontend && npm run dev -- --host 0.0.0.0 --port 5173

serve:
	bash scripts/agent-serve.sh

clean-local:
	rm -rf backend/.venv frontend/node_modules frontend/dist backend/staticfiles .agent-logs .agent-tmp
	rm -f backend/db.sqlite3 backend/.env frontend/.env

# Repackage the CURRENT compatible .vendor payload. No network required.
bundle:
	bash scripts/finalize-sandbox-bundle.sh

# Recreate runtimes/caches/browser from tracked locks. Internet + host uv/node/npm required.
rebuild-bundle:
	bash scripts/build-sandbox-bundle.sh

# Refresh Playwright package/browser after PLAYWRIGHT_VERSION changes. Internet required.
upgrade-browser:
	bash scripts/upgrade-browser-bundle.sh

accept-bundle:
	@test -n "$(BUNDLE)" || (echo 'Usage: make accept-bundle BUNDLE=/path/to/playwright-ready.tar.gz' >&2; exit 2)
	bash scripts/agent-archive-acceptance.sh "$(BUNDLE)"
