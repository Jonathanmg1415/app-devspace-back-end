# DevSpace — Backend

> API de DevSpace: proyectos, tareas, notas, comandos, links, cards, archivos y colaboración en equipo.

Backend en Sails.js sobre PostgreSQL (hosteado en Supabase), con storage de archivos también en Supabase y emails transaccionales vía Resend.

---

## Stack

| Tecnología | Rol |
|---|---|
| [Sails.js](https://sailsjs.com/) | Framework MVC sobre Express |
| [sails-postgresql](https://github.com/balderdashy/sails-postgresql) | Adapter de base de datos |
| PostgreSQL (Supabase) | Base de datos |
| Supabase Storage | Almacenamiento de archivos |
| [Resend](https://resend.com/) | Envío de emails (invitaciones, recuperación de contraseña) |
| [Groq](https://groq.com/) | IA (generación de documentos, extracción de tareas desde archivos) |
| JWT (`jsonwebtoken`) | Autenticación |

Groq y Resend se consumen con `https` nativo de Node (`api/helpers/groq.js`, `api/helpers/mailer.js`), no con sus SDKs oficiales — el `undici` interno de Node choca con ambos SDKs. Supabase Storage sigue el mismo patrón (`api/helpers/supabase.js`).

---

## Requisitos

- Node.js `^22.22`
- Una base de datos PostgreSQL (Supabase u otra)

---

## Instalación

```bash
npm install
cp .env.example .env
# completar .env con tus credenciales (ver más abajo)
```

---

## Correr en local

```bash
npm run dev
```

**Importante:** usar `npm run dev` (`node app.js`), **no `sails lift` directo**. `app.js` carga `.env` vía `dotenv` antes de levantar Sails; `sails lift` no pasa por `app.js` y por lo tanto nunca carga el `.env` — cualquier feature que dependa de esas variables (Supabase, Resend, Groq) fallará silenciosamente si se usa `sails lift`.

El servidor queda en `http://localhost:1337`, con todas las rutas bajo el prefijo `/api` (ver más abajo).

---

## Variables de entorno

Ver `.env.example` para la lista completa. Las más importantes:

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a Postgres |
| `JWT_SECRET` | Firma de tokens de auth |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` / `SUPABASE_BUCKET` | Storage de archivos |
| `RESEND_API_KEY` / `FROM_EMAIL` / `RESEND_OWNER_EMAIL` | Envío de emails (con `onboarding@resend.dev` los emails se redirigen a `RESEND_OWNER_EMAIL`, limitación del free tier de Resend) |
| `GROQ_API_KEY` | IA (documentos, extracción de tareas) |
| `APP_URL` | URL del frontend, usada en links de emails |

⚠️ No hay base de datos de desarrollo separada: `DATABASE_URL` apunta siempre a la base real. Tenerlo en cuenta al probar cosas localmente.

---

## Regla crítica: migraciones

`config/models.js` tiene `migrate: 'safe'` — Sails **nunca** crea ni altera tablas automáticamente al levantar. Cualquier cambio de campo/modelo necesita el SQL correspondiente corrido a mano en Supabase.

---

## Estructura

```
app-devspace-back-end/
├── api/
│   ├── controllers/       # Un archivo por acción, agrupados por dominio
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── tasks/          # incluye extract-from-file.js (IA)
│   │   ├── notes/ links/ commands/ cards/ files/
│   │   ├── members/ comments/ activity/ events/ calendar/
│   │   ├── notifications/ search/ ai/ health/
│   ├── models/             # Un modelo Waterline por tabla
│   ├── policies/           # isAuthenticated.js — JWT bearer
│   └── helpers/            # groq.js, mailer.js, supabase.js, delete-file-storage.js, log-activity.js
├── config/
│   ├── routes.js           # Rutas explícitas, prefijo /api vía config/local.js
│   ├── policies.js         # Mapeo de políticas por acción
│   ├── models.js           # migrate: 'safe', defaults de id/timestamps
│   └── local.js            # prefix: '/api' — no es solo config de máquina, viaja con el repo
└── app.js                  # Entry point real (carga dotenv, luego sails.lift())
```

---

## Prefijo de rutas

Todas las rutas van bajo `/api` (`config/local.js` define `prefix: '/api'`, aplicado a todo `config/routes.js` vía `addGlobalPrefix()`). Esto aplica igual en local y en producción.

---

## Deploy (Render)

El servicio en Render corre `npm run dev`/`node app.js` (no `sails lift`). Variables de entorno configuradas en el dashboard de Render, igual que en `.env.example`.

---

## Frontend relacionado

El frontend (Vue 3 + Quasar) vive en `app-devspace-front-end/` dentro del mismo workspace, con su propio `README.md`.
