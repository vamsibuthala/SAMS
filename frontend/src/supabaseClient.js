import { createClient } from '@supabase/supabase-js';

// Real Supabase credentials configured for SAMS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hzqhaulmzouunakyvkwr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__Y5TE3sqYjAu80feZ5BXVQ_IHpe-vZ9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
