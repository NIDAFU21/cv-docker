# CV personal con Docker Compose

## Objetivo

Aplicación web que presenta el currículum de Daniel Alberto Flores Uriona. React obtiene la información desde una API Node.js y la API consulta MySQL. Docker Compose coordina los tres servicios.

## Tecnologías

- React y Vite, servido en producción por Nginx `1.27-alpine`.
- API Node.js `20-alpine` y MySQL `8.0`.
- Dockerfiles propios, Docker Compose, una red compartida y un volumen persistente.

## Estructura

```text
cv-docker/
├── backend/                 # API y Dockerfile
├── database/init/           # Inicialización SQL de tablas y datos
├── frontend/                # Aplicación React, Nginx y Dockerfile
├── compose.yaml
├── .env.example
├── .gitignore
├── EVIDENCIAS.md
└── README.md
```

## Requisitos previos

Instalar Docker Desktop con Docker Compose y tener Docker iniciado. No es necesario instalar Node.js ni MySQL en el equipo para ejecutar la aplicación. El puerto 3000, 3306 y 4000 deben estar disponibles.

## Variables de entorno

Copia `.env.example` como `.env` en esta carpeta. El usuario de Docker Hub queda comentado para que el despliegue local use las etiquetas `flores-frontend:v1` y `flores-backend:v1`. Los valores incluidos son ilustrativos para pruebas locales, no son credenciales de Docker Hub ni credenciales para producción. Puedes cambiar las claves locales antes de iniciar los servicios. Mantén `.env` fuera de Git; ya está incluido en `.gitignore`.

`DOCKERHUB_USER` debe descomentarse y reemplazarse por el nombre real de usuario de Docker Hub una vez creada la cuenta. Hasta que existan imágenes publicadas, Compose construye las etiquetas locales desde los Dockerfiles del proyecto.

## Construcción e inicio

Desde la carpeta del proyecto:

```powershell
Copy-Item .env.example .env
# Editar .env y sustituir las claves ilustrativas si se desea
# Para construir explícitamente las dos imágenes locales:
docker compose build
# Iniciar los tres servicios:
docker compose up -d
```

El archivo Compose define exactamente `frontend`, `backend` y `database`. Los servicios comparten la red `cv_network`; MySQL utiliza el volumen `mysql_data`. La base de datos se inicializa automáticamente la primera vez que se crea el volumen. El backend espera la disponibilidad de MySQL y también reintenta la conexión.

Al publicar, las referencias serán `USUARIO_DOCKERHUB/flores-frontend:v1` y `USUARIO_DOCKERHUB/flores-backend:v1`. Descomenta `DOCKERHUB_USER` y reemplaza el marcador por el usuario real; Compose usará esas referencias y las construirá si aún no están descargadas.

## Comprobación

Ver el estado de los contenedores:

```powershell
docker compose ps
```

Revisar los registros:

```powershell
docker compose logs database backend frontend
```

Abrir la aplicación en [http://localhost:3000](http://localhost:3000). El frontend llama a `/api/cv`; Nginx reenvía esa ruta al backend dentro de la red Docker.

Consultar la API directamente en [http://localhost:4000/cv](http://localhost:4000/cv) o mediante el proxy de Nginx en [http://localhost:3000/api/cv](http://localhost:3000/api/cv). La respuesta debe incluir la persona y sus cuatro formaciones. El endpoint [http://localhost:4000/health](http://localhost:4000/health) comprueba la conexión a MySQL.

Verificar las tablas y filas desde el contenedor:

```powershell
docker compose exec database mysql -u cv_user -p cv_personal
```

Ingresa la clave configurada en `.env`, luego ejecuta:

```sql
SHOW TABLES;
SELECT * FROM persona;
SELECT * FROM formacion;
```

La persona y las cuatro filas de formación se insertan desde `database/init/01-init.sql`. La imagen oficial de MySQL ejecuta estos scripts solamente cuando inicializa un directorio de datos vacío.

## Detener y reinicializar

Detener y conservar la base de datos:

```powershell
docker compose down
```

Para volver a ejecutar el SQL de inicialización en pruebas, elimina el volumen y crea los servicios de nuevo:

```powershell
docker compose down -v
docker compose up -d
```

**Aviso:** `docker compose down -v` elimina el volumen `mysql_data` y borra permanentemente los datos que contiene. No lo uses si necesitas conservar cambios.

## Publicación en Docker Hub

1. Crear una cuenta personal en [Docker Hub](https://hub.docker.com/).
2. Descomentar `DOCKERHUB_USER` en `.env` y reemplazar `USUARIO_DOCKERHUB` por el usuario real de esa cuenta.
3. Iniciar sesión desde la terminal: `docker login -u TU_USUARIO`. Completar la autenticación en el flujo oficial; no guardar tokens ni contraseñas en el proyecto.
4. Construir las imágenes con los nombres requeridos:

   ```powershell
   docker build -t TU_USUARIO/flores-frontend:v1 ./frontend
   docker build -t TU_USUARIO/flores-backend:v1 ./backend
   ```

5. Publicarlas:

   ```powershell
   docker push TU_USUARIO/flores-frontend:v1
   docker push TU_USUARIO/flores-backend:v1
   ```

6. Comprobar en Docker Hub que los repositorios `flores-frontend` y `flores-backend` aparecen en la cuenta y muestran la etiqueta `v1`. También se puede comprobar con `docker pull TU_USUARIO/flores-frontend:v1` y `docker pull TU_USUARIO/flores-backend:v1`.
7. Después de publicar, volver a ejecutar `docker compose up -d` para usar las etiquetas configuradas. Actualizar primero `DOCKERHUB_USER` en `.env`.

El proyecto no incluye una URL de GitHub ni afirma publicación alguna. Completa la URL del repositorio una vez creado y subido.

## Pendientes para la entrega

- Sustituir `FOTO_PENDIENTE` por una fotografía personal en `frontend/public/` y actualizar la ruta `foto` en el SQL si se cambia el nombre del archivo. No hace falta modificar el backend.
- Crear la cuenta de Docker Hub, publicar las dos imágenes y registrar capturas reales.
- Crear y subir el repositorio de GitHub.
- Reunir las evidencias reales y elaborar el PDF académico según la lista de `EVIDENCIAS.md`.
- Ejecutar las pruebas de Docker y navegación en el equipo donde Docker Desktop esté operativo.

## Resultados de validación del entorno de preparación

Validaciones observadas en el entorno de preparación: `docker compose config --quiet` aceptó la configuración y mostró exactamente tres servicios con las imágenes locales esperadas; `node --check backend/server.js` no reportó errores; las dependencias npm del frontend y backend se instalaron. La compilación React no terminó porque esbuild recibió `Access is denied` al recorrer directorios superiores al espacio de trabajo. El CLI de Docker está instalado, pero `docker info` no pudo conectar con el daemon (`docker_engine` no existe). Por estas limitaciones no se han construido imágenes, iniciado contenedores, conectado a MySQL ni comprobado el navegador. Consulta `EVIDENCIAS.md` para el estado de cada evidencia.
