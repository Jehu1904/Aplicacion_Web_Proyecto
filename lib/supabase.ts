/**
 * @file supabaseClient.ts
 * @description Instancia compartida de Supabase para toda la arquitectura modular.
 */
import { createClient } from '@supabase/supabase-js';

const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!configuredUrl || !configuredKey) {
	throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env de la raíz.');
}

export const SUPABASE_URL = configuredUrl;
export const SUPABASE_KEY = configuredKey;
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true
	}
});

supabase.auth.onAuthStateChange((event, session) => {
	if (session?.access_token) {
		localStorage.setItem('token', session.access_token);
	}
	if (event === 'SIGNED_OUT') {
		localStorage.removeItem('token');
		localStorage.removeItem('user_email');
		localStorage.removeItem('user_role');
		localStorage.removeItem('session_start');
	}
});

export function getAuthenticatedSupabaseClient() {
	return supabase;
}
