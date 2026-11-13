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
# Desde la raíz: inicia los cuatro módulos y su integración
npm run dev

# Abre http://localhost:5173/
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
3. La sesión de Supabase se persiste y renueva automáticamente en `localStorage`.
4. Los módulos comparten esa sesión bajo el mismo origen; el token renovado también se sincroniza con los módulos que aún usan peticiones REST.
5. No fijes el access token en un header global: eso impide usar el token renovado y produce errores `JWT expired`.

### Implementación en Módulos

**React (verificación de sesión):**
```typescript
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

Crear un único archivo `.env` en la raíz del proyecto. React y Vue lo comparten; el panel Angular recibe esos mismos datos desde la contenedora:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Cotización por imagen, citas y abonos

1. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` apunten al mismo proyecto de Supabase. En el SQL Editor de ese proyecto, aplica `supabase/schema.sql` solo si aún no existe el esquema base y después aplica `supabase/appointment-design-payment-chat-discounts.sql`. Este último también crea y carga con los tatuadores históricos la lista `artists`, además de asignar equitativamente las solicitudes automáticas. Si ya aplicaste una versión anterior de esa migración, vuelve a ejecutar la versión actualizada: está preparada para volver a correrse.
   - Para habilitar la administración de citas y la protección contra cambios obsoletos del taller de la semana 10, aplica también `supabase/admin-appointments-management.sql`. El panel guarda los cambios mediante RPC autenticadas; no requiere una política de actualización directa sobre `appointments`.
   - El catálogo anterior guardado en el navegador se migra al catálogo compartido cuando el administrador inicia sesión y abre Catálogo; no borres los datos locales del navegador antes de esa migración.
   - Comprueba que la tabla `artists` tenga al menos un tatuador activo. La migración agrega los tres nombres históricos usados por el proyecto sin borrar los registros ya existentes.
2. Despliega la función y configura la clave en Supabase (requiere Supabase CLI y una cuenta del proyecto):
   ```bash
   supabase functions deploy analyze-tattoo
   supabase secrets set OPENAI_API_KEY=tu_clave
   ```
   No agregues `OPENAI_API_KEY` a variables `VITE_*` ni al navegador. La imagen se envía al proveedor de IA para analizar estilo, colores, líneas, sombras y complejidad; solo se guarda en Storage cuando el cliente envía la solicitud de cita.
3. En el panel admin, configura la cuenta de Banco Pichincha y el monto fijo del abono. El cliente debe adjuntar una referencia (foto o diseño del catálogo) y el comprobante para enviar la solicitud. La cita queda pendiente hasta que el admin verifique la transferencia en el banco y la confirme en el panel.
4. Cliente y admin pueden negociar por el chat de la cita. Después del acuerdo, el admin crea un código de un solo uso con el precio final; al aplicarlo, el cliente ve el precio anterior y el nuevo.

La lectura de un comprobante no demuestra que la transferencia ocurrió; la confirmación de pagos de Banco Pichincha es manual en este flujo. La cotización de IA es orientativa y el tatuador confirma el precio final.

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

Para preguntas técnicas sobre la integración, revisar `/docs` o contactar al equipo.

---

**Última actualización**: Julio 2026 | **Versión**: 1.0.0
