# Daybed

Este proyecto es una aplicación full-stack para una tienda de muebles. Utiliza **Django** y **Django REST Framework** en el backend, y **React** con **Vite** en el frontend. Seguimos el estándar de equipo utilizando `uv` para la gestión de dependencias y entorno de Python.

---

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

* **Node.js LTS**: [Descargar Node.js](https://nodejs.org/)

* **Git**: [Instalar Git](https://git-scm.com/downloads)

* **Visual Studio Code**: recomendado para trabajar con las extensiones del proyecto.

* **uv**: [Instalar uv](https://github.com/astral-sh/uv)

  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

  Si PowerShell no reconoce `uv` después de instalarlo, agrega temporalmente la ruta de uv a la sesión actual:

  ```powershell
  $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
  ```

  Para guardar esa ruta de forma permanente en las variables de entorno del usuario:

  ```powershell
  [Environment]::SetEnvironmentVariable("Path", $env:USERPROFILE + "\.local\bin;" + [Environment]::GetEnvironmentVariable("Path", "User"), "User")
  ```

  Para que `uv` use versiones de Python gestionadas por `uv`, configura esta variable en la sesión actual:

  ```powershell
  $env:UV_MANAGED_PYTHON = "true"
  ```

  Para guardarla de forma permanente:

  ```powershell
  [Environment]::SetEnvironmentVariable("UV_MANAGED_PYTHON", "true", "User")
  ```

  Después de configurar variables permanentes, cierra y vuelve a abrir PowerShell.

  Verifica que `uv` funcione:

  ```powershell
  uv --version
  ```

  Instala Python 3.12 mediante `uv`:

  ```powershell
  uv python install 3.12
  ```

Verifica la instalación:

```powershell
uv --version
```

```powershell
node --version
```

```powershell
npm --version
```

```powershell
git --version
```

---

## Preparación del proyecto en Windows

### 1. Clonar el repositorio

Abre PowerShell en la carpeta donde quieras guardar el proyecto y ejecuta:

```powershell
git clone https://github.com/git-oojl/daybed.git
```

```powershell
cd daybed
```

---

## 2. Backend: Django + uv

El backend utiliza `uv` para gestionar el entorno virtual y las dependencias de Python.

### Entrar a la carpeta del backend

```powershell
cd backend
```

### Sincronizar dependencias

```powershell
uv sync
```

### Crear archivo de variables de entorno

```powershell
Copy-Item .env.example .env
```

Si vas a trabajar con la estimación de entregas, agrega tu API key de OpenRouteService en `backend/.env`.

### Ejecutar migraciones

```powershell
uv run python manage.py migrate
```

### Verificar configuración de Django

```powershell
uv run python manage.py check
```

### Iniciar servidor de desarrollo

```powershell
uv run python manage.py runserver
```

El backend quedará disponible en:

```text
http://localhost:8000
```

> [!IMPORTANT]
> No ejecutes comandos de Django usando `python` directamente. Usa siempre `uv run python` para asegurar que se utilice el entorno correcto.
>
> Correcto:
>
> ```powershell
> uv run python manage.py migrate
> ```
>
> Evitar:
>
> ```powershell
> python manage.py migrate
> ```

---

## 3. Frontend: React + Vite

Abre otra terminal desde la raíz del proyecto.

### Entrar a la carpeta del frontend

```powershell
cd frontend
```

### Instalar dependencias

```powershell
npm ci
```

### Crear archivo de variables de entorno

```powershell
Copy-Item .env.example .env
```

El valor esperado para desarrollo local es:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Iniciar servidor de desarrollo

```powershell
npm run dev
```

El frontend quedará disponible en:

```text
http://localhost:5173
```

---

## Calidad de código

Este proyecto usa herramientas de formato y revisión, pero **no se ejecutan automáticamente en cada commit para todo el equipo**. Para evitar commits lentos, cada integrante debe usar las extensiones recomendadas de VS Code y ejecutar revisiones manuales antes de subir cambios importantes o abrir un Pull Request.

### Extensiones recomendadas de VS Code

Al abrir el proyecto en VS Code, aparecerán extensiones recomendadas para el workspace:

* Prettier
* ESLint
* EditorConfig

Estas extensiones ayudan a mantener formato consistente y detectar errores comunes mientras se trabaja.

### Frontend

Antes de subir cambios del frontend, ejecuta desde `/frontend`:

```powershell
npm run format
```

```powershell
npm run lint
```

```powershell
npm run build
```

### Backend

El backend será mantenido por los integrantes asignados a Django. Las revisiones del backend se ejecutan desde `/backend` con `uv`:

```powershell
uv run ruff check . --fix
```

```powershell
uv run black .
```

```powershell
uv run python manage.py check
```

```powershell
uv run pytest
```

---

## Estructura del proyecto

```text
daybed/
├── backend/
│   ├── apps/
│   ├── config/
│   ├── manage.py
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   └── package.json
├── docs/
├── infra/
├── .gitignore
└── README.md
```

* `/backend`: lógica del servidor, API, modelos y configuración de Django.
* `/frontend`: interfaz de usuario con React y Vite.
* `/docs`: documentación técnica y decisiones del proyecto.
* `/infra`: espacio reservado para infraestructura futura.
* `backend/pyproject.toml`: configuración de dependencias de Python gestionadas con `uv`.
* `frontend/package.json`: configuración de dependencias y scripts de JavaScript.

---

## Flujo básico con Git

Antes de empezar a trabajar:

```powershell
git pull origin main
```

Crear una rama nueva:

```powershell
git checkout -b feature/nombre-de-la-funcionalidad
```

Guardar cambios:

```powershell
git add .
```

```powershell
git commit -m "feat: describe el cambio"
```

Subir rama:

```powershell
git push -u origin feature/nombre-de-la-funcionalidad
```

Después abre un Pull Request hacia `main`.

---

## Convención de commits

Usa mensajes cortos y claros:

```text
feat: agrega catálogo de productos
fix: corrige validación del carrito
docs: actualiza instrucciones de instalación
chore: configura herramientas del proyecto
refactor: reorganiza componentes del frontend
test: agrega pruebas de pedidos
```

---

## Estado del proyecto

Este repositorio está en fase inicial. La base del backend, frontend, documentación y estructura del proyecto está preparada para comenzar el desarrollo del MVP de Daybed.
