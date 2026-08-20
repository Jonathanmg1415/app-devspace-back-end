module.exports = {
  datastores: {
    default: {
      adapter: "sails-postgresql",
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
  },

  models: {
    migrate: "safe",
  },

  blueprints: {
    shortcuts: false,
  },

  security: {
    cors: {
      allRoutes: true,
      allowOrigins: process.env.CORS_ORIGIN || "*",
      allowCredentials: false,
      allowRequestMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      allowRequestHeaders: "Content-Type, Authorization, x-project-id",
    },
  },

  http: {
    // Render pone exactamente un proxy reverso delante de la app — con `true` (todos
    // los proxies) Express confía en el X-Forwarded-For sin límite, que cualquiera
    // puede falsear, así que express-rate-limit lo rechaza en vez de usarlo (rompía
    // login/registro/forgot-password en prod). `1` = confiar solo en ese único hop.
    trustProxy: 1,
    middleware: {
      order: [
        "cookieParser",
        "session",
        "bodyParser",
        "compress",
        "poweredBy",
        "router",
        "www",
        "favicon",
      ],
      bodyParser: (function _configureBodyParser() {
        var skipper = require("skipper");
        return skipper({ strict: false });
      })(),
    },
  },

  log: {
    level: "warn",
  },

  custom: {
    jwtSecret: process.env.JWT_SECRET,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY,
    supabaseBucket: process.env.SUPABASE_BUCKET || "devspace-files",
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || "onboarding@resend.dev",
    appUrl: process.env.APP_URL,
  },
  sockets: {
    onlyAllowOrigins: [
      process.env.CORS_ORIGIN || "https://devspace.vercel.app",
    ],
  },
};
