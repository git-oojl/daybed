# Documentación de Daybed

Esta carpeta centraliza la documentación funcional y técnica del proyecto Daybed.

## Índice

| Archivo                        | Contenido                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `ALCANCE.md`                   | Alcance funcional del MVP, objetivos y límites del proyecto.                                                             |
| `API_EXTERNAS.md`              | Uso de servicios externos como Nominatim/OpenStreetMap y OpenRouteService para geocodificación y estimación de entregas. |
| `DECISIONES_TECNICAS.md`       | Decisiones de arquitectura, stack tecnológico y criterios técnicos del proyecto.                                         |
| `FRONTEND_BACKEND_FAQ.md`      | Preguntas frecuentes para integrar vistas frontend con el backend.                                                       |
| `LINUX_WSL2_WORKFLOW.md`         | Flujo diario, recuperación desde clone limpio y uso de bootstrap/validate/smoke en Debian/WSL2.                         |
| `HERMETIC_SANDBOX_BUNDLE.md`   | Contrato de `.vendor`, restore, rebuild, Playwright/Chromium, finalización y aceptación de bundles.                      |
| `backend/README.md`            | Documentación técnica del backend, incluyendo arquitectura, ERD, flujo de pedido y contrato OpenAPI.                     |
| `backend/ENDPOINTS_BACKEND.md` | Resumen de endpoints REST implementados en el backend.                                                                   |
| `backend/MODELO_DATOS.md`      | Entidades principales, relaciones y reglas de datos del sistema.                                                         |
| `backend/openapi.yaml`         | Especificación OpenAPI generada automáticamente desde Django REST Framework.                                             |
| `backend/diagrams/`            | Diagramas técnicos del backend en formato fuente y exportado.                                                            |
| `FRONTEND_VIEWS.md`            | Vistas previstas del frontend y estado de avance. (Pendiente)                                                            |
| `CONTRIBUCION.md`              | Guía básica de contribución y organización del trabajo. (Pendiente)                                                      |

## Evidencias técnicas destacadas

- [Documentación técnica del backend](./backend/README.md)
- [FAQ frontend + backend](./FRONTEND_BACKEND_FAQ.md)
- [Contrato OpenAPI](./backend/openapi.yaml)
- [Diagrama de arquitectura del backend](./backend/diagrams/arquitectura_backend.png)
- [Diagrama entidad-relación del backend](./backend/diagrams/diagrama_erd_backend.png)
- [Flujo principal de pedido](./backend/diagrams/flujo_pedido.png)

## Setup local obligatorio

Para Debian/WSL2 y el entorno hermético, usa [LINUX_WSL2_WORKFLOW.md](./LINUX_WSL2_WORKFLOW.md). Los comandos siguientes documentan el setup manual subyacente.


Después de migrar la base local del backend, cargar semillas:

```bash
cd backend
cp .env.example .env
# editar .env y agregar OPENROUTESERVICE_API_KEY para estimaciones reales de entrega
uv run python manage.py migrate
uv run python manage.py seed_demo
```

La key de OpenRouteService va solo en `backend/.env`; no se versiona y no pertenece al frontend. Las semillas son la fuente compartida para datos de prueba locales. No se versiona ni se sincroniza `db.sqlite3`.
