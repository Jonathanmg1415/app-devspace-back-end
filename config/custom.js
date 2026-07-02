module.exports.custom = {
  jwtSecret:        process.env.JWT_SECRET      || 'dev_secret_change_in_production',
  supabaseUrl:      process.env.SUPABASE_URL,
  supabaseKey:      process.env.SUPABASE_SERVICE_KEY,
  supabaseBucket:   process.env.SUPABASE_BUCKET  || 'devspace-files',
  resendApiKey:     process.env.RESEND_API_KEY,
  fromEmail:        process.env.FROM_EMAIL        || 'onboarding@resend.dev',
  resendOwnerEmail: process.env.RESEND_OWNER_EMAIL || 'jonathang1415@gmail.com',
  appUrl:           process.env.APP_URL           || 'http://localhost:9000',
};
