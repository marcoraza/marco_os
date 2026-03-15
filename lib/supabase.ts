// lib/supabase.ts — Supabase client singleton
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const FALLBACK_SUPABASE_URL = 'https://example.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'missing-supabase-anon-key'

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = createClient(
  SUPABASE_URL ?? FALLBACK_SUPABASE_URL,
  SUPABASE_ANON_KEY ?? FALLBACK_SUPABASE_ANON_KEY,
)
