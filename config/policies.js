module.exports.policies = {
  'auth/register':        true,
  'auth/login':           true,
  'auth/forgot-password': true,
  'auth/reset-password':  true,
  'health/ping':          true,
  '*':                    'isAuthenticated',
};
