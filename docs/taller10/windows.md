# Nota de ejecución en Windows

En Windows, el servidor de desarrollo de Angular llegó a fallar con `ERR_WORKER_OUT_OF_MEMORY` cuando quedaban aproximadamente 0,4–0,5 GB de memoria física disponible. Al liberar recursos y volver a iniciar el proyecto con `npm run dev`, Angular compiló y las rutas integradas respondieron correctamente.

No se cambió código para ocultar el error ni se aumentó el límite del worker. Si vuelve a ocurrir, cierra aplicaciones que no necesites y vuelve a ejecutar `npm run dev`.
