# CV personal con Docker Compose

Aplicación web de currículum personal de **Daniel Alberto Flores
Uriona**. El frontend está desarrollado con React y Vite, obtiene los
datos desde una API Node.js y esta API consulta MySQL. Docker Compose
coordina los tres servicios.

## Tecnologías

- **Frontend:** React y Vite, servido en producción por Nginx
  `1.27-alpine`.
- **Backend:** API Node.js `20-alpine`.
- **Base de datos:** MySQL `8.0`.
- **Orquestación:** Docker Compose, red compartida `cv_network` y
  volumen persistente `mysql_data`.

## Funcionalidad

- Muestra los datos personales y las cuatro formaciones académicas.
- Obtiene los datos del currículum desde la API y la base de datos.
- Permite consultar la API del currículum y comprobar la conexión con
  MySQL.
- Inicializa las tablas y los datos mediante un script SQL cuando
  MySQL crea por primera vez un directorio de datos vacío.
- Conserva los datos de MySQL en el volumen persistente cuando se
  reinician o recrean los contenedores sin eliminar el volumen.

## Estructura del proyecto

```text
cv-docker/
├── backend/                 # API Node.js y Dockerfile
├── database/
│   └── init/
│       └── 01-init.sql      # Creación de tablas y datos iniciales
├── frontend/                # React, Vite, Nginx y Dockerfile
├── compose.yaml
├── .env.example
├── .gitignore
├── EVIDENCIAS.md
└── README.md
```

## Requisitos

- Docker Desktop instalado y en ejecución, con Docker Compose
  disponible.
- Puertos `3000`, `3306` y `4000` disponibles.
- No es necesario instalar Node.js ni MySQL directamente en el equipo
  para ejecutar los servicios mediante Docker.

## Configuración local

El archivo `.env` contiene las variables locales de conexión a MySQL.
Debe permanecer fuera del control de versiones porque puede contener
contraseñas. `.env.example` sirve como referencia de configuración.

Si ya tienes configurado el proyecto, conserva tu `.env` actual. Para
preparar una copia nueva, crea `.env` a partir de `.env.example` y
verifica sus valores antes de iniciar los servicios.

El usuario de Docker Hub asociado a las imágenes de este proyecto es
**`nidafu21`**. Los nombres de imagen previstos para la publicación son:

- `nidafu21/flores-frontend:v1`
- `nidafu21/flores-backend:v1`

## Ejecutar el proyecto

Desde una terminal ubicada en la carpeta raíz `cv-docker`, ejecuta:

```bash
docker compose up -d --build
```

Comprueba el estado de los servicios:

```bash
docker compose ps
```

El archivo `compose.yaml` define tres servicios: `frontend`, `backend` y
`database`. Comparten la red `cv_network`. MySQL utiliza el volumen
`mysql_data`; el backend espera a que la base de datos esté disponible y
reintenta la conexión si es necesario.

## Aplicación y API

Con los contenedores activos, abre estas direcciones:

- **Aplicación web:** <http://localhost:3000>
- **API del currículum:** <http://localhost:4000/cv>
- **API mediante el proxy del frontend:**
  <http://localhost:3000/api/cv>
- **Comprobación de conexión con MySQL:**
  <http://localhost:4000/health>

El frontend solicita `/api/cv`. Nginx reenvía la solicitud al backend
dentro de la red Docker. La respuesta de la API incluye los datos de la
persona y sus cuatro formaciones académicas.

## Verificar MySQL

Abre la consola de MySQL desde el contenedor:

```bash
docker compose exec database mysql -u cv_user -p cv_personal
```

Introduce la contraseña configurada en `.env`. En el indicador `mysql>`,
ejecuta:

```sql
SHOW TABLES;
SELECT * FROM persona;
SELECT * FROM formacion;
```

La base de datos contiene las tablas `persona` y `formacion`. El archivo
`database/init/01-init.sql` crea la estructura, establece la relación
entre las tablas e inserta los datos iniciales: una persona y cuatro
formaciones.

Los scripts de `/docker-entrypoint-initdb.d` se ejecutan al inicializar
un directorio de datos vacío. No vuelven a ejecutarse automáticamente si
el volumen `mysql_data` ya contiene la base de datos.

## Registros de los servicios

```bash
docker compose logs database backend frontend
```

Para mostrar solo las últimas líneas:

```bash
docker compose logs --tail=50 database backend frontend
```

## Detener los servicios

Para detener y eliminar los contenedores conservando los datos de MySQL:

```bash
docker compose down
```

Para volver a iniciar el proyecto:

```bash
docker compose up -d
```

## Repositorio del código fuente

**Repositorio GitHub:** https://github.com/NIDAFU21/cv-docker
