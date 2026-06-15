# Arkivo Backend

Aplicación backend para la plataforma Arkivo. Este repositorio contiene la aplicación Express ubicada en `src/` y la documentación del proyecto en la carpeta `docs/`.

## Tabla de contenidos

- Instalación
- Levantar
- Probar
- Documentación
- Contribuir

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalados:

- Node.js (recomendado >= 18)
- pnpm (puedes usar `corepack` en Node 16+/18+ o instalar con `npm i -g pnpm`)

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/nicolasfenoglio/arkivo-backend/
cd arkivo-backend
```

2. Instala dependencias con `pnpm`:

```bash
pnpm install
```

Nota: este proyecto usa `pnpm` como gestor (ver `package.json`).

## Levantar

- Modo desarrollo (con recarga automática):

```bash
pnpm run dev
```

- Modo producción:

```bash
pnpm run start
```

La aplicación por defecto escucha en el puerto `3000`. En desarrollo verás un log como:

```
Server is running on http://localhost:3000
```

## Probar

Una vez levantada la aplicación, puedes probar la ruta raíz con `curl` o un navegador:

```bash
curl http://localhost:3000/
# debería responder: Hello, World!
```

También puedes abrir `http://localhost:3000/` en tu navegador.

## Documentación

La documentación del proyecto se encuentra en la carpeta `docs/`.

- Ver el documento principal: [Sistema de Gestión de Apuntes Universitarios](docs/Sistema%20de%20Gestión%20de%20Apuntes%20Universitarios.md)

Para ver los docs localmente simplemente abre el archivo en tu editor o en GitHub navegando a la ruta `docs/`.

## Contribuir

Si quieres colaborar:

1. Abre un issue describiendo el cambio.
2. Crea una rama nueva `feature/mi-cambio`.
3. Envía un pull request con una descripción clara.

---
