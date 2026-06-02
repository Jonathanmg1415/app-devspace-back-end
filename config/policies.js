module.exports.policies = {
  'auth/register': true,
  'auth/login':    true,
  '*':             'isAuthenticated',
};
