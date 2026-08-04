module.exports.policies = {
  'auth/register':        'rate-limit-register',
  'auth/login':           'rate-limit-login',
  'auth/forgot-password': 'rate-limit-forgot-password',
  'auth/reset-password':  true,
  'health/ping':          true,
  '*':                    'isAuthenticated',
};
