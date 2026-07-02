const rawOrigin = process.env.CORS_ORIGIN || '*';
const allowOrigins = rawOrigin === '*'
  ? '*'
  : rawOrigin.split(',').map(s => s.trim());

module.exports.security = {
  csrf: false,
  cors: {
    allRoutes:        true,
    allowOrigins,
    allowCredentials: false,
    allowRequestMethods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    allowRequestHeaders: 'Content-Type, Authorization',
  },
};
