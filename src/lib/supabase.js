import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file:\n' +
    `VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ Missing'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗ Missing'}`
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)