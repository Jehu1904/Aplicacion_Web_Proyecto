import { supabase } from './lib/supabase';

// Declaración para evitar el error de TypeScript
declare global {
    interface Window {
        procesarAcceso: (modo: 'login' | 'registro', rol?: 'cliente' | 'admin') => Promise<void>;
    }
}

window.procesarAcceso = async (modo: 'login' | 'registro', rol?: 'cliente' | 'admin') => {
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    if (modo === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert("Error: " + error.message);
        } else if (data.session) {
            localStorage.setItem('token', data.session.access_token);
            localStorage.setItem('user_role', rol || 'cliente');
            cargarSistema(rol || 'cliente');
        }
    }
};

function cargarSistema(rol: string) {
    const loginContainer = document.getElementById('login-container');
    const hero = document.getElementById('hero');
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (hero) hero.style.display = 'none';

    const iframe = document.createElement('iframe');
    iframe.className = 'iframe-container';
    
    // Rutas según rol
    iframe.src = (rol === 'admin') ? '/modulo_angular/index.html' : '/modulo_vue/index.html';
    
    document.body.appendChild(iframe);
}
