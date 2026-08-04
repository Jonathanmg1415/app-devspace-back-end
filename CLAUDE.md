# DevSpace Backend (Sails.js)

Sails.js + `sails-postgresql` (Postgres hosteado en Supabase) + Supabase Storage. Deploy en Render.

## Run
- **Usar `npm run dev` (`node app.js`), NO `sails lift` directo.** `app.js` hace `require('dotenv').config()` en su línea 1 antes de levantar Sails; el binario `sails lift` no pasa por `app.js` y por lo tanto **nunca carga `.env`**. Confirmado empíricamente: bajo `sails lift`, `sails.config.custom.supabaseKey`/`supabaseUrl` quedan `undefined` (se leen una sola vez al boot desde `process.env`) y cualquier feature que dependa de ellos falla (ej. upload de archivos a Supabase Storage). Bajo `node app.js` funciona correctamente. Esto invalida la vieja convención de "preferir sails lift" — acá sí importa cuál se usa.

## Regla de migraciones (ver CLAUDE.md raíz)
`config/models.js` y `config/env/production.js`: `migrate: 'safe'`. Nunca asumir que un cambio de campo/modelo persiste sin que el usuario corra el SQL en Supabase primero.

## Prefijo de rutas — mecanismo no obvio
`config/local.js` (**sí está trackeado en git**, pese a que Sails lo trata por convención como override de máquina local) define `prefix: '/api'`. `config/routes.js` envuelve *todas* las rutas en `addGlobalPrefix(...)`, incluida `/health`. Resultado: todas las rutas reales llevan `/api` delante (`/api/auth/login`, `/api/projects`, `/api/health`, etc.) tanto en local como en producción, porque el prefijo viaja con el repo. No asumir que `local.js` es solo config de desarrollador.

## Modelos (`api/models/`, 14 total)
Activity, CalendarMember, Card, Command, Event, File, Link, Note, Notification, Project, ProjectMember, Task, TaskComment, User

Campos/enums no obvios:
- `Project.status`: `active / paused / completed / archived` (default `active`)
- `Task.status`: `todo / in_progress / done`
- `Task.priority`: `low / medium / high`
- `Task.recurrence`: `daily / weekly / monthly`
- `Task.tags`, `Task.checklist`: `json`
- `Notification`: polimórfico vía `entityType` / `entityId`
- `File.bucket`: default `devspace-files` (bucket de Supabase Storage)

## Controladores (`api/controllers/`, por dominio)
activity, ai, auth, calendar, cards, commands, comments, events, files, health, links, members, notes, notifications, projects, search, tasks

## Auth
`api/policies/isAuthenticated.js`: valida JWT Bearer (`jsonwebtoken` + `JWT_SECRET`), adjunta `req.user`.

## IA
Solo Groq SDK (`groq-sdk`, modelo `llama-3.1-8b-instant`), en `api/controllers/ai/generate-document.js`, usado tanto para descripciones de comandos como para generación de documentos. **No hay Anthropic SDK en este backend** — no asumir ni introducir uso de Claude/Anthropic aquí.

## Config
- `config/datastores.js`: adapter `sails-postgresql`, `url` desde `DATABASE_URL`, `ssl: { rejectUnauthorized: false }`.
- Otras deps relevantes: `@supabase/supabase-js` (storage), `bcryptjs`, `resend` + `nodemailer` (email), `jsonwebtoken`, `joi`.

## Deploy
Render (ver CLAUDE.md raíz para la postura de seguridad sobre acciones MCP en Render).
