import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lpqtduyfgtlpdwginxje.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcXRkdXlmZ3RscGR3Z2lueGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MjM3NTksImV4cCI6MjEwMjk5OTc1OX0.XBfLxZSBj2RBc6_q9EjjMAt9VJ_P0RRdO785CEfXcsM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
