<script setup lang="ts">
import { Eye, Loader2, Plus, Pencil, Trash2, Globe, EyeOff, CalendarClock, Reply, ShieldAlert, CircleAlert, Box } from 'lucide-vue-next'
import type { AuditoriaDTO } from '../types/sistema.api'

const props = defineProps<{
  logs: AuditoriaDTO[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'view', log: AuditoriaDTO): void
}>()

const configAction = (action: string) => {
  switch (action.toUpperCase()) {
    case 'CREAR': return { icon: Plus, color: 'var(--color-audit-crear)', text: 'var(--color-audit-crear-text)' }
    case 'ACTUALIZAR': return { icon: Pencil, color: 'var(--color-audit-actualizar)', text: 'var(--color-audit-actualizar-text)' }
    case 'ELIMINAR': return { icon: Trash2, color: 'var(--color-audit-eliminar)', text: 'var(--color-audit-eliminar-text)' }
    case 'PUBLICAR': return { icon: Globe, color: 'var(--color-audit-publicar)', text: 'var(--color-audit-publicar-text)' }
    case 'OCULTAR': return { icon: EyeOff, color: 'var(--color-audit-ocultar)', text: 'var(--color-audit-ocultar-text)' }
    case 'REPROGRAMAR': return { icon: CalendarClock, color: 'var(--color-audit-reprogramar)', text: 'var(--color-audit-reprogramar-text)' }
    case 'RESPONDER': return { icon: Reply, color: 'var(--color-audit-responder)', text: 'var(--color-audit-responder-text)' }
    case 'LOGIN_FALLIDO': return { icon: ShieldAlert, color: 'var(--color-audit-login-fallido)', text: 'var(--color-audit-login-fallido-text)' }
    default: return { icon: CircleAlert, color: '#9CA3AF', text: '#4B5563' }
  }
}

const configModule = (module: string) => {
  const academico = ['CONVOCATORIA', 'INSCRIPCION', 'RESULTADO', 'CATEGORIA', 'FASE_PRUEBA', 'FASE_PREPARACION', 'MATERIAL']
  const persona = ['ESTUDIANTE', 'DIRECTOR', 'COLEGIO', 'COLABORADOR', 'ADMINISTRADOR']
  const comunicacion = ['AVISO', 'CONTACTO', 'CAMPANIA', 'EMAIL_LOG']
  const auth = ['AUTH']

  if (academico.includes(module)) return { color: 'var(--color-modulo-academico)', text: 'var(--color-modulo-academico-text)', bg: 'var(--color-modulo-academico-soft)', border: 'var(--color-modulo-academico-border)' }
  if (persona.includes(module)) return { color: 'var(--color-modulo-persona)', text: 'var(--color-modulo-persona-text)', bg: 'var(--color-modulo-persona-soft)', border: 'var(--color-modulo-persona-border)' }
  if (comunicacion.includes(module)) return { color: 'var(--color-modulo-comunicacion)', text: 'var(--color-modulo-comunicacion-text)', bg: 'var(--color-modulo-comunicacion-soft)', border: 'var(--color-modulo-comunicacion-border)' }
  if (auth.includes(module)) return { color: 'var(--color-modulo-auth)', text: 'var(--color-modulo-auth-text)', bg: 'var(--color-modulo-auth-soft)', border: 'var(--color-modulo-auth-border)' }
  
  return { color: '#6B7280', text: '#374151', bg: '#F3F4F6', border: '#D1D5DB' }
}

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date(dateStr))
}
</script>

<template>
  <div class="overflow-x-auto relative min-h-75">
    <div v-if="isLoading && logs.length === 0" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
      <span class="text-sm text-gray-500 font-medium mt-2">Cargando registros...</span>
    </div>

    <table class="w-full border-collapse text-left">
      <thead class="border-b border-gray-200 bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
          <th class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Usuario</th>
          <th class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Acción</th>
          <th class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Módulo</th>
          <th class="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Detalle</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 text-sm">
        <tr v-for="log in logs" :key="log.id_auditoria" class="group transition-colors hover:bg-gray-50 cursor-pointer" @click="emit('view', log)">
          <td class="whitespace-nowrap px-6 py-2.5 text-gray-600 font-mono text-sm font-medium">{{ formatDate(log.fecha) }}</td>
          <td class="px-6 py-2.5 font-bold text-gray-900 text-sm">{{ log.admin_nombre }}</td>
          <td class="px-6 py-2.5">
            <div class="flex items-center gap-2">
              <component :is="configAction(log.accion).icon" class="h-4 w-4 shrink-0" :style="{ color: configAction(log.accion).color }" />
              <span class="font-bold text-xs uppercase tracking-wider" :style="{ color: configAction(log.accion).text }">{{ log.accion }}</span>
            </div>
          </td>
          <td class="px-6 py-2.5">
            <span class="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border flex items-center w-fit gap-1.5" :style="{ backgroundColor: configModule(log.modulo).bg, borderColor: configModule(log.modulo).border, color: configModule(log.modulo).text }">
              <Box class="w-3.5 h-3.5" />
              {{ log.modulo }}
            </span>
          </td>
          <td class="px-6 py-2.5 text-right">
            <button class="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100">
              <Eye class="h-4 w-4" />
            </button>
          </td>
        </tr>
        <tr v-if="logs.length === 0 && !isLoading">
          <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500 font-medium">
            No se encontraron registros de auditoría para estos filtros.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>