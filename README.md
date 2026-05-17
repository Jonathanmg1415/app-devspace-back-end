# DevSpace — Frontend

> El workspace que los desarrolladores siempre quisieron tener.

DevSpace es una aplicación web enfocada en desarrolladores de software. Centraliza en un solo lugar los proyectos, tareas, enlaces, comandos y notas que normalmente viven dispersos entre múltiples herramientas.

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| [Vue 3](https://vuejs.org/) | ^3.x | Framework principal |
| [Quasar](https://quasar.dev/) | ^2.x | UI components + build tooling |
| [Vite](https://vitejs.dev/) | ^5.x | Dev server y bundler |
| [Pinia](https://pinia.vuejs.org/) | ^2.x | Estado global |
| [Vue Router 4](https://router.vuejs.org/) | ^4.x | Enrutamiento |
| [vue-i18n](https://vue-i18n.intlify.dev/) | ^9.x | Internacionalización |
| [Axios](https://axios-http.com/) | ^1.x | Cliente HTTP |

---

## Requisitos

- Node.js >= 18
- npm >= 9 (o yarn / pnpm)
- Quasar CLI instalado globalmente

```bash
npm install -g @quasar/cli
```

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-org/devspace-frontend.git
cd devspace-frontend

# Instalar dependencias
npm install
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

```env
# URL base de la API (Sails.js backend)
VITE_API_BASE_URL=http://localhost:1337

# Entorno
VITE_APP_ENV=development
```

> En producción esta variable apunta al backend desplegado en Render.

---

## Desarrollo

```bash
# Iniciar servidor de desarrollo con hot-reload
quasar dev
```

La app estará disponible en `http://localhost:9000`.

---

## Build de producción

```bash
# Generar build optimizado en /dist/spa
quasar build
```

El output es una SPA estática lista para desplegar en Vercel, Netlify o cualquier CDN.

---

## Despliegue (Vercel)

El proyecto se despliega automáticamente en [Vercel](https://vercel.com/) al hacer push a `main`.

Configuración del proyecto en Vercel:

| Campo | Valor |
|---|---|
| Framework Preset | `Other` |
| Build Command | `quasar build` |
| Output Directory | `dist/spa` |
| Install Command | `npm install` |

Agrega las variables de entorno desde el dashboard de Vercel (`Settings → Environment Variables`).

---

## Estructura del proyecto

```
devspace-frontend/
├── public/                 # Assets estáticos
├── src/
│   ├── assets/             # Imágenes, íconos, fuentes
│   ├── boot/               # Plugins de arranque (axios, i18n, pinia)
│   │   ├── axios.js
│   │   └── i18n.js
│   ├── components/         # Componentes reutilizables
│   │   ├── cards/          # Cards arrastrables
│   │   ├── commands/       # Módulo de comandos
│   │   ├── links/          # Módulo de enlaces
│   │   ├── notes/          # Notas y secciones
│   │   └── tasks/          # Kanban de tareas
│   ├── layouts/
│   │   └── MainLayout.vue  # Layout principal con sidebar
│   ├── pages/
│   │   ├── auth/           # Login, registro
│   │   ├── projects/       # Vista de proyectos
│   │   ├── tasks/          # Kanban
│   │   ├── links/          # Gestión de enlaces
│   │   ├── commands/       # Snippets CLI
│   │   ├── notes/          # Notas / secciones
│   │   ├── cards/          # Cards arrastrables
│   │   └── search/         # Búsqueda global
│   ├── router/
│   │   └── index.js        # Definición de rutas y guards
│   ├── stores/             # Stores de Pinia
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── links.js
│   │   ├── commands.js
│   │   └── search.js
│   ├── services/           # Llamadas a la API (por módulo)
│   │   ├── auth.service.js
│   │   ├── projects.service.js
│   │   └── ...
│   ├── composables/        # Lógica reutilizable (useSearch, useDragDrop…)
│   ├── i18n/               # Traducciones
│   │   ├── es/
│   │   └── en/
│   └── css/
│       ├── app.scss
│       └── quasar.variables.scss   # Colores y tokens del tema
├── .env.example
├── quasar.config.js
└── vite.config.js
```

---

## Módulos de la aplicación

| Módulo | Ruta | Descripción |
|---|---|---|
| Proyectos | `/projects` | Lista y gestión de proyectos del usuario |
| Tareas | `/projects/:id/tasks` | Kanban con drag & drop por proyecto |
| Links | `/projects/:id/links` | Repositorio de URLs por proyecto |
| Comandos | `/projects/:id/commands` | Snippets CLI con copia en un clic |
| Notas | `/projects/:id/notes` | Bloques de texto libre por sección |
| Cards | `/projects/:id/cards` | Notas rápidas arrastrables |
| Búsqueda | `/search` | Búsqueda global sobre todos los módulos |

---

## Autenticación

El flujo de autenticación usa JWT almacenado en `localStorage`. El boot file de Axios intercepta cada request para inyectar el token en el header `Authorization: Bearer <token>`.

El router guard en `router/index.js` protege todas las rutas privadas y redirige al login si no hay sesión activa.

---

## Tema y modo oscuro

Quasar gestiona el modo oscuro/claro mediante `$q.dark`. El usuario puede alternar el tema desde la barra de navegación; la preferencia se persiste en `localStorage`.

Los tokens de color se definen en `src/css/quasar.variables.scss` y se aplican globalmente a través del sistema de tema de Quasar.

---

## Backend relacionado

Este repositorio es solo el frontend. El backend (Sails.js + Node.js) se encuentra en:

```
https://github.com/tu-org/devspace-backend
```

Documentación de la API disponible en el README del backend.

---

## Contribuir

1. Crea un branch desde `develop`: `git checkout -b feature/nombre-feature`
2. Haz tus cambios y escribe commits descriptivos
3. Abre un Pull Request hacia `develop`
4. El PR requiere al menos una revisión antes de hacer merge

---

## Licencia

MIT © Cubits YC
