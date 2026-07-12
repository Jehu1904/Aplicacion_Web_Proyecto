/**
 * @file supabaseClient.ts
 * @description Instancia única de Supabase para toda la arquitectura modular.
 */
import { createClient } from '@supabase/supabase-js';

// Reemplaza con tus credenciales reales
const SUPABASE_URL = 'https://flfzypyklcjvinacfhem.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dbnbG3uAVo20_1nY3GPJ_Q_XpwpQg1_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);