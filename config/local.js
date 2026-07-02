module.exports = {
  prefix: '/api',
  security: {
    cors: {
      allRoutes:           true,
      allowOrigins:        ['http://localhost:9000', 'http://localhost:5173', 'http://localhost:3000'],
      allowCredentials:    false,
      allowRequestMethods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      allowRequestHeaders: 'Content-Type, Authorization',
    },
  },
};
