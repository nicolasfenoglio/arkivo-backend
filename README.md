# Arkivo Backend

Backend de Arkivo, la plataforma para gestionar apuntes académicos. Acá vive la API Express, la infraestructura con Docker y la documentación del proyecto.

## Qué hay en este repo

- API principal en `src/`
- Infraestructura local con Docker en `docker-compose.yml`
- Imagen de producción en `Dockerfile`
- Documentación del proyecto en `docs/`

## Requisitos

Antes de arrancar, asegurate de tener instalado:

- Node.js 18 o superior
- pnpm
- Docker y Docker Compose

Si usás Node moderno, podés habilitar `pnpm` con `corepack`.

## Instalación

1. Cloná el repo:

```bash
git clone https://github.com/nicolasfenoglio/arkivo-backend/
cd arkivo-backend
```

2. Instalá las dependencias:

```bash
pnpm install
```

3. Generá tu archivo de entorno local:

```bash
cp example.env .env
```

Después podés ajustar los valores según tu máquina.

## Scripts disponibles

Estos son los scripts definidos en `package.json`:

- `pnpm run start`: levanta la stack completa con Docker en segundo plano.
- `pnpm run dev`: arranca la API en modo desarrollo con `nodemon`.
- `pnpm run infra:up`: levanta solo la infraestructura base, o sea PostgreSQL, MinIO y la inicialización del bucket.
- `pnpm run infra:down`: baja la infraestructura.
- `pnpm run infra:restart`: reinicia los servicios de infraestructura.
- `pnpm run infra:logs`: mira los logs de los contenedores.
- `pnpm run dev:full`: levanta la infraestructura y después la API en desarrollo.

## Arquitectura con Docker

La arquitectura está armada para que la API no dependa de instalaciones locales raras y puedas correr todo igualito en cualquier máquina.

### Servicios

- `api`: construye la imagen desde el `Dockerfile` y expone la app en el puerto `3000` del contenedor, mapeado a `API_PORT` en tu máquina.
- `postgres`: base de datos PostgreSQL 17 con persistencia en el volumen `postgres_data`.
- `minio`: almacenamiento S3-compatible para archivos, con persistencia en el volumen `minio_data`.
- `minio-init`: contenedor de inicialización que espera a MinIO, crea el bucket y lo deja sin acceso anónimo.

### Flujo de arranque

1. `postgres` y `minio` arrancan primero.
2. `minio-init` configura el bucket de objetos.
3. `api` espera a que la base esté lista y después conecta todo usando variables de entorno.

### Variables que usa Docker

El `docker-compose.yml` toma configuración desde `.env`, y el repo trae un `example.env` con valores de arranque para que no arranques de cero. Las variables clave son:

- `DATABASE_URL` hacia PostgreSQL
- `S3_ENDPOINT` apuntando a MinIO
- `S3_ACCESS_KEY` y `S3_SECRET_KEY` con credenciales de MinIO
- `S3_BUCKET` para el bucket de archivos
- `NODE_ENV=production` para correr en modo productivo dentro del contenedor

## Cómo levantarlo

### Desarrollo

Si querés trabajar con recarga automática, corré:

```bash
pnpm run dev
```

Si también necesitás la infraestructura local, usá:

```bash
pnpm run dev:full
```

### Producción local con Docker

Para levantar toda la stack:

```bash
pnpm run start
```

O, si preferís hacerlo a mano:

```bash
docker compose up -d
```

## Probar que anda

Una vez levantado todo, probá la API con `curl` o desde el navegador:

```bash
curl http://localhost:3000/
```

Si la app está andando bien, vas a ver la respuesta esperada en la ruta raíz.

## Documentación

La documentación del proyecto está en `docs/`.

- Documento principal: [Sistema de Gestión de Apuntes Universitarios](docs/Sistema%20de%20Gestión%20de%20Apuntes%20Universitarios.md)

## Contribuir

Si querés sumar mano:

1. Abrí un issue contando qué querés cambiar.
2. Creá una rama nueva, por ejemplo `feature/mi-cambio`.
3. Mandá un pull request con una explicación clara de lo que hiciste.

---
