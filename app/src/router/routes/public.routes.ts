import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/modules/home/pages/HomePage.vue'),
        meta: { title: 'Inicio' }
      },
      {
        path: 'acerca',
        name: 'acerca',
        component: () => import('@/modules/acerca/pages/AcercaPage.vue'),
        meta: { title: 'Acerca de' }
      },
      {
        path: 'convocatorias',
        name: 'convocatorias',
        component: () => import('@/modules/convocatorias/pages/ConvocatoriasPage.vue'),
        meta: { title: 'Convocatorias' }
      },
      {
        path: 'convocatoria/:id',
        name: 'convocatoria-detalle',
        component: () => import('@/modules/convocatorias/pages/DetalleConvocatoriaPage.vue'),
        meta: { title: 'Detalle Convocatoria' }
      },
      {
        path: 'inscripcion',
        name: 'inscripcion',
        component: () => import('@/modules/inscripcion/pages/InscripcionPage.vue'),
        meta: { title: 'Inscripcion' }
      },
      {
        path: 'resultados',
        name: 'resultados',
        component: () => import('@/modules/resultados/pages/ResultadosPage.vue'),
        meta: { title: 'Resultados' }
      },
      {
        path: 'material',
        name: 'material',
        component: () => import('@/modules/material/pages/MaterialPage.vue'),
        meta: { title: 'Material' }
      },
      {
        path: 'contacto',
        name: 'contacto',
        component: () => import('@/modules/contacto/pages/ContactoPage.vue'),
        meta: { title: 'Contacto' }
      }
    ]
  }
]
