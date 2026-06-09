# Despliegue Docker Dev

## Objetivo

Levantar el frontend en modo desarrollo usando Docker, manteniendo recarga en caliente con Vite.

## Requisitos previos

| Recurso | Requerido |
| :--- | :--- |
| Docker | Instalado y activo |
| Docker Compose | v2 recomendado |
| Puerto frontend | `5173` disponible |
| API backend | Disponible desde el contenedor |

## Archivo de entorno

Crear o revisar:

```bash
app/.env
```

Ejemplo para desarrollo:

```env
VITE_API_BASE_URL=http://localhost:8000/
VITE_TURNSTILE_SITE_KEY=turnstile_site_key_de_desarrollo
```

Si el backend corre en otro contenedor, usar el nombre del servicio Docker:

```env
VITE_API_BASE_URL=http://backend:8000/
```

Si el backend corre en el host y Docker Desktop está disponible:

```env
VITE_API_BASE_URL=http://host.docker.internal:8000/
```

## Dockerfile dev sugerido

Crear un archivo llamado:

```text
app/Dockerfile.dev
```

Contenido:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## Compose dev sugerido

Crear en la raíz:

```text
docker-compose.dev.yml
```

Contenido:

```yaml
services:
  frontend:
    build:
      context: ./app
      dockerfile: Dockerfile.dev
    container_name: ope-frontend-dev
    ports:
      - "5173:5173"
    env_file:
      - ./app/.env
    volumes:
      - ./app:/app
      - /app/node_modules
    command: npm run dev -- --host 0.0.0.0
```

## Levantar ambiente

Desde la raíz del proyecto:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Abrir:

```text
http://localhost:5173
```

## Detener ambiente

```bash
docker compose -f docker-compose.dev.yml down
```

## Reconstruir dependencias

Usar cuando cambie `package.json` o `package-lock.json`:

```bash
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

## Verificación

Revisar:

- Vite escucha en `0.0.0.0:5173`.
- El navegador abre `http://localhost:5173`.
- Los cambios en archivos Vue actualizan la vista.
- Las peticiones salen hacia el valor de `VITE_API_BASE_URL`.
- No hay conflicto con otro proceso usando el puerto `5173`.

