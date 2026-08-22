import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rzzqfxploworizteqgjv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6enFmeHBsb3dvcml6dGVxZ2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTg5MTEsImV4cCI6MjEwMjk5NDkxMX0.3e672EidiygIa3MQNIITp1assZWMRoGCgs5QeXVQzvw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
