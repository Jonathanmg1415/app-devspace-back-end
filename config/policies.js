module.exports.policies = {

  // Auth — register y login son públicos, me requiere token
  'auth/register': true,
  'auth/login':    true,
  'auth/me':       'isAuthenticated',

  // Todo lo demás requiere autenticación
  'projects/*':  'isAuthenticated',
  'tasks/*':     'isAuthenticated',
  'links/*':     'isAuthenticated',
  'commands/*':  'isAuthenticated',
  'notes/*':     'isAuthenticated',
  'cards/*':     'isAuthenticated',
  'search/*':    'isAuthenticated',
  'files/*': 'isAuthenticated',
  'members/*': 'isAuthenticated',

};
