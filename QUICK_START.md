# 🚀 Quick Start - INK & IRON Studio

## Instalación Rápida (5 minutos)

```bash
# 1. Clonar y entrar
cd repo-emprendimiento

# 2. Instalar dependencias
npm install
cd modulo-react && npm install && cd ..
cd modulo_vue && npm install && cd ..
cd modulo_angular && npm install && cd ..

# 3. Listo!
```

## Desarrollo Local

```bash
# Terminal 1: Contenedora + preview de otros módulos
npm run dev
# Abre: http://localhost:5173

# Terminal 2 (opcional): React con HMR
cd modulo-react && npm run dev

# Terminal 3 (opcional): Vue con HMR
cd modulo_vue && npm run dev

# Terminal 4 (opcional): Angular
cd modulo_angular && npm run dev
```

## Build & Deploy

```bash
# Build completo (genera dist/)
npm run build

# Preview local del build
npm run preview

# Verificar configuración
npm run verify

# Deploy a Netlify Drop:
# 1. npm run build
# 2. Arrastrar dist/ a netlify.com
```

## Credenciales de Prueba

```
Email:    test@inkiorn.com
Password: TestPassword123!

Rol: cliente (para módulos públicos)
```

## Para Acceso Admin

```
Email:    admin@inkiorn.com
Password: AdminPassword123!

Rol: admin (acceso a /angular/#/)
```

## Estructura Rápida

```
repo-emprendimiento/
├── index.html          ← Login y menú
├── main.ts             ← Entry point Vite
├── lib/
│   ├── supabase.ts     ← Cliente compartido
│   └── auth-utils.ts   ← Helpers
│
├── modulo-react/       ← Catálogo
│   ├── vite.config.ts  → base: '/react/'
│   └── src/App.tsx     → HashRouter
│
├── modulo_vue/         ← Reservas
│   ├── vite.config.ts  → base: '/vue/'
│   └── src/router/...  → createWebHashHistory
│
├── modulo_angular/     ← Admin
│   ├── src/
│   │   └── app/app.config.ts → withHashLocation()
│
└── dist/               ← Build final para deploy
    ├── index.html
    ├── react/
    ├── vue/
    └── angular/
```

## URLs en Desarrollo

```
http://localhost:5173/          → Contenedora (login)
http://localhost:5173/react/#/  → React (dentro de iframe)
http://localhost:5173/vue/#/    → Vue (dentro de iframe)
http://localhost:5173/angular/# → Angular (dentro de iframe)
```

## Archivos Importantes Modificados

| Archivo | Cambio |
|---------|--------|
| `modulo-react/vite.config.ts` | Agregado `base: '/react/'` |
| `modulo-react/src/App.tsx` | Cambio: `BrowserRouter` → `HashRouter` |
| `modulo_vue/vite.config.ts` | Base `/vue/` configurado |
| `modulo_vue/src/router/index.ts` | Cambio: `createWebHistory` → `createWebHashHistory` |
| `modulo_angular/src/app/app.config.ts` | Agregado `withHashLocation()` |
| `modulo_angular/src/index.html` | Base href: `/angular/` |
| `index.html` | Nueva contenedora profesional |

## Agregar Token a Headers (Ejemplo)

```typescript
// React
const token = localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Vue
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};

// Angular
getAuthHeaders(): { [key: string]: string } {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}
```

## Autenticación (localStorage compartido)

```javascript
// Contenedora: Guardar después de login
localStorage.setItem('token', data.session.access_token);
localStorage.setItem('user_email', email);
localStorage.setItem('user_role', rol); // 'cliente' o 'admin'

// Módulos: Leer token
const token = localStorage.getItem('token');
if (!token) window.location.href = '/'; // Redirigir si no hay sesión

// Logout (desde cualquier módulo)
localStorage.removeItem('token');
localStorage.removeItem('user_email');
localStorage.removeItem('user_role');
window.location.href = '/'; // Volver a login
```

## Troubleshooting Rápido

```bash
# ❌ "No funciona el build"
npm install  # Reinstalar
rm -rf node_modules dist  # Limpiar
npm run build

# ❌ "Módulos no cargan"
npm run verify  # Verificar setup

# ❌ "Token no se comparte"
# Abrir DevTools → Console
localStorage.getItem('token')  # Debe mostrar token válido

# ❌ "Rutas no funcionan"
# Verificar que sean hash routes:
✅ Correcto: /react/#/productos
❌ Incorrecto: /react/productos

# ❌ "CORS error"
# Ir a Supabase → Settings → CORS
# Agregar tu dominio: https://tu-app.vercel.app
```

## Comandos útiles

```bash
# Limpiar build anterior
rm -rf dist

# Limpiar node_modules
rm -rf node_modules
npm install

# Ver estructura de dist/
tree dist/  # Si tienes tree instalado
ls -la dist/

# Verificar que funciona localmente
npm run build
npm run preview
# Abre http://localhost:4173

# Grabar video de pantalla (macOS)
brew install ffmpeg
ffmpeg -f avfoundation -list_devices short
ffmpeg -f avfoundation -i 1 output.mp4
```

## Para el Demo Day

```bash
# 1. Día anterior
npm run verify      # ✅ Todo verde?
npm run build       # ✅ Compila sin errores?

# 2. Mañana de la demo
npm run preview     # Prueba en http://localhost:4173
# Desde OTRO navegador, no Chrome

# 3. Durante demo
# Usa URL de producción, NO localhost
# https://tu-app.vercel.app

# 4. Contingencia
# Abre video pregrabado desde laptop
```

## Recursos

- 📖 [README.md](README.md) - Documentación completa
- 🚀 [DEPLOY.md](DEPLOY.md) - Guía de despliegue
- 🎯 [DEMO_DAY.md](DEMO_DAY.md) - Guía de presentación
- 📋 PDF de requisitos en la carpeta `/doc`

---

**Última actualización**: Julio 2026

*Para preguntas técnicas: Lee README.md primero* 🔍
