import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ghilcjppupjlteiienkr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoaWxjanBwdXBqbHRlaWllbmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5ODIsImV4cCI6MjA4NzA5Mjk4Mn0.PRF9jUZEel1EYKj4SIu9NZzoRk_OU34YrzZQD9J1Yf8';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    error: error.message || 'An unexpected error occurred',
    details: error,
  };
};
