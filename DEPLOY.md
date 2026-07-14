# 📦 Guía de Despliegue - INK & IRON Studio

## Opciones de Despliegue

### Opción 1: Netlify (Recomendado para Desarrollo)

#### Paso 1: Preparar Build Local
```bash
# En la raíz del proyecto
npm install
npm run build
```

#### Paso 2: Deploy en Netlify Drop
1. Ir a [app.netlify.com](https://app.netlify.com)
2. Arrastrar carpeta `dist/` al Netlify Drop
3. ¡Listo! Tu app está en vivo en URL tipo: `https://xyz123.netlify.app`

#### Paso 3: Verificar Funcionalidad
- Prueba login en `https://xyz123.netlify.app`
- Navega a `/react/#/` para catálogo
- Navega a `/vue/#/` para reservas
- Navega a `/angular/#/` para admin (si eres admin)

### Opción 2: Vercel (Recomendado para Producción)

#### Paso 1: Conectar Repositorio
1. Ir a [vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub
3. Vercel detecta automáticamente Vite

#### Paso 2: Configurar Build
```
Build Command:     npm run build
Publish Directory: dist
```

#### Paso 3: Configurar Redirecciones
Crear `vercel.json` en raíz:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Paso 4: Deploy
- Vercel despliega automáticamente en `https://tu-proyecto.vercel.app`

### Opción 3: Heroku (Legacy)

```bash
# Crear app
heroku create tu-app-nombre

# Configurar buildpack
heroku buildpacks:add heroku/nodejs

# Deploy
git push heroku main
```

### Opción 4: Docker + AWS/Google Cloud

Crear `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Crear `nginx.conf`:
```nginx
events { worker_connections 1024; }
http {
  server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
      try_files $uri $uri/ /index.html;
    }
  }
}
```

Build y push:
```bash
docker build -t ink-iron .
docker push your-registry/ink-iron:latest
```

## Verificación Pre-Despliegue

```bash
# 1. Build local completo
npm run build

# 2. Probar build local
npm run preview

# 3. Verificar estructura dist/
tree dist/
# Debe mostrar:
# dist/
# ├── index.html
# ├── assets/
# ├── react/
# ├── vue/
# └─ angular/

# 4. Probar desde otro navegador/dispositivo
# (no usar localhost, usar IP local 192.168.x.x:4173)
```

## Solución de Problemas

### ❌ "No se encuentra /react/ o /vue/"
**Solución**: Verificar que `build` compila todos los módulos
```bash
npm run build
ls -la dist/
# Debe mostrar: react/, vue/, angular/
```

### ❌ "Error 401 - No autorizado"
**Solución**: El token no se está compartiendo entre módulos
```javascript
// Verificar en DevTools:
// Abre Console en iframe y ejecuta:
console.log(localStorage.getItem('token'));
// Debe mostrar token válido
```

### ❌ "Rutas no funcionan (404)"
**Solución**: Hash routing no está configurado
```bash
# Verificar que las URLs tengan #:
# ✅ Correcto: /react/#/productos
# ❌ Incorrecto: /react/productos
```

### ❌ "CORS error en Supabase"
**Solución**: Configurar CORS en Supabase
1. Ir a Supabase Dashboard → Configuración
2. En CORS, agregar URL de deploy: `https://tu-url.vercel.app`

## Variables de Entorno

Crear `.env.production` en raíz (no subir a git):
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
NODE_ENV=production
```

## Monitoreo Post-Despliegue

### Google Analytics (Recomendado)
Agregar a `index.html` <head>:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

### Sentry para Error Tracking
```bash
npm install @sentry/react
```

```typescript
// En main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xyz@sentry.io/123456",
  environment: "production"
});
```

### Health Check
Crear endpoint simple en contenedora:
```typescript
// En index.html o main.ts
window.healthCheck = () => ({
  timestamp: new Date().toISOString(),
  auth: !!localStorage.getItem('token'),
  modules: ['react', 'vue', 'angular']
});
```

Verificar: `curl https://tu-app.com/health`

## Actualizar en Producción

```bash
# Pull cambios
git pull origin main

# Build
npm run build

# Para Netlify: arrastrar dist/ nuevamente
# Para Vercel: push a repo (deploy automático)

# Para Docker:
docker build -t ink-iron:v2 .
docker push your-registry/ink-iron:v2
# Actualizar deployment en cloud
```

## Checklist de Seguridad

- ✅ No exponer credenciales Supabase (usar VITE_SUPABASE_ANON_KEY, no SECRET)
- ✅ Habilitar RLS en Supabase
- ✅ Configurar CORS correctamente
- ✅ HTTPS obligatorio
- ✅ Headers de seguridad (Netlify/Vercel lo hacen automático)
- ✅ Validar tokens en backend
- ✅ Limpiar localStorage en logout

## Rollback de Emergencia

```bash
# Vercel: un click en Dashboard → Deployments
# Netlify: site settings → deploys → revert to previous
# Docker: `docker run --rm -d old-image-id`
```

---

**Última actualización**: Julio 2026 | Para soporte: revisar README.md
