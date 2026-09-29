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
Groq vía https nativo (`api/helpers/groq.js`, sin SDK — el `groq-sdk` chocaba con el `undici` interno de Node, y con timeout de 30s: si Groq no responde en ese tiempo la request se aborta con error en vez de colgar la app). El modelo primario **no está hardcodeado**: `sails.config.custom.groqModel` (env var `GROQ_MODEL`, default `qwen/qwen3.8-27b` en `config/custom.js`).

**Fallback automático entre modelos:** el helper mantiene un catálogo conocido (`KNOWN_MODELS` en `api/helpers/groq.js`: `qwen/qwen3.8-27b` → `openai/gpt-oss-120b` → `openai/gpt-oss-20b`). Si Groq responde `model_not_found`/`model_decommissioned` (o un mensaje que suene a eso) para el modelo configurado, el helper reintenta automáticamente con el siguiente candidato de la lista antes de fallar — no hace falta cambiar el env var a mano cuando Groq deprecia un modelo, aunque sigue siendo buena idea actualizar el default apenas se detecte (queda un `sails.log.warn` marcando que se usó un candidato de respaldo). Cada modelo del catálogo lleva su propio `reasoningEffort` (Qwen espera `'none'`, GPT-OSS espera `'low'`) y flag `vision` — un caller pasa `requireVision:true` para que el fallback solo considere modelos con soporte de imágenes. Confirmado con test directo (helper llamado fuera de Sails, forzando un modelo inexistente): cae al siguiente candidato y responde bien, tanto para texto como para visión.

`qwen/qwen3.8-27b` **sí soporta imágenes** (`input_modalities: ["text","image"]` en el catálogo de Groq) — confirmado en vivo con una llamada de visión real. Si en el futuro un endpoint de IA falla con `model_not_found`, confirmar el catálogo vigente contra `GET https://api.groq.com/openai/v1/models` (trae `input_modalities` por modelo) antes de asumir cualquier otra causa, y actualizar `KNOWN_MODELS` si cambió qué modelo soporta visión.
- `api/controllers/ai/generate-document.js` — generación de documentos.
- `api/controllers/ai/describe-command.js` — descripción de comandos (antes era una llamada directa a Groq desde el frontend con la key expuesta en el bundle; ahora pasa por acá).
- `api/controllers/tasks/extract-from-file.js` — extracción de tareas desde imagen/docx, pasa `requireVision:true` en el path de imagen.

**No hay Anthropic SDK en este backend** — no asumir ni introducir uso de Claude/Anthropic aquí.

## Rate limiting
`api/policies/rate-limit-{login,register,forgot-password}.js` (via `express-rate-limit`, en memoria — si el servicio corre con más de una instancia en Render esto no comparte estado entre instancias). Login: 10/15min, registro: 5/hora, forgot-password: 5/hora, todos por IP.

## Config
- `config/datastores.js`: adapter `sails-postgresql`, `url` desde `DATABASE_URL`, `ssl: { rejectUnauthorized: false }`.
- Otras deps relevantes: `@supabase/supabase-js` (storage), `bcryptjs`, `nodemailer` (sin uso activo — el envío real de emails es Resend vía https nativo en `api/helpers/mailer.js`), `jsonwebtoken`, `joi`, `mammoth` (extracción de texto de .docx).

## Deploy
Render (ver CLAUDE.md raíz para la postura de seguridad sobre acciones MCP en Render).
