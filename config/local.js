module.exports = {
  prefix: "/api",
  datastores: {
    default: {
      url: "postgresql://postgres.ghtalxbxhwgccsbooysg:Hf458w.L53_zPHr@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    },
  },
  models: {
    migrate: "safe",
  },
  port: 1337,

  custom: {
    jwtSecret: "dev_secret_change_in_production",
    supabaseUrl: "https://ghtalxbxhwgccsbooysg.supabase.co",
    supabaseKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodGFseGJ4aHdnY2NzYm9veXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMwNzY4OCwiZXhwIjoyMDk0ODgzNjg4fQ.sedsK2ioxvYLrhVLngjUPyg7XSO2qal4QkeqxeF-ESs",
    supabaseBucket: "devspace-files",
    appUrl:         'http://localhost:9000',
    resendApiKey: "re_ZMxpyLxW_PfZc7BzAoRgjdCtskgZY37xq",
  },

  fromEmail: "onboarding@resend.dev",
  appUrl: "http://localhost:9000",
};
