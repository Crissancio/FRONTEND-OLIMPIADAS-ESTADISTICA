# Requerimientos Frontend

## 1. Descripción general del sistema

Frontend web para la Olimpiada Paceña de Estadística OPE. El sistema expone una parte pública para inicio, convocatorias, avisos, inscripción, contacto, resultados y material; y una parte administrativa para gestión de convocatorias, categorías, fases, avisos, colegios, estudiantes, materiales, contactos y administradores.

La aplicación consume una API REST externa mediante Axios. La autenticación administrativa se maneja con token Bearer guardado en `sessionStorage`. El frontend no administra base de datos directamente; toda persistencia, correo transaccional y reglas de negocio críticas dependen del backend.

## 2. Stack tecnológico

Framework principal: Vue 3 + Vite 7 + TypeScript.

● Base de datos: No aplica directamente al frontend. La base de datos pertenece al backend consumido por `VITE_API_BASE_URL`.

● ORM: No aplica al frontend. Cualquier ORM debe estar definido en el backend.

● Autenticación: Token Bearer/JWT consumido desde API REST, almacenado en `sessionStorage` con claves `access_token` y `auth_user`.

● Estilos: Tailwind CSS 4, variables CSS globales en `app/src/style.css`, fuentes Inter y Poppins.

● Gráficos: No hay librería dedicada de charts instalada. El proyecto usa componentes visuales Vue, CSS, `lucide-vue-next` para iconografía y `v-calendar` para calendarios.

● Exportación: No hay exportación frontend pesada instalada. La descarga/exportación debe venir del backend o de enlaces de archivos. Para visualización PDF se usa `vue-pdf-embed`.

● Correo transaccional: No aplica directamente al frontend. El frontend solo envía solicitudes a la API para contacto/respuestas; el envío real debe resolverlo el backend.

● Servidor de aplicación: Vite para desarrollo. En producción se recomienda servir `dist/` como sitio estático con Nginx, Caddy, Apache o servicio equivalente.

● Contenedores: Opcional. El frontend puede empaquetarse con Docker usando una etapa Node para build y una etapa Nginx para servir estáticos.

● Proxy inverso: Recomendado Nginx o Caddy para TLS, compresión, cache y redirección HTTP a HTTPS.

● Runtime: Node.js 22 LTS recomendado para build. Compatible también con Node.js 20.19+ según requisitos de Vite 7. En producción estática no requiere Node corriendo.

## 3. Arquitectura de despliegue

Flujo recomendado:

1. Usuario accede al dominio público por HTTPS.
2. Proxy inverso recibe tráfico en 443.
3. Nginx/Caddy sirve archivos estáticos generados en `app/dist`.
4. La SPA usa Vue Router con `createWebHistory`, por lo que el servidor debe redirigir rutas internas a `index.html`.
5. El frontend consume la API configurada en `VITE_API_BASE_URL`.
6. El backend gestiona autenticación, datos, archivos, correos y reglas de negocio.

Comando de build:

```bash
cd app
npm install
npm run build
```

Salida esperada:

```text
app/dist
```

## 4. Requerimientos mínimos del servidor

| Recursos | Mínimo requerido |
| :--- | :--- |
| CPU | 1 vCPU |
| RAM | 512 MB para servir estáticos; 1 GB recomendado si también se hace build |
| Disco | 1 GB libre mínimo; 5 GB recomendado para builds, cache y logs |
| Sistema operativo | Linux Ubuntu 22.04/24.04 LTS o equivalente |
| Red | Acceso HTTP/HTTPS saliente hacia la API |
| Ancho de banda | Según tráfico público; mínimo 10 Mbps para uso bajo/moderado |

## 5. Software previo necesario en el servidor

Para construir:

- Node.js 22 LTS o Node.js 20.19+.
- npm 10+.
- Git.

Para servir en producción:

- Nginx, Caddy o Apache.
- Certbot si se usa Let's Encrypt con Nginx/Apache.
- Acceso al backend/API.

Opcional:

- Docker y Docker Compose.
- Sistema de CI/CD para build y despliegue automático.

## 6. Puertos utilizados

| Puerto | Uso |
| :--- | :--- |
| 5173 | Vite dev server |
| 4173 | Vite preview |
| 80 | HTTP público, normalmente redirigido a HTTPS |
| 443 | HTTPS público |
| 8000 | API backend por defecto local si no se define `VITE_API_BASE_URL` |

## 7. Variables de entorno requeridas

| Variable | Requerida | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Sí en producción | URL base de la API REST. El cliente Axios elimina la barra final automáticamente. | `https://api.ope.umsa.bo` |

Valor por defecto en desarrollo:

```text
http://localhost:8000/
```

Archivo sugerido:

```bash
app/.env.production
```

Ejemplo:

```env
VITE_API_BASE_URL=https://api.ope.umsa.bo
```

## 8. Dominio y certificado SSL

Se recomienda usar un dominio dedicado para el frontend, por ejemplo:

```text
https://ope.umsa.bo
```

Requisitos:

- Certificado SSL válido.
- Redirección permanente de HTTP a HTTPS.
- Configuración SPA fallback a `index.html`.
- Cabeceras básicas de seguridad.
- Compresión gzip o brotli.
- Cache para assets versionados.

Ejemplo conceptual Nginx:

```nginx
server {
  listen 80;
  server_name ope.umsa.bo;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name ope.umsa.bo;

  root /var/www/ope-frontend/dist;
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

## 9. Estimación de uso de recursos en producción

● Consumo en reposo: 20 MB a 80 MB de RAM si se sirve con Nginx/Caddy como estático.

● Consumo bajo carga moderada: 80 MB a 250 MB de RAM, dependiendo de concurrencia, TLS, compresión y cache.

● CPU: Bajo consumo. 1 vCPU es suficiente para tráfico bajo/moderado de estáticos. Para alto tráfico, escalar proxy/CDN.

● Crecimiento de base de datos: No aplica al frontend. El crecimiento depende del backend: convocatorias, estudiantes, inscripciones, materiales, resultados, auditoría, contactos y archivos asociados.

