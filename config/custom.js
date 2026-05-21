module.exports.custom = {
  jwtSecret: process.env.JWT_SECRET || "CHANGE_THIS_SECRET_IN_PRODUCTION",
  baseUrl: process.env.BASE_URL || "http://localhost:1337",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  supabaseBucket: process.env.SUPABASE_BUCKET || "devspace-files",
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.FROM_EMAIL || "onboarding@resend.dev",
  appUrl: process.env.APP_URL || "http://localhost:9000",
};
