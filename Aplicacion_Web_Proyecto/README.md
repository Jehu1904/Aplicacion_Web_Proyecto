# Instrucciones para los módulos

1. **Autenticación:** Al iniciar su módulo, lean el token de la raíz:
   `const token = localStorage.getItem('token');`
   Si es nulo, redirijan al usuario a la raíz: `window.parent.location.href = '/';`

2. **Base URL:** En su `vite.config.ts` (o equivalente), deben configurar:
   `base: '/modulo_nombre/'`

3. **Supabase:** Importen la instancia desde `../lib/supabase.ts` (ajusten la ruta según su carpeta).
