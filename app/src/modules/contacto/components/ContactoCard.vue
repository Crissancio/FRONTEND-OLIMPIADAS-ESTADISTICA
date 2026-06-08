<script setup lang="ts">
import { computed } from 'vue'
import { Clock3, Mail, Eye, CheckCheck, LoaderCircle, SendHorizontal, MailX } from 'lucide-vue-next'
import type { ContactoDTO, ContactoCompletoDTO } from '../types/contacto.api'

const props = defineProps<{
  item: ContactoDTO | ContactoCompletoDTO
  active: boolean
  mode: 'recientes' | 'respondidos'
}>()

defineEmits(['select'])

const isCompleto = (obj: any): obj is ContactoCompletoDTO => {
  return obj && 'email_logs' in obj
}

// Diccionario de variantes para el Estado del Contacto (Tailwind puro y seguro)
const estadoContactoVariants = {
  PENDIENTE: {
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: '#f59e0b', // amber-500 para el borde lateral activo
    icon: Clock3,
    label: 'Pendiente'
  },
  LEIDO: {
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: '#3b82f6', // blue-500
    icon: Eye,
    label: 'Leído'
  },
  RESPONDIDO: {
    classes: 'bg-green-50 text-green-700 border-green-200',
    borderColor: '#22c55e', // green-500
    icon: CheckCheck,
    label: 'Respondido'
  }
}

const configEstadoContacto = computed(() => {
  const estado = props.item.estado
  // Si el estado no coincide con el mapa, retorna un diseño por defecto seguro (Gris) para que no rompa el diseño
  return estadoContactoVariants[estado as keyof typeof estadoContactoVariants] || {
    classes: 'bg-gray-50 text-gray-600 border-gray-200',
    borderColor: '#9ca3af', 
    icon: Clock3,
    label: estado || 'Desconocido'
  }
})

// Diccionario de variantes para el Estado del Email
const estadoEmailVariants = {
  PENDIENTE: {
    classes: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Mail,
    label: 'Email Pnd.'
  },
  EN_PROCESO: {
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: LoaderCircle,
    label: 'En Proceso'
  },
  ENVIADO: {
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: SendHorizontal,
    label: 'Enviado'
  },
  FALLIDO: {
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: MailX,
    label: 'Fallido'
  }
}

const configEstadoEmail = computed(() => {
  if (!isCompleto(props.item) || !props.item.email_logs || props.item.email_logs.length === 0) {
    return null
  }
  const ultimoLog = props.item.email_logs[props.item.email_logs.length - 1]
  const estado = ultimoLog.estado_email
  return estadoEmailVariants[estado as keyof typeof estadoEmailVariants] || null
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}
</script>

<template>
  <button
    type="button"
    class="w-full border-b border-gray-100 p-4 text-left transition-all duration-200 hover:bg-gray-50 flex flex-col gap-2"
    :class="active ? 'bg-gray-50 border-l-4' : ''"
    :style="active ? { borderLeftColor: configEstadoContacto.borderColor } : {}"
    @click="$emit('select', item.id_contacto)"
  >
    <div class="flex items-start justify-between gap-2 w-full">
      <div class="min-w-0 flex-1">
        <p class="truncate font-bold text-gray-900">{{ item.nombre_completo }}</p>
        <p class="truncate text-xs text-gray-500 mt-0.5">{{ item.correo_electronico }}</p>
      </div>
      
      <div class="flex flex-col gap-1 items-end shrink-0">
        <span 
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors"
          :class="configEstadoContacto.classes"
        >
          <component :is="configEstadoContacto.icon" class="w-3 h-3" />
          {{ configEstadoContacto.label }}
        </span>

        <span 
          v-if="mode === 'respondidos' && configEstadoEmail"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors"
          :class="configEstadoEmail.classes"
        >
          <component 
            :is="configEstadoEmail.icon" 
            class="w-3 h-3" 
            :class="{ 'animate-spin': configEstadoEmail.icon === LoaderCircle }" 
          />
          {{ configEstadoEmail.label }}
        </span>
      </div>
    </div>

    <div>
      <p class="truncate text-sm font-semibold text-gray-800">{{ item.asunto }}</p>
      <p class="text-[11px] text-gray-400 mt-1 font-medium">{{ formatDate(item.fecha_creacion) }}</p>
    </div>
  </button>
</template>