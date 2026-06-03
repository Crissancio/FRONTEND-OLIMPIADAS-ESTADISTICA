<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Search, Download, Eye, Activity, Database, Key } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { useSistemaStore } from '@/modules/sistema/stores/sistema.store'
import type { TipoAccion, TipoModulo } from '@/modules/sistema/types/sistema.api'

const sistemaStore = useSistemaStore()
const searchTerm = ref('')
const moduleFilter = ref('all')
const actionFilter = ref('all')

const logs = computed(() => sistemaStore.auditorias)

const iconByAction = (action: string) => {
  if (action === 'LOGIN_FALLIDO') return Key
  if (action === 'CREAR' || action === 'ELIMINAR') return Database
  return Activity
}

const colorByAction = (action: string) => {
  if (action === 'CREAR') return 'text-success'
  if (action === 'ELIMINAR' || action === 'LOGIN_FALLIDO') return 'text-error'
  if (action === 'ACTUALIZAR') return 'text-info'
  return 'text-text-muted'
}

const loadAuditoria = () => {
  void sistemaStore.fetchAuditoria({
    page: 1,
    limit: 50,
    busqueda: searchTerm.value || null,
    modulo: moduleFilter.value === 'all' ? null : moduleFilter.value as TipoModulo,
    accion: actionFilter.value === 'all' ? null : actionFilter.value as TipoAccion,
  })
}

let timer: ReturnType<typeof setTimeout> | null = null
watch([searchTerm, moduleFilter, actionFilter], () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(loadAuditoria, 350)
})

onMounted(loadAuditoria)

const exportCsv = () => {
  const end = new Date()
  const start = new Date()
  start.setFullYear(end.getFullYear() - 1)
  void sistemaStore.downloadAuditoriaCsv({
    fecha_start: start.toISOString(),
    fecha_end: end.toISOString(),
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Auditoria de Sistema</h1>
        <p class="mt-1 text-sm text-text-muted">Registro de acciones criticas realizadas en el panel.</p>
      </div>
      <Button variant="outline" class="h-auto px-4 py-2.5 flex items-center gap-2" @click="exportCsv">
        <Download class="h-4 w-4" />
        Exportar Registro
      </Button>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0">
        <div class="grid grid-cols-1 gap-4 border-b border-gray-200 bg-gray-50/50 p-4 sm:grid-cols-4">
          <div class="relative">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
            <input v-model="searchTerm" class="h-auto w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Buscar usuario o accion..." />
          </div>
          <select v-model="moduleFilter" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Todos los modulos</option>
            <option value="COLEGIO">Colegios</option>
            <option value="ESTUDIANTE">Estudiantes</option>
            <option value="CONVOCATORIA">Convocatorias</option>
            <option value="AVISO">Avisos</option>
            <option value="ADMINISTRADOR">Administradores</option>
            <option value="MATERIAL">Material</option>
          </select>
          <select v-model="actionFilter" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
            <option value="all">Cualquier accion</option>
            <option value="CREAR">Creacion</option>
            <option value="ACTUALIZAR">Actualizacion</option>
            <option value="ELIMINAR">Eliminacion</option>
            <option value="LOGIN_FALLIDO">Critica</option>
          </select>
          <div class="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-text-muted">
            {{ sistemaStore.metaAuditoria?.total ?? 0 }} registros
          </div>
        </div>

        <div v-if="sistemaStore.loading" class="p-8 text-center text-sm text-text-muted">
          Cargando auditoria...
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Timestamp</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Usuario</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Accion / modulo</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Descripcion</th>
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 font-mono text-sm">
              <tr v-for="log in logs" :key="log.id_auditoria" class="group transition-colors hover:bg-gray-50/50">
                <td class="whitespace-nowrap px-6 py-4 text-text-muted">{{ log.fecha }}</td>
                <td class="px-6 py-4 font-sans font-bold text-text-main">{{ log.admin_nombre }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <component :is="iconByAction(log.accion)" class="h-4 w-4" :class="colorByAction(log.accion)" />
                    <div>
                      <p class="font-sans text-sm font-bold text-text-main">{{ log.accion }}</p>
                      <p class="font-sans text-xs text-text-muted">{{ log.modulo }}</p>
                    </div>
                  </div>
                </td>
                <td class="max-w-xs truncate px-6 py-4 text-text-muted">{{ log.descripcion }}</td>
                <td class="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" class="text-text-muted hover:text-primary"><Eye class="h-4 w-4" /></Button>
                </td>
              </tr>
              <tr v-if="logs.length === 0">
                <td colspan="5" class="px-6 py-10 text-center text-sm text-text-muted">Sin registros.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
