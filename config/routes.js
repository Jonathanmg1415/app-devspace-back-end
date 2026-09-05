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
  // AUTH
  'POST /auth/register':         { action: 'auth/register' },
  'POST /auth/login':            { action: 'auth/login' },
  'GET  /auth/me':               { action: 'auth/me' },
  'PUT  /auth/profile':          { action: 'auth/update-profile' },
  'POST /auth/forgot-password':  { action: 'auth/forgot-password' },
  'POST /auth/reset-password':   { action: 'auth/reset-password' },

  // PROYECTOS
  'GET    /projects':        { action: 'projects/get-projects' },
  'GET    /projects/detail': { action: 'projects/get-project' },
  'POST   /projects':        { action: 'projects/create-project' },
  'PUT    /projects/edit':   { action: 'projects/edit-project' },
  'DELETE /projects/delete': { action: 'projects/delete-project' },

  // TAREAS
  'POST   /tasks/extract': { action: 'tasks/extract-from-file' },
  'GET    /tasks/mine':   { action: 'tasks/get-my-tasks' },
  'GET    /tasks':        { action: 'tasks/get-tasks' },
  'POST   /tasks':        { action: 'tasks/create-tarea' },
  'PUT    /tasks/edit':   { action: 'tasks/edit-tarea' },
  'DELETE /tasks/delete': { action: 'tasks/delete-tarea' },

  // LINKS
  'GET    /links':        { action: 'links/get-links' },
  'POST   /links':        { action: 'links/create-enlace' },
  'PUT    /links/edit':   { action: 'links/edit-enlace' },
  'DELETE /links/delete': { action: 'links/delete-enlace' },

  // COMANDOS
  'GET    /commands':        { action: 'commands/get-commands' },
  'POST   /commands':        { action: 'commands/create-comando' },
  'PUT    /commands/edit':   { action: 'commands/edit-comando' },
  'DELETE /commands/delete': { action: 'commands/delete-comando' },

  // NOTAS
  'GET    /notes':        { action: 'notes/get-notes' },
  'POST   /notes':        { action: 'notes/create-nota' },
  'PUT    /notes/edit':   { action: 'notes/edit-nota' },
  'DELETE /notes/delete': { action: 'notes/delete-nota' },

  // CARDS
  'GET    /cards':        { action: 'cards/get-cards' },
  'POST   /cards':        { action: 'cards/create-card' },
  'PUT    /cards/edit':   { action: 'cards/edit-card' },
  'DELETE /cards/delete': { action: 'cards/delete-card' },

  // FILES
  'GET    /files':        { action: 'files/get-files' },
  'POST   /files/upload': { action: 'files/upload-file' },
  'DELETE /files/delete': { action: 'files/delete-file' },

  // MIEMBROS
  'GET    /members':             { action: 'members/get-members' },
  'POST   /members/invite':      { action: 'members/invite-member' },
  'PUT    /members/update-role': { action: 'members/update-member-role' },
  'DELETE /members/delete':      { action: 'members/remove-member' },

  // BUSQUEDA
  'GET /search': { action: 'search/global-search' },

  // COMENTARIOS
  'GET    /comments':        { action: 'comments/get-comments' },
  'POST   /comments':        { action: 'comments/create-comment' },
  'DELETE /comments/delete': { action: 'comments/delete-comment' },

  // ACTIVIDAD
  'GET /activity': { action: 'activity/get-activity' },

  // IA - generacion de documentos
  'POST /ai/generate': { action: 'ai/generate-document' },
  'POST /ai/describe-command': { action: 'ai/describe-command' },

  // NOTIFICACIONES
  'GET    /notifications':          { action: 'notifications/get-notifications' },
  'PUT    /notifications/read':     { action: 'notifications/mark-read' },
  'PUT    /notifications/read-all': { action: 'notifications/mark-all-read' },
  'POST   /notifications/seed':     { action: 'notifications/seed-notifications' },

  // DASHBOARD
  'GET /projects/summary': { action: 'projects/get-summary' },

  // EVENTOS
  'GET    /events':             { action: 'events/get-events' },
  'POST   /events':             { action: 'events/create-event' },
  'PUT    /events/edit':        { action: 'events/edit-event' },
  'DELETE /events/delete':      { action: 'events/delete-event' },

  // CALENDARIOS
  'GET    /calendars':          { action: 'calendars/get-calendars' },
  'POST   /calendars':          { action: 'calendars/create-calendar' },
  'PUT    /calendars/edit':     { action: 'calendars/edit-calendar' },
  'DELETE /calendars/delete':   { action: 'calendars/delete-calendar' },
  'GET    /calendars/members':  { action: 'calendars/get-members' },
  'POST   /calendars/invite':   { action: 'calendars/invite-member' },
  'DELETE /calendars/member':   { action: 'calendars/remove-member' },

  // TAREAS DE DÍA
  'GET    /day-tasks':          { action: 'day-tasks/get-day-tasks' },
  'POST   /day-tasks':          { action: 'day-tasks/create-day-task' },
  'PUT    /day-tasks/edit':     { action: 'day-tasks/edit-day-task' },
  'PUT    /day-tasks/toggle':   { action: 'day-tasks/toggle-day-task' },
  'DELETE /day-tasks/delete':   { action: 'day-tasks/delete-day-task' },

  // HEALTH
  'GET /health': { action: 'health/ping' },
});
