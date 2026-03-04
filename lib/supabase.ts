// lib/supabase.ts — Supabase client singleton
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://rznqgjrlbirdzwpskdxy.supabase.co'

const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnFnanJsYmlyZHp3cHNrZHh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NTk0MTYsImV4cCI6MjA4ODIzNTQxNn0.XjAfLQcaIevpRZtoeJQDQhahrM_mp_ICRfsA6NZJmZA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
