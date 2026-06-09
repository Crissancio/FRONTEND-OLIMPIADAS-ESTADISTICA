# Frontend Olimpiadas de Estadística

Frontend web para la **Olimpiada Paceña de Estadística OPE**. La aplicación está construida como SPA y contiene una experiencia pública para estudiantes/visitantes y un panel administrativo para la gestión operativa del sistema.

## Descripción del Proyecto

El sistema permite mostrar información pública de convocatorias, avisos, materiales, resultados, colaboradores e inscripción. También incluye un panel de administración para gestionar convocatorias, categorías, fases, estudiantes, materiales, avisos, mensajes de contacto y administradores.

El frontend consume una API REST externa. La persistencia, autenticación real, envío de correos, archivos y reglas de negocio críticas son responsabilidad del backend. El cliente se encarga de la experiencia visual, navegación, validación de formularios, consumo de endpoints y manejo de sesión administrativa.

## Stack Técnico

| Área | Tecnología |
| :--- | :--- |
| Framework | Vue 3 |
| Bundler | Vite 7 |
| Lenguaje | TypeScript |
| Estado global | Pinia |
| Rutas | Vue Router |
| HTTP client | Axios |
| Estilos | Tailwind CSS 4 + variables CSS |
| UI accesible | Headless UI |
| Iconos | Lucide Vue |
| Calendarios | v-calendar |
| PDF | vue-pdf-embed |
| Notificaciones | vue-sonner |
| Captcha | Cloudflare Turnstile |
| Generación API | Orval |

## Estructura Técnica

```text
app/
  src/
    app/
      api/              Cliente Axios, mutator, errores y constantes
      stores/           Stores globales, principalmente autenticación
    assets/             Recursos estáticos importados por Vue
    layouts/            Layouts públicos y administrativos
    modules/            Módulos funcionales del sistema
    router/             Configuración de rutas y guards
    shared/             Componentes reutilizables, tipos y utilidades
    style.css           Variables globales, Tailwind theme y estilos base
    main.ts             Bootstrap Vue, Pinia, Router y VCalendar
```

## Composición por Módulos

| Módulo | Responsabilidad |
| :--- | :--- |
| `home` | Página inicial pública, carrusel, avisos, convocatoria activa y vista institucional |
| `public` | Tipos, servicios y store para endpoints públicos |
| `auth` | Login, sesión administrativa, cambio de contraseña y tipos de autenticación |
| `admin` | Panel administrativo, dashboards, convocatorias, categorías, contactos y administradores |
| `convocatorias` | Vistas públicas/detalle de convocatorias y tipos relacionados |
| `avisos` | Gestión y tipado de avisos |
| `material` | Gestión y visualización de materiales |
| `inscripcion` | Flujo público de inscripción |
| `contacto` | Formulario público y gestión de mensajes |
| `colegios` | Gestión de colegios |
| `directores` | Gestión de directores |
| `colaborador` | Gestión/visualización de colaboradores |
| `acerca` | Información institucional |

## Servicios Empleados

La comunicación con backend se centraliza con Axios:

```text
app/src/app/api/api-client.ts
app/src/app/api/mutator.ts
```

El cliente HTTP usa:

- `VITE_API_BASE_URL` como URL base.
- Interceptor de request para agregar `Authorization: Bearer <token>`.
- Interceptor de response para limpiar sesión si recibe `401`.
- Normalización de errores con `toApiError`.

Servicios principales:

| Servicio | Uso |
| :--- | :--- |
| `public.service.ts` | Endpoints públicos: inicio, avisos, convocatorias, materiales, fases, resultados, colaboradores y colegios |
| `auth.service.ts` | Login, logout, usuario actual y cambio de contraseña |
| Servicios de `admin` | Gestión administrativa de recursos internos |
| Servicios de módulos específicos | Operaciones CRUD y consultas por dominio |

## Autenticación

El panel administrativo usa autenticación por token Bearer.

Datos locales:

```text
sessionStorage.access_token
sessionStorage.auth_user
```

El guard de rutas protege las rutas `/admin`, excepto `/admin/login`. Si no existe sesión válida, redirige al login administrativo.

## Variables de Entorno

Crear archivo:

```text
app/.env
```

Ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8000/
VITE_TURNSTILE_SITE_KEY=turnstile_site_key_de_desarrollo
```

Ver también:

- `app/.env.example`
- `descripcion-variables-env.md`

## Comandos

Instalar dependencias:

```bash
cd app
npm install
```

Levantar desarrollo:

```bash
npm run dev
```

Compilar producción:

```bash
npm run build
```

Previsualizar build:

```bash
npm run preview
```

Generar cliente/tipos API con Orval:

```bash
npm run generate:api
```

## Desarrollo en PowerShell

Si PowerShell bloquea scripts de npm:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Alternativa:

```powershell
npm.cmd run dev
```

## Despliegue

El proyecto se compila como estático en:

```text
app/dist
```

Para producción se recomienda servir `dist` con Nginx, Caddy o Apache, con fallback de SPA hacia `index.html`.

Documentación relacionada:

- `requerimientos-frontend.md`
- `despliegue.md`
- `despligue-docker-dev.md`

