
/**
 * @file supabaseClient.ts
 * @description Instancia única de Supabase para toda la arquitectura modular.
 * Ahora usa variables de entorno Vite (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
 */
import { createClient } from '@supabase/supabase-js';

// Priorizar variables de entorno de Vite y usar fallback de desarrollo local.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://flfzypyklcjvinacfhem.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dbnbG3uAVo20_1nY3GPJ_Q_XpwpQg1_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);