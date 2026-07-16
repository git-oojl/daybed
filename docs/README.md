# Documentación de Daybed

Esta carpeta centraliza la documentación funcional y técnica del proyecto Daybed.

## Índice

| Archivo                        | Contenido                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `ALCANCE.md`                   | Alcance funcional del MVP, objetivos y límites del proyecto.                                                             |
| `API_EXTERNAS.md`              | Uso de servicios externos como Nominatim/OpenStreetMap y OpenRouteService para geocodificación y estimación de entregas. |
| `DECISIONES_TECNICAS.md`       | Decisiones de arquitectura, stack tecnológico y criterios técnicos del proyecto.                                         |
| `FRONTEND_BACKEND_FAQ.md`      | Preguntas frecuentes para integrar vistas frontend con el backend.                                                       |
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

Después de migrar la base local del backend, cargar semillas:

```bash
cd backend
uv run python manage.py migrate
uv run python manage.py seed_demo
```

Las semillas son la fuente compartida para datos de prueba locales. No se versiona ni se sincroniza `db.sqlite3`.
