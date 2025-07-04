// Типизация для экспорта supabase из supabase.js
import type { SupabaseClient } from '@supabase/supabase-js'

declare module '../lib/supabase.js' {
  export const supabase: SupabaseClient
}
