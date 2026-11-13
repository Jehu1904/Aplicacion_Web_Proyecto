# Semana 10 · Comprobación de peticiones

> Este registro distingue lo observado de lo que falta verificar. No completar códigos, cuerpos ni resultados de pantalla por anticipado.

En INK & IRON, la administración de citas usa la RPC `update_appointment_for_admin` (`POST /rest/v1/rpc/update_appointment_for_admin`). No se usa un `PATCH` directo a `appointments`: RLS no concede actualización directa y la función comprueba el rol de administrador. Para el caso 5, la función compara atómicamente el estado esperado con el estado actual en Supabase.

Anota el método, la ruta, el código HTTP y el cuerpo que realmente aparezcan en Red. En la columna de pantalla, registra el mensaje y el estado que quedó visible. No incluyas encabezados de autorización, tokens, contraseñas ni claves.

| Caso | Petición observada | Código | Cuerpo de la respuesta | Qué mostró la pantalla |
| --- | --- | --- | --- | --- |
| 1. Con sesión y cambio de estado | `POST /rest/v1/rpc/update_appointment_for_admin` | `200` | `true` | La respuesta `true` se observó en Vista previa. Luego de recargar, el estado cambiado se mantuvo. No se confirmó un mensaje visible. |
| 2. Sin sesión | No se observó la RPC; Network tenía el filtro de esa RPC activo | No observado | No observado | Se mostró el inicio de sesión. La captura filtrada mostró 0 solicitudes coincidentes; no demuestra que no hubiera otras solicitudes. |
| 3. Con sesión sin permiso de administración | No se identificó una petición a la RPC administrativa | No observado | No observado | La sesión de cliente fue redirigida a `/#/home` al abrir `/#/admin`. |
| 4. Token inválido | No realizado | No observado | No observado | No se alteró ni revocó un token para esta prueba. |
| 5. Copia vieja, persona A | `POST /rest/v1/rpc/update_appointment_for_admin` | `200` | `false` | B cambió la cita ficticia de `En diseño` a `Pendiente`; A intentó guardar su copia vieja y mostró: “Otra persona modificó esta cita. Se actualizó el listado; revisa los datos antes de volver a guardar.” Después de recargar, la app y la consulta de solo lectura en Supabase confirmaron el estado final `pendiente`. |

Para el caso 5, Supabase inicialmente rechazó `en diseño` por una restricción que no incluía ese estado. Se actualizó `appointments_status_check` para permitir los cinco estados definidos por el proyecto y luego se comprobó el conflicto entre sesiones.

## Capturas

Hay capturas para los casos 1, 2, 3 y 5 (`caso5-red.png` y `caso5-status.png` muestran por separado la respuesta y el código HTTP; `caso5-supabase.png` muestra el estado final consultado en Supabase; `caso5-final-app.png` muestra el estado tras recargar); `caso4.png` no existe porque el caso no se realizó. Falta una captura del caso 1 donde se vea el estado después de recargar. Revisar y ocultar datos personales antes de agregar evidencia.

## Particularidades del proyecto

- Los casos del ejemplo que indican `PATCH` corresponden a otra aplicación. Registrar aquí las peticiones reales de INK & IRON; no habilitar una política directa de actualización para imitar el ejemplo.
- En la prueba del caso 3, el guard de la aplicación redirigió a la sesión de cliente antes de observar una llamada a la RPC. La autorización del backend no se probó directamente. No borrar ni debilitar políticas RLS para esa prueba.
- Para comprobar el caso 5, `appointments_status_check` debe permitir `en diseño`; la sesión A debe recibir un aviso y actualizar su lista cuando el estado esperado ya no coincide.
- No guardar aquí razonamientos personales del anexo A.
