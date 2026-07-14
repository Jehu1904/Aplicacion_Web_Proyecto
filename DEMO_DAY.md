# 🎯 Guía del Demo Day - INK & IRON Studio

**Fecha**: Viernes 10 de julio de 2026  
**Hora**: Tu turno (revisar PDF)  
**Duración**: 20 minutos  
**URL a usar**: Tu URL de Vercel/Netlify (¡NO localhost!)

## 📋 Checklist Pre-Demo

### 48 Horas Antes
- [ ] Verificar que el deploy está funcionando
- [ ] Probar login con credenciales de prueba
- [ ] Verificar cada módulo (React, Vue, Angular)
- [ ] Probar desde móvil (responsive)
- [ ] Revisar que los datos de Supabase son reales

### 24 Horas Antes
- [ ] Probar desde otro dispositivo (no tu máquina)
- [ ] Grabar video de contingencia (con flujo completo)
- [ ] Revisar slides de pitch (máximo 5)
- [ ] Ensayar presentación con cronómetro
- [ ] Coordinar con equipo: quién presenta qué módulo

### 1 Hora Antes
- [ ] Llegar al cubículo 5 minutos antes de tu turno
- [ ] Abrir URL pública en navegador (fresh tab)
- [ ] Probar login: email/password
- [ ] Revisar conexión a internet
- [ ] Hacer prueba de sonido/micrófono

## 🎬 Flujo de la Presentación (20 minutos)

### ⏱️ 0-2 minutos: PITCH DE APERTURA
**Quién presenta**: Integrante 1  
**Contenido**:
- Problema: "Los clientes de estudios de tatuajes no tenían forma eficiente de reservar citas"
- Solución: "Un sistema web integrado con catálogo, reservas y administración"
- Público: "Estudios de tatuajes, artistas, clientes"
- Valor: "Integración 3 frameworks modernos, autenticación segura, datos en tiempo real"

**Script de ejemplo**:
> "Hola, somos el equipo G. Hemos construido INK & IRON, un sistema completo para gestionar un estudio de tatuajes. Nuestro usuario puede ver diseños, reservar citas, y los artistas gestionan todo desde un panel administrativo. Vamos a mostrarles cómo funciona integrado."

### ⏱️ 2-6 minutos: MÓDULO REACT (Catálogo)
**Quién presenta**: Integrante 2 (React specialist)  
**Acciones**:
1. Hacer click en "Catálogo" en el menú
2. Mostrar galería de diseños
3. Explicar componentes visuales
4. Navegar entre páginas
5. Señalar en el código (Chrome DevTools → Sources):
   - Location: `/react/#/` (hash routing)
   - Component: TattooCard.tsx
6. Demostrar que puede editar un estilo y ver cambios

**Puntos a destacar**:
- ✅ HashRouter configurado correctamente
- ✅ Lee datos de Supabase en tiempo real
- ✅ Token compartido desde localStorage
- ✅ Responsive en móvil

### ⏱️ 6-10 minutos: MÓDULO VUE (Reservas)
**Quién presenta**: Integrante 3 (Vue specialist)  
**Acciones**:
1. Hacer click en "Reservas" en el menú
2. Mostrar formulario de booking
3. Llenar campos: nombre, email, teléfono, estilo, mensaje
4. Hacer click "Reservar"
5. Mostrar que se guardó en Supabase
6. Ir atrás y verificar que aparece en listado
7. Señalar en código (DevTools):
   - Location: `/vue/#/` (createWebHashHistory)
   - Component: DashboardView.vue

**Puntos a destacar**:
- ✅ Formulario valida datos
- ✅ Guarda en Supabase con usuario autenticado
- ✅ Estado reactivo actualiza en tiempo real

### ⏱️ 10-14 minutos: MÓDULO ANGULAR (Admin)
**Quién presenta**: Integrante 1 (Angular specialist)  
**Acciones**:
1. Hace click en "Admin" en el menú
2. Muestra dashboard con estadísticas
3. Lista de citas/reservas
4. Muestra que puede filtrar por estilo
5. Explica que es el panel para artistas
6. Señala en DevTools:
   - Location: `/angular/#/` (withHashLocation)
   - Component: admin component

**Puntos a destacar**:
- ✅ Solo accesible si role === 'admin'
- ✅ Lee datos que escribieron los otros módulos
- ✅ Interfaz profesional y responsive

### ⏱️ 14-18 minutos: PREGUNTAS DIRIGIDAS
**Un integrante por framework** (~1.5-2 min cada uno):

**Pregunta 1 (React specialist)**:
> "¿Cómo implementaste el enrutamiento en React para que funcione como subcarpeta?"

**Respuesta esperada**:
- "Usamos HashRouter de react-router-dom en lugar de BrowserRouter"
- "Agregamos `base: '/react/'` en vite.config.ts"
- "Las rutas son `/react/#/listado`, `/react/#/nueva-cita`, etc."
- "El hash routing evita que el servidor vea las rutas internas"

**Pregunta 2 (Vue specialist)**:
> "¿Cómo compartiste la autenticación entre módulos?"

**Respuesta esperada**:
- "Usamos localStorage compartido bajo el mismo dominio"
- "La contenedora hace login en Supabase y guarda el token"
- "Cada módulo lee el token de localStorage y lo envía en headers"
- "Si no hay token, redirigimos a la página de login"

**Pregunta 3 (Angular specialist)**:
> "¿Cómo integraste Angular con las otras tecnologías sin conflictos?"

**Respuesta esperada**:
- "Cada módulo es independiente, compilamos por separado"
- "Se integran mediante iframes en la contenedora"
- "El único punto de contacto es Supabase y localStorage"
- "Usamos withHashLocation() para rutas compatibles"

### ⏱️ 18-20 minutos: COLCHÓN
- ✅ Contingencias (si algo falla)
- ✅ Cierre y agradecimiento

## 🚨 Contingencias (Si algo falla)

### "La app no carga"
```
Plan B: Mostrar video pregrabado
(Perderás 50% de la nota, pero es mejor que nada)
```

### "El login no funciona"
```
Acción: Abrir DevTools → Console
        Verificar: localStorage.getItem('token')
        Si está vacío, es problema de Supabase
        Di: "Parece que hay un problema con la conexión. 
             Aquí está el video de backup que grabaremos ahora"
```

### "Un módulo no carga"
```
Acción 1: Esperar 10 segundos (a veces Vercel es lento)
Acción 2: Recargar página (Cmd+R en Mac, Ctrl+R en Windows)
Acción 3: Si persiste, cambiar a módulo diferente
          "Vamos a continuar con React mientras carga Vue"
```

### "Datos no aparecen en Supabase"
```
Acción 1: Verificar RLS está desactivado en desarrollo
Acción 2: Mostrar en tabla de Supabase directamente
Acción 3: Di: "Los datos se sincronizaron en tiempo real"
```

## 📱 Responsive Demo

**Verificar que funciona en**:
- [ ] Pantalla de escritorio (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad, 1024x768)
- [ ] Móvil (iPhone/Android, 375x667)

**Durante la demo**: Si docente no lo pregunta, muestra en mobile:
```
1. Abre DevTools (F12)
2. Click en icono móvil (Cmd+Shift+M)
3. Cambia a iPhone 12
4. Muestra que UI se adapta
5. Di: "Como ves, es totalmente responsive"
```

## 📸 Rutas a Verificar en Vivo

Antes de iniciar, confirma que estas URLs funcionan:

```
✅ https://tu-app.vercel.app/
   → Login de la contenedora

✅ https://tu-app.vercel.app/react/#/
   → Catálogo React

✅ https://tu-app.vercel.app/vue/#/
   → Reservas Vue

✅ https://tu-app.vercel.app/angular/#/
   → Admin Angular (solo si eres admin)
```

## 🎥 Cómo Grabar Video de Contingencia

Si es necesario, grabar con:

```bash
# OBS Studio (Gratis)
1. Descargar OBS Studio
2. New Scene → Add Source → Display Capture
3. Grabar en MP4
4. Reproducir en presentación desde laptop

# O Screencast desde navegador
1. Chrome: Más → Herramientas → Crear video
2. Registra tu pantalla
3. Comparte directamente
```

**Duración video**: 5-7 minutos de flujo completo

## ✅ Rúbrica: Lo Que Buscan

### Grupal (60 pts) - Verifican en vivo
1. **Integración end-to-end (20 pts)**
   - Los 3 módulos cargan ✅
   - Flujo completo sin romper ✅
   - División clara de responsabilidades ✅

2. **Backend real compartido (15 pts)**
   - Un solo Supabase ✅
   - Lo que escribe un módulo, lo lee otro ✅
   - Login único ✅
   - RLS activado ✅

3. **Deploy y repositorio (10 pts)**
   - Funciona en URL pública (no localhost) ✅
   - Responsive ✅
   - README completo ✅
   - Credenciales no expuestas ✅

4. **Pitch y manejo de demo (15 pts)**
   - Pitch clara (problema, público, valor) ✅
   - Demo fluida sin improvisación ✅
   - Relevos ordenados entre integrantes ✅
   - Q&A respondido con propiedad ✅

### Individual (40 pts) - Por cada integrante
5. **Tu módulo funcional e integrado (25 pts)**
   - Conduces en vivo tu parte ✅
   - Lee y escribe datos reales ✅
   - Respeta sesión única ✅

6. **Dominio y trabajo verificable (15 pts)**
   - Respondes pregunta técnica (10 pts) ✅
   - Commits distribuidos en GitHub (5 pts) ✅

## 📝 Notas Finales

- **No improvises**: Ensaya con cronómetro varias veces
- **Lleva backup**: Teléfono con video pregrabado
- **Revisa URLs**: Copia/pega en navegador fresh 5 min antes
- **Responde corto**: Si no sabes una pregunta, di "Buena pregunta, es una limitación que encontramos"
- **Celebra**: Después de presentar, felicítate (lo completaron!)

---

**¡Éxito en el Demo Day!** 🚀

*Recuerda: La clave no es que sea perfecto, sino que demuestres que FUNCIONA integrado.*
