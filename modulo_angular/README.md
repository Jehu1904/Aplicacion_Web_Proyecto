# Módulo Angular - Panel Administrador

## 1. Introducción

Este documento describe la implementación del módulo administrador desarrollado en Angular para el proyecto Manta Tattoo Co.

El objetivo del módulo es gestionar la operación interna del estudio desde un panel centralizado, con énfasis en la administración de citas, control de estados, métricas de negocio y persistencia local.

## 2. Objetivos

1. Implementar un panel administrativo funcional y validable en entorno académico.
2. Permitir gestión completa de citas: creación, edición, confirmación y eliminación.
3. Mostrar indicadores clave de operación para toma de decisiones.
4. Garantizar acceso controlado por rol administrador.
5. Mantener trazabilidad de pruebas con build y tests automatizados.

## 3. Alcance del módulo

Este módulo cubre exclusivamente el rol Administrador.

Incluye:

1. Pantalla de acceso administrativo.
2. Dashboard con tarjetas KPI.
3. CRUD de citas con persistencia en localStorage.
4. Filtros por estado y búsqueda por cliente/tatuador con Enter.
5. Exportación CSV e impresión del panel.

No incluye en esta fase:

1. Integración visual final de todos los módulos en una sola contenedora.
2. Flujo completo de cliente (Vue/React) dentro de este repositorio.

## 4. Requisitos técnicos

1. Node.js 18 o superior.
2. npm.
3. Visual Studio Code (recomendado).

## 5. Instalación y ejecución

Desde la carpeta del módulo:

```powershell
cd Aplicacion_Web_Proyecto/modulo_angular
npm install
npm start
```

URL local:

```text
http://localhost:4200
```

## 6. Scripts disponibles

```powershell
npm start
npm run build
npm run test -- --watch=false
```

## 7. Credenciales y sesión

Credenciales actuales de administrador:

1. Usuario: admin
2. Clave: admin123

Clave de sesión compartida para integración con contenedora:

```text
mtc_session
```

Formato esperado:

```json
{
  "user": "admin",
  "role": "admin",
  "authenticated": true
}
```

## 8. Requisitos funcionales implementados

1. RF-01 Acceso administrador protegido por guard.
2. RF-02 Registro de citas con campos de negocio.
3. RF-03 Edición de citas existentes.
4. RF-04 Eliminación de citas.
5. RF-05 Confirmación rápida de cita con un clic.
6. RF-06 Búsqueda por cliente o tatuador al presionar Enter.
7. RF-07 Filtro por estado de cita.
8. RF-08 Exportación de resultados filtrados a CSV.
9. RF-09 Impresión del panel con estilos optimizados.
10. RF-10 Cálculo de KPIs en tiempo real.

## 9. KPIs implementados

1. Total de citas.
2. Citas confirmadas.
3. Citas pendientes.
4. Citas en diseño.
5. Citas canceladas.
6. Ingresos confirmados.
7. Ticket promedio.
8. Citas programadas en las próximas 72 horas.

## 10. Estructura del módulo

```text
modulo_angular/
  src/app/
    views/
      acceso/
      admin/
    services/
      acceso.service.ts
      citas.ts
    models/
      cita.model.ts
    acceso.guard.ts
    app.routes.ts
```

## 11. Persistencia y datos de prueba

La información se almacena en localStorage.

Claves principales:

1. moduloAngularCitas
2. mtc_session

El módulo incluye una base predeterminada de citas con múltiples estados, diseñada para validar:

1. Búsqueda.
2. Filtros.
3. Reportes.
4. Exportación.
5. Flujo de confirmación.

Si no se ven los datos nuevos:

```javascript
localStorage.removeItem('moduloAngularCitas');
location.reload();
```

## 12. Evidencias sugeridas para entrega

1. Captura de login exitoso de administrador.
2. Captura del dashboard con KPIs visibles.
3. Captura de búsqueda por Enter y resultados filtrados.
4. Captura del cambio de estado con botón Confirmar cita.
5. Archivo CSV exportado como evidencia de reporte.
6. Captura de consola/terminal con build y test exitosos.

## 13. Resultados de validación

Validaciones ejecutadas:

1. Build del módulo: exitoso.
2. Pruebas unitarias: exitosas.

## 14. Conclusiones

1. El módulo administrador cumple el alcance definido para la fase actual.
2. Se implementó un flujo operativo completo para gestión de citas y control de métricas.
3. El módulo queda preparado para integrarse posteriormente con la contenedora principal del proyecto.

## 15. Trabajo futuro

1. Integración final con login Supabase en la contenedora raíz.
2. Enlace formal con módulos Vue y React según rol.
3. Exportación adicional a PDF con librería dedicada (opcional).
