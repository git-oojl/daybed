SHELL := /usr/bin/env bash

.PHONY: doctor bootstrap validate browser-check smoke backend-test frontend-test backend frontend serve clean-local

doctor:
	bash scripts/agent-doctor.sh

bootstrap:
	bash scripts/agent-bootstrap.sh

validate:
	bash scripts/agent-validate.sh

browser-check:
	bash scripts/agent-browser-check.sh

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
	rm -rf backend/.venv frontend/node_modules frontend/dist backend/staticfiles
	rm -f backend/db.sqlite3 backend/.env frontend/.env
