import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
};

// Validate required Supabase environment variables
if (!config.supabase.url || !config.supabase.anonKey) {
  console.warn('⚠️  Warning: SUPABASE_URL and SUPABASE_ANON_KEY are required for real-time features');
}
