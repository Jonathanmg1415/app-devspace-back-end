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
  'GET    /projects':     { action: 'projects/get-projects' },
  'GET    /projects/:id': { action: 'projects/get-project' },
  'POST   /projects':     { action: 'projects/create-project' },
  'PUT    /projects/:id': { action: 'projects/edit-project' },
  'DELETE /projects/:id': { action: 'projects/delete-project' },

  // ── TAREAS ────────────────────────────────────────────
  'GET    /projects/:projectId/tasks': { action: 'tasks/get-tasks' },
  'POST   /projects/:projectId/tasks': { action: 'tasks/create-tarea' },
  'PUT    /tasks/:id':                 { action: 'tasks/edit-tarea' },
  'DELETE /tasks/:id':                 { action: 'tasks/delete-tarea' },

  // ── LINKS ─────────────────────────────────────────────
  'GET    /projects/:projectId/links': { action: 'links/get-links' },
  'POST   /projects/:projectId/links': { action: 'links/create-enlace' },
  'PUT    /links/:id':                 { action: 'links/edit-enlace' },
  'DELETE /links/:id':                 { action: 'links/delete-enlace' },

  // ── COMANDOS ──────────────────────────────────────────
  'GET    /projects/:projectId/commands': { action: 'commands/get-commands' },
  'POST   /projects/:projectId/commands': { action: 'commands/create-comando' },
  'PUT    /commands/:id':                 { action: 'commands/edit-comando' },
  'DELETE /commands/:id':                 { action: 'commands/delete-comando' },

  // ── NOTAS ─────────────────────────────────────────────
  'GET    /projects/:projectId/notes': { action: 'notes/get-notes' },
  'POST   /projects/:projectId/notes': { action: 'notes/create-nota' },
  'PUT    /notes/:id':                 { action: 'notes/edit-nota' },
  'DELETE /notes/:id':                 { action: 'notes/delete-nota' },

  // ── CARDS ─────────────────────────────────────────────
  'GET    /projects/:projectId/cards': { action: 'cards/get-cards' },
  'POST   /projects/:projectId/cards': { action: 'cards/create-card' },
  'PUT    /cards/:id':                 { action: 'cards/edit-card' },
  'DELETE /cards/:id':                 { action: 'cards/delete-card' },

  // ── BÚSQUEDA ──────────────────────────────────────────
  'GET /search': { action: 'search/global-search' },

});
