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
Groq vía https nativo (`api/helpers/groq.js`, sin SDK — el `groq-sdk` chocaba con el `undici` interno de Node). El modelo **no está hardcodeado**: `sails.config.custom.groqModel` (env var `GROQ_MODEL`, default `qwen/qwen3.6-27b` en `config/custom.js`) — si Groq deprecia el modelo, se cambia el env var en Render, sin tocar código ni redeployar. El helper manda `reasoning_effort: 'none'` por default (es un modelo "thinking"; sin esto gasta el `max_tokens` razonando antes de responder) — pasar otro valor si se configura un modelo que no acepte `'none'`.
- `api/controllers/ai/generate-document.js` — generación de documentos.
- `api/controllers/ai/describe-command.js` — descripción de comandos (antes era una llamada directa a Groq desde el frontend con la key expuesta en el bundle; ahora pasa por acá).
- `api/controllers/tasks/extract-from-file.js` — extracción de tareas desde imagen/docx (usa el mismo modelo también para visión — si se cambia `GROQ_MODEL` a algo sin soporte de imágenes, este endpoint se rompe).

Si un endpoint de IA falla con `model_not_found`, confirmar el catálogo vigente contra `GET https://api.groq.com/openai/v1/models` antes de asumir cualquier otra causa — Groq deprecia modelos con frecuencia.

**No hay Anthropic SDK en este backend** — no asumir ni introducir uso de Claude/Anthropic aquí.

## Rate limiting
`api/policies/rate-limit-{login,register,forgot-password}.js` (via `express-rate-limit`, en memoria — si el servicio corre con más de una instancia en Render esto no comparte estado entre instancias). Login: 10/15min, registro: 5/hora, forgot-password: 5/hora, todos por IP.

## Config
- `config/datastores.js`: adapter `sails-postgresql`, `url` desde `DATABASE_URL`, `ssl: { rejectUnauthorized: false }`.
- Otras deps relevantes: `@supabase/supabase-js` (storage), `bcryptjs`, `nodemailer` (sin uso activo — el envío real de emails es Resend vía https nativo en `api/helpers/mailer.js`), `jsonwebtoken`, `joi`, `mammoth` (extracción de texto de .docx).

## Deploy
Render (ver CLAUDE.md raíz para la postura de seguridad sobre acciones MCP en Render).
