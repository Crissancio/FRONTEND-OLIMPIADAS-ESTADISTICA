# Despliegue Frontend

## Objetivo

Desplegar el frontend Vue/Vite de la Olimpiada Paceña de Estadística como aplicación estática en producción.

## Requisitos previos

| Recurso | Requerido |
| :--- | :--- |
| Node.js | 22 LTS recomendado, mínimo 20.19+ |
| npm | 10+ |
| Servidor web | Nginx, Caddy o Apache |
| Dominio | Dominio apuntando al servidor |
| SSL | Certificado válido, recomendado Let's Encrypt |
| API backend | URL pública o interna disponible |

## Variables de entorno

Crear el archivo:

```bash
app/.env.production
```

Contenido ejemplo:

```env
VITE_API_BASE_URL=https://api-ejemplo.ope.local
VITE_TURNSTILE_SITE_KEY=turnstile_site_key_de_produccion
```

La variable más importante es `VITE_API_BASE_URL`, porque define a qué backend llamará el frontend.

## Instalación de dependencias

Desde la raíz del proyecto:

```bash
cd app
npm install
```

## Compilación de producción

```bash
npm run build
```

La salida generada queda en:

```text
app/dist
```

## Despliegue con Nginx

Copiar el contenido de `app/dist` al directorio público del servidor:

```bash
sudo mkdir -p /var/www/ope-frontend
sudo cp -r dist/* /var/www/ope-frontend/
```

Configurar Nginx:

```nginx
server {
  listen 80;
  server_name ope.ejemplo.local;

  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name ope.ejemplo.local;

  root /var/www/ope-frontend;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

Activar configuración:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Certificado SSL

Con Certbot:

```bash
sudo certbot --nginx -d ope.ejemplo.local
```

Verificar renovación automática:

```bash
sudo certbot renew --dry-run
```

## Verificación

Abrir:

```text
https://ope.ejemplo.local
```

Verificar:

- La página inicial carga correctamente.
- Las rutas internas no devuelven 404 al refrescar.
- El login administrador carga.
- Las llamadas a la API usan `VITE_API_BASE_URL`.
- El widget Turnstile carga si el formulario lo requiere.

## Actualización de versión

```bash
cd app
git pull
npm install
npm run build
sudo rm -rf /var/www/ope-frontend/*
sudo cp -r dist/* /var/www/ope-frontend/
sudo systemctl reload nginx
```

