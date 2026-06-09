# Descripción de Variables de Entorno

| Variable | Valor esperado | Procedencia | Importancia | Ejemplo descriptivo |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | URL base HTTP/HTTPS del backend. Debe incluir protocolo (`http://` o `https://`). Puede terminar con `/`, el cliente la normaliza automáticamente. | La entrega el responsable del backend o infraestructura. En local suele apuntar al servidor API de desarrollo. En producción debe apuntar al dominio público o interno de la API. | Crítica. Sin esta variable, el frontend usa `http://localhost:8000/` por defecto, lo cual no sirve para producción. Todas las peticiones Axios dependen de este valor. | `https://api-ejemplo.ope.local` |
| `VITE_TURNSTILE_SITE_KEY` | Site key pública de Cloudflare Turnstile. No es secreta, pero debe corresponder al dominio donde corre el frontend. | Se obtiene desde el panel de Cloudflare Turnstile al crear/configurar el widget para el dominio del sistema. | Alta. Necesaria para validar formularios protegidos contra bots. Si es incorrecta, el widget puede no cargar o el backend puede rechazar la verificación. | `turnstile_site_key_de_ejemplo` |

