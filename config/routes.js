var blueprintConfig = require('./local');
var ROUTE_PREFIX = blueprintConfig.prefix || '';

function addGlobalPrefix(routes) {
  var paths = Object.keys(routes);
  var newRoutes = {};
  if (ROUTE_PREFIX === '') return routes;
  paths.forEach((path) => {
    var pathParts   = path.split(' ');
    var uri         = pathParts.pop();
    var prefixedURI = ROUTE_PREFIX + uri;
    pathParts.push(prefixedURI);
    newRoutes[pathParts.join(' ')] = routes[path];
  });
  return newRoutes;
}

module.exports.routes = addGlobalPrefix({
  // ── AUTH ──────────────────────────────────────────────
  'POST /auth/register': { action: 'auth/register' },
  'POST /auth/login':    { action: 'auth/login' },
  'GET  /auth/me':       { action: 'auth/me' },

  // ── PROYECTOS ─────────────────────────────────────────
  'GET    /projects':        { action: 'projects/get-projects' },
  'GET    /projects/detail': { action: 'projects/get-project' },
  'POST   /projects':        { action: 'projects/create-project' },
  'PUT    /projects/edit':   { action: 'projects/edit-project' },
  'DELETE /projects/delete': { action: 'projects/delete-project' },

  // ── TAREAS ────────────────────────────────────────────
  'GET    /tasks':        { action: 'tasks/get-tasks' },
  'POST   /tasks':        { action: 'tasks/create-tarea' },
  'PUT    /tasks/edit':   { action: 'tasks/edit-tarea' },
  'DELETE /tasks/delete': { action: 'tasks/delete-tarea' },

  // ── LINKS ─────────────────────────────────────────────
  'GET    /links':        { action: 'links/get-links' },
  'POST   /links':        { action: 'links/create-enlace' },
  'PUT    /links/edit':   { action: 'links/edit-enlace' },
  'DELETE /links/delete': { action: 'links/delete-enlace' },

  // ── COMANDOS ──────────────────────────────────────────
  'GET    /commands':        { action: 'commands/get-commands' },
  'POST   /commands':        { action: 'commands/create-comando' },
  'PUT    /commands/edit':   { action: 'commands/edit-comando' },
  'DELETE /commands/delete': { action: 'commands/delete-comando' },

  // ── NOTAS ─────────────────────────────────────────────
  'GET    /notes':        { action: 'notes/get-notes' },
  'POST   /notes':        { action: 'notes/create-nota' },
  'PUT    /notes/edit':   { action: 'notes/edit-nota' },
  'DELETE /notes/delete': { action: 'notes/delete-nota' },

  // ── CARDS ─────────────────────────────────────────────
  'GET    /cards':        { action: 'cards/get-cards' },
  'POST   /cards':        { action: 'cards/create-card' },
  'PUT    /cards/edit':   { action: 'cards/edit-card' },
  'DELETE /cards/delete': { action: 'cards/delete-card' },

  // ── FILES ─────────────────────────────────────────────
  'GET    /files':        { action: 'files/get-files' },
  'POST   /files/upload': { action: 'files/upload-file' },
  'DELETE /files/delete': { action: 'files/delete-file' },

  // ── MIEMBROS ──────────────────────────────────────────
  'GET    /members':        { action: 'members/get-members' },
  'POST   /members/invite': { action: 'members/invite-member' },
  'DELETE /members/delete': { action: 'members/remove-member' },

  // ── BÚSQUEDA ──────────────────────────────────────────
  'GET /search': { action: 'search/global-search' },
});
