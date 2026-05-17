module.exports.custom = {
  jwtSecret: process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION',
  baseUrl:   process.env.BASE_URL   || 'http://localhost:1337',
};
