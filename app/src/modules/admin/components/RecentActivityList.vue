<script setup lang="ts">
import { ref } from 'vue'
import { 
  Clock, Plus, Pencil, Trash2, Globe, EyeOff, CalendarClock, Reply, ShieldAlert,
  ClipboardList, Mail, Activity, CircleAlert, Box
} from 'lucide-vue-next'
import type { ActividadRecienteDTO } from '../../sistema/types/sistema.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'

defineProps<{
  activities: ActividadRecienteDTO[]
  isLoadingMore: boolean
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

const scrollContainer = ref<HTMLElement | null>(null)

const handleScroll = () => {
  const el = scrollContainer.value
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
    emit('load-more')
  }
}

const getConfig = (act: ActividadRecienteDTO) => {
  if (act.tipo_registro === 'ACTIVIDAD') {
    const tipo = act.tipo_actividad?.toUpperCase()
    if (tipo === 'INSCRIPCION') return { icon: ClipboardList, color: 'var(--color-actividad-inscripcion)', text: 'var(--color-actividad-inscripcion-text)', bg: 'var(--color-actividad-inscripcion-soft)' }
    if (tipo === 'EMAIL') return { icon: Mail, color: 'var(--color-actividad-email)', text: 'var(--color-actividad-email-text)', bg: 'var(--color-actividad-email-soft)' }
    return { icon: Activity, color: '#6B7280', text: '#374151', bg: '#F3F4F6' }
  } else {
    const accion = act.accion?.toUpperCase()
    switch (accion) {
      case 'CREAR': return { icon: Plus, color: 'var(--color-audit-crear)', text: 'var(--color-audit-crear-text)', bg: 'var(--color-audit-crear-soft)' }
      case 'ACTUALIZAR': return { icon: Pencil, color: 'var(--color-audit-actualizar)', text: 'var(--color-audit-actualizar-text)', bg: 'var(--color-audit-actualizar-soft)' }
      case 'ELIMINAR': return { icon: Trash2, color: 'var(--color-audit-eliminar)', text: 'var(--color-audit-eliminar-text)', bg: 'var(--color-audit-eliminar-soft)' }
      case 'PUBLICAR': return { icon: Globe, color: 'var(--color-audit-publicar)', text: 'var(--color-audit-publicar-text)', bg: 'var(--color-audit-publicar-soft)' }
      case 'OCULTAR': return { icon: EyeOff, color: 'var(--color-audit-ocultar)', text: 'var(--color-audit-ocultar-text)', bg: 'var(--color-audit-ocultar-soft)' }
      case 'REPROGRAMAR': return { icon: CalendarClock, color: 'var(--color-audit-reprogramar)', text: 'var(--color-audit-reprogramar-text)', bg: 'var(--color-audit-reprogramar-soft)' }
      case 'RESPONDER': return { icon: Reply, color: 'var(--color-audit-responder)', text: 'var(--color-audit-responder-text)', bg: 'var(--color-audit-responder-soft)' }
      case 'LOGIN_FALLIDO': return { icon: ShieldAlert, color: 'var(--color-audit-login-fallido)', text: 'var(--color-audit-login-fallido-text)', bg: 'var(--color-audit-login-fallido-soft)' }
      default: return { icon: CircleAlert, color: '#9CA3AF', text: '#4B5563', bg: '#F3F4F6' }
    }
  }
}

const getModuleConfig = (modulo?: string | null) => {
  if (!modulo) return null
  const mod = modulo.toUpperCase()
  const academico = ['CONVOCATORIA', 'INSCRIPCION', 'RESULTADO', 'CATEGORIA', 'FASE_PRUEBA', 'FASE_PREPARACION', 'MATERIAL']
  const persona = ['ESTUDIANTE', 'DIRECTOR', 'COLEGIO', 'COLABORADOR', 'ADMINISTRADOR']
  const comunicacion = ['AVISO', 'CONTACTO', 'CAMPANIA', 'EMAIL_LOG']
  const auth = ['AUTH']

  if (academico.includes(mod)) return { color: 'var(--color-modulo-academico)', text: 'var(--color-modulo-academico-text)', bg: 'var(--color-modulo-academico-soft)', border: 'var(--color-modulo-academico-border)' }
  if (persona.includes(mod)) return { color: 'var(--color-modulo-persona)', text: 'var(--color-modulo-persona-text)', bg: 'var(--color-modulo-persona-soft)', border: 'var(--color-modulo-persona-border)' }
  if (comunicacion.includes(mod)) return { color: 'var(--color-modulo-comunicacion)', text: 'var(--color-modulo-comunicacion-text)', bg: 'var(--color-modulo-comunicacion-soft)', border: 'var(--color-modulo-comunicacion-border)' }
  if (auth.includes(mod)) return { color: 'var(--color-modulo-auth)', text: 'var(--color-modulo-auth-text)', bg: 'var(--color-modulo-auth-soft)', border: 'var(--color-modulo-auth-border)' }
  
  return { color: '#6B7280', text: '#374151', bg: '#F3F4F6', border: '#D1D5DB' }
}

const formatTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-BO', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date)
  } catch {
    return dateStr
  }
}
</script>

<template>
  <Card class="rounded-xl border-gray-200 shadow-sm flex flex-col bg-white h-125">
    <CardHeader class="p-6 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 shrink-0">
      <CardTitle class="text-lg font-heading font-bold text-gray-900 flex items-center gap-2 tracking-tight">
        <Clock class="w-5 h-5 text-primary" />
        Línea de Actividad Reciente
      </CardTitle>
    </CardHeader>
    
    <div 
      ref="scrollContainer" 
      class="flex-1 overflow-y-auto divide-y divide-gray-100"
      @scroll="handleScroll"
    >
      <div v-if="activities.length === 0" class="p-8 text-center text-gray-400 text-sm font-medium flex flex-col items-center justify-center h-full">
        <Activity class="w-10 h-10 mb-2 opacity-50" />
        No se registran actividades recientes en el sistema.
      </div>
      <div v-else>
        <div 
          v-for="act in activities" 
          :key="act.id_registro" 
          :class="[
            'p-4 transition-colors flex items-start gap-4 border-l-2',
            act.tipo_registro === 'ACTIVIDAD' 
              ? 'bg-indigo-50/30 border-indigo-200 hover:bg-indigo-50/60' 
              : 'bg-slate-50/20 border-transparent hover:bg-slate-50'
          ]"
        >
          <div :style="{ backgroundColor: getConfig(act).bg }" class="mt-1 shrink-0 w-9 h-9 rounded-full flex items-center justify-center border shadow-xs" :style:borderColor="getConfig(act).color">
            <component 
              :is="getConfig(act).icon"
              class="w-4 h-4"
              :style="{ color: getConfig(act).color }"
            />
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center flex-wrap gap-2 mb-1.5">
              <span class="font-black text-xs uppercase tracking-wider" :style="{ color: getConfig(act).text }">
                {{ act.tipo_registro === 'ACTIVIDAD' ? act.tipo_actividad : act.accion }}
              </span>
              <span 
                v-if="act.modulo" 
                class="text-[10px] font-bold uppercase px-2 py-0.5 rounded border flex items-center gap-1"
                :style="{ backgroundColor: getModuleConfig(act.modulo)?.bg, borderColor: getModuleConfig(act.modulo)?.border, color: getModuleConfig(act.modulo)?.text }"
              >
                <Box class="w-2.5 h-2.5" />
                {{ act.modulo }}
              </span>
            </div>
            
            <p class="text-[13px] text-gray-800 font-medium leading-snug">
              {{ act.descripcion || act.titulo }}
            </p>
            
            <div class="mt-2 flex items-center gap-2">
              <span class="text-[11px] text-gray-500 font-mono font-medium">{{ formatTime(act.fecha) }}</span>
              <span class="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-sm bg-white border" :class="act.tipo_registro === 'ACTIVIDAD' ? 'text-indigo-400 border-indigo-100' : 'text-gray-400 border-gray-200'">
                {{ act.tipo_registro }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoadingMore" class="p-4 text-center text-xs font-bold uppercase tracking-wider text-primary bg-primary/5 animate-pulse">
        Recuperando más registros...
      </div>
    </div>
  </Card>
</template>