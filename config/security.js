module.exports.security = {
  csrf: false,
  cors: {
    allRoutes:        true,
    allowOrigins:     process.env.CORS_ORIGIN || '*',
    allowCredentials: false,
    allowRequestMethods: 'GET, POST, PATCH, DELETE, OPTIONS',
    allowRequestHeaders: 'Content-Type, Authorization',
  },
};
