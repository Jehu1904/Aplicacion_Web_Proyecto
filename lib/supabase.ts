
/**
 * @file supabaseClient.ts
 * @description Instancia única de Supabase para toda la arquitectura modular.
 * Ahora usa variables de entorno Vite (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
 */
import { createClient } from '@supabase/supabase-js';

// Preferir variables de entorno; caídas seguras para desarrollo local si faltan.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fhfplimuytbegbpbtfpz.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_p6RLIXLSoD7b_OskcPKr8A_MJTlIM8y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);