# INK & IRON Studio - Sistema Integrado

**Un estudio de tatuajes profesional con arquitectura modular integrada**

## 📋 Descripción del Proyecto

Sistema de gestión para estudio de tatuajes que integra:
- 🎨 **React**: Catálogo profesional de diseños y galería
- 📅 **Vue**: Sistema de reservas y bookings
- ⚙️ **Angular**: Panel administrativo para artistas

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│         CONTENEDORA VITE (Login + Menú)                │
│  (Autenticación Supabase + localStorage compartido)     │
└──────────────┬──────────────┬───────────────┬───────────┘
               │              │               │
        ┌──────▼────┐  ┌─────▼────┐  ┌──────▼────────┐
        │  REACT    │  │   VUE    │  │    ANGULAR    │
        │ Catálogo  │  │ Reservas │  │     Admin     │
        │   /react/ │  │  /vue/   │  │   /angular/   │
        └───────────┘  └──────────┘  └───────────────┘
               │              │               │
        └──────▴──────────────▴───────────────▴───────────
                     SUPABASE (BD compartida)
```

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
cd modulo-react && npm install && cd ..
cd modulo_vue && npm install && cd ..
cd modulo_angular && npm install && cd ..
```

### Desarrollo
```bash
# Terminal 1: Contenedora (puerto 5173)
npm run dev

# Terminal 2: React (si deseas HMR independiente - puerto 5174)
cd modulo-react && npm run dev

# Terminal 3: Vue (si deseas HMR independiente - puerto 5176)
cd modulo_vue && npm run dev

# Terminal 4: Angular (si deseas HMR independiente - puerto 4200)
cd modulo_angular && npm run dev
```

### Build para Producción
```bash
npm run build
# Genera: dist/ con estructura de subcarpetas
```

## 🔐 Autenticación

### Flujo
1. Usuario ingresa en login de contenedora
2. Supabase autentica y devuelve token
3. Token se guarda en `localStorage`
4. Módulos leen token de localStorage (mismo dominio = acceso compartido)
5. Módulos envían token en headers de Supabase

### Implementación en Módulos

**React (App.tsx - verificación de token):**
```typescript
// En main.tsx antes de renderizar
const token = localStorage.getItem('token');
if (!token) window.location.href = '/';
```

**Vue (router/index.ts - navigation guard):**
```typescript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = '/';
  next();
});
```

**Angular (Guard de ruta):**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate() {
    if (!localStorage.getItem('token')) {
      window.location.href = '/';
      return false;
    }
    return true;
  }
}
```

## 📁 Estructura de Carpetas

```
repo-emprendimiento/
├── index.html              # Login + menú principal
├── main.ts                 # Punto de entrada Vite
├── vite.config.ts          # Configuración contenedora
├── package.json            # Dependencias raíz
│
├── lib/
│   ├── supabase.ts         # Cliente Supabase compartido
│   └── auth-utils.ts       # Utilidades de autenticación
│
├── modulo-react/           # Catálogo (Vite + React)
│   ├── index.html
│   ├── vite.config.ts      # base: '/react/'
│   ├── src/
│   │   ├── main.tsx
│   │   └── App.tsx         # HashRouter configurado
│   └── package.json
│
├── modulo_vue/             # Reservas (Vite + Vue)
│   ├── index.html
│   ├── vite.config.ts      # base: '/vue/'
│   ├── src/
│   │   ├── main.ts
│   │   ├── router/
│   │   │   └── index.ts    # createWebHashHistory
│   │   └── App.vue
│   └── package.json
│
├── modulo_angular/         # Admin (Angular CLI)
│   ├── src/
│   │   ├── index.html      # base: '/angular/'
│   │   ├── main.ts
│   │   └── app/
│   │       ├── app.config.ts # withHashLocation()
│   │       └── app.routes.ts
│   ├── angular.json
│   └── package.json
│
└── dist/                   # Build final (estructura desplegable)
    ├── index.html
    ├── assets/
    ├── react/
    ├── vue/
    └── angular/
```

## 🔧 Configuración Importante

### 1. Vite Config React (`modulo-react/vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/react/',
  build: { outDir: '../dist/react' }
});
```

### 2. Vite Config Vue (`modulo_vue/vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [vue()],
  base: '/vue/',
  build: { outDir: '../dist/vue' }
});
```

### 3. React Router (`modulo-react/src/App.tsx`)
```typescript
import { HashRouter } from 'react-router-dom';

export default function App() {
  return (
    <HashRouter>
      {/* rutas */}
    </HashRouter>
  );
}
```

### 4. Vue Router (`modulo_vue/src/router/index.ts`)
```typescript
import { createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory('/vue/'),
  routes
});
```

### 5. Angular (`modulo_angular/src/app/app.config.ts`)
```typescript
import { withHashLocation } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation())
  ]
};
```

## 📦 Dependencias Clave

- **Vite 5**: Build tool para contenedora, React y Vue
- **Angular 19**: Framework para admin
- **React 19**: Librería UI para catálogo
- **Vue 3**: Framework progresivo para reservas
- **Supabase**: Backend y autenticación
- **Tailwind CSS**: Estilos de la contenedora
- **React Router DOM**: Enrutamiento React (con HashRouter)
- **Vue Router**: Enrutamiento Vue (con createWebHashHistory)

## 🌐 Rutas de Producción

Cuando se despliega en producción, la estructura es:

- `https://app.example.com/` → Contenedora (login + menú)
- `https://app.example.com/#/` → Inicio
- `https://app.example.com/react/#/` → Catálogo React
- `https://app.example.com/vue/#/` → Reservas Vue
- `https://app.example.com/angular/#/` → Admin Angular

## 🔑 Variables de Entorno

Crear archivo `.env` en raíz y en cada módulo:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 📱 Responsive Design

- ✅ Contenedora: Tailwind CSS (mobile-first)
- ✅ React: CSS Modules + Tailwind
- ✅ Vue: CSS scoped + Tailwind
- ✅ Angular: Material Design + Tailwind

## 🚢 Deploy (Netlify/Vercel)

### Paso 1: Build local
```bash
npm run build
```

### Paso 2: Subir `dist/` a Netlify Drop
O conectar repositorio a Vercel y configurar:
- Build command: `npm run build`
- Publish directory: `dist/`

### Paso 3: Configurar redirecciones (Netlify)
Crear `dist/_redirects`:
```
/* /index.html 200
```

O en `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 📚 Decisiones y Aprendizajes

### División de Módulos
- **React** → Catálogo/Galería (reactividad rápida, componentes visuales)
- **Vue** → Reservas/Bookings (formularios, state management sencillo)
- **Angular** → Admin (estructura robusta, RxJS para datos complejos)

### Desafíos Técnicos
1. **Enrutamiento compartido** → Solucionado con Hash History (sin config de servidor)
2. **Autenticación compartida** → localStorage compartido bajo mismo dominio
3. **Build modular** → Script copy-dist.js organiza estructura

### Qué Harías Distinto
- Usar monorepo (Nx, Turbo) para mejor manejo de dependencias
- Implementar shared components library con Web Components
- Agregar E2E tests con Playwright
- Configurar CI/CD automático (GitHub Actions)
- Usar MCP (Micro Frontend) para mejor aislamiento

## 👥 Integrantes y Módulos

| Integrante | Módulo | Responsabilidades |
|-----------|--------|------------------|
| Jandry Paul | React | Catálogo, Galería |
| Rosanna Annabell | Vue | Reservas, Bookings |
| Jose Gabriel | Angular | Admin, Gestión |

## 📞 Soporte

Para preguntas técnicas sobre la integración, revisar `/doc` o contactar al equipo.

---

**Última actualización**: Julio 2026 | **Versión**: 1.0.0

