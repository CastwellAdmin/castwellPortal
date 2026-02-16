import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wlsjbouwykyoyxzljkvl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc2pib3V3eWt5b3l4emxqa3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzE5NTYsImV4cCI6MjA4MzQwNzk1Nn0.EEdeYBpawtf7eewoKO7ZSFFMfMQtpDSvVXutr06oUvM';

export const isDemoMode = false;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    error: error.message || 'An unexpected error occurred',
    details: error,
  };
};
