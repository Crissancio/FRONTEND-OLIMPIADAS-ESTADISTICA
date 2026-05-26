import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/modules/admin/pages/AdminLoginPage.vue'),
    meta: { title: 'Admin - Login' }
  },
  {
    path: '/admin/convocatoria/:id',
    redirect: (to) => `/admin/convocatoria/${to.params.id}/gestionar`
  },
  {
    path: '/admin/convocatoria/:convocatoriaId/gestionar',
    name: 'admin-convocatoria-detalle',
    component: () => import('@/modules/admin/pages/AdminConvocatoriaDetallePage.vue'),
    meta: { title: 'Admin - Gestion Convocatoria' }
  },
  {
    path: '/admin/convocatoria/:convocatoriaId/categoria/:categoriaId/gestionar',
    name: 'admin-categoria-gestion',
    component: () => import('@/modules/admin/pages/AdminCategoriaGestionPage.vue'),
    meta: { title: 'Admin - Gestion Categoria' }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/modules/admin/pages/AdminDashboardPage.vue'),
        meta: { title: 'Admin - Dashboard' }
      },
      {
        path: 'convocatorias',
        name: 'admin-convocatorias',
        component: () => import('@/modules/admin/pages/AdminConvocatoriasPage.vue'),
        meta: { title: 'Admin - Convocatorias' }
      },
      {
        path: 'material',
        name: 'admin-material',
        component: () => import('@/modules/admin/pages/AdminMaterialPage.vue'),
        meta: { title: 'Admin - Material' }
      },
      {
        path: 'colegios',
        name: 'admin-colegios',
        component: () => import('@/modules/admin/pages/AdminColegiosPage.vue'),
        meta: { title: 'Admin - Colegios' }
      },
      {
        path: 'estudiantes',
        name: 'admin-estudiantes',
        component: () => import('@/modules/admin/pages/AdminEstudiantesPage.vue'),
        meta: { title: 'Admin - Estudiantes' }
      },
      {
        path: 'avisos',
        name: 'admin-avisos',
        component: () => import('@/modules/admin/pages/AdminAvisosPage.vue'),
        meta: { title: 'Admin - Avisos' }
      },
      {
        path: 'contactos',
        name: 'admin-contactos',
        component: () => import('@/modules/admin/pages/AdminContactosPage.vue'),
        meta: { title: 'Admin - Mensajes de Contacto' }
      },
      {
        path: 'colaboradores',
        name: 'admin-colaboradores',
        component: () => import('@/modules/admin/pages/AdminColaboradoresPage.vue'),
        meta: { title: 'Admin - Colaboradores' }
      },
      {
        path: 'administradores',
        name: 'admin-administradores',
        component: () => import('@/modules/admin/pages/AdminAdministradoresPage.vue'),
        meta: { title: 'Admin - Administradores' }
      },
      {
        path: 'auditoria',
        name: 'admin-auditoria',
        component: () => import('@/modules/admin/pages/AdminAuditoriaPage.vue'),
        meta: { title: 'Admin - Auditoría' }
      }
    ]
  }
]
