<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, CheckCircle2, Info, ThumbsUp, X, XCircle } from 'lucide-vue-next'

type AlertVariant = 'success' | 'info' | 'warning' | 'danger' | 'primary'

const props = withDefaults(defineProps<{
  variant?: AlertVariant
  statusCode?: number
  title?: string
  message?: string
  dismissible?: boolean
}>(), {
  variant: undefined,
  statusCode: undefined,
  title: undefined,
  message: undefined,
  dismissible: true,
})

const isVisible = ref(true)

const variantFromStatus = computed<AlertVariant>(() => {
  if (props.variant) return props.variant
  const code = props.statusCode ?? 200
  if (code >= 200 && code < 300) return 'success'
  if (code >= 300 && code < 400) return 'primary'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'danger'
  return 'info'
})

const defaultContent: Record<AlertVariant, { title: string; message: string }> = {
  success: {
    title: 'Correcto',
    message: 'La operación se completó correctamente.',
  },
  info: {
    title: 'Información',
    message: 'Revisa esta información antes de continuar.',
  },
  warning: {
    title: 'Atención',
    message: 'Verifica los datos enviados e intenta nuevamente.',
  },
  danger: {
    title: 'Error',
    message: 'No se pudo completar la operación.',
  },
  primary: {
    title: 'Listo',
    message: 'La solicitud fue procesada.',
  },
}

const variantStyles = {
  success: {
    wrapper: 'border-success/70 bg-success/10 text-success shadow-[0_0_2px_var(--color-success)] hover:bg-success/20',
    accent: 'bg-success',
    icon: CheckCircle2,
  },
  info: {
    wrapper: 'border-primary/70 bg-primary/10 text-primary shadow-[0_0_2px_var(--color-primary)] hover:bg-primary/20',
    accent: 'bg-primary',
    icon: Info,
  },
  warning: {
    wrapper: 'border-accent/80 bg-accent/10 text-accent-dark shadow-[0_0_2px_var(--color-accent)] hover:bg-accent/20',
    accent: 'bg-accent',
    icon: AlertTriangle,
  },
  danger: {
    wrapper: 'border-danger/80 bg-danger/10 text-danger shadow-[0_0_2px_var(--color-danger)] hover:bg-danger/20',
    accent: 'bg-danger',
    icon: XCircle,
  },
  primary: {
    wrapper: 'border-secondary/80 bg-secondary/10 text-secondary shadow-[0_0_2px_var(--color-secondary)] hover:bg-secondary/20',
    accent: 'bg-secondary',
    icon: ThumbsUp,
  },
} satisfies Record<AlertVariant, { wrapper: string; accent: string; icon: typeof CheckCircle2 }>

const currentStyle = computed(() => variantStyles[variantFromStatus.value])
const currentContent = computed(() => defaultContent[variantFromStatus.value])
const alertTitle = computed(() => props.title ?? currentContent.value.title)
const alertMessage = computed(() => props.message ?? currentContent.value.message)
</script>

<template>
  <div
    v-if="isVisible"
    role="alert"
    :class="[
      'status-alert relative flex w-full items-start gap-3 overflow-hidden rounded-md border px-4 py-4 text-sm font-medium transition-colors duration-300 sm:items-center sm:px-6',
      currentStyle.wrapper,
    ]"
  >
    <span :class="['absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r', currentStyle.accent]" />

    <component :is="currentStyle.icon" class="status-alert__icon mt-0.5 h-5 w-5 shrink-0 sm:mt-0" />

    <div class="min-w-0 flex-1 leading-6">
      <strong class="font-heading font-black">{{ alertTitle }}.</strong>
      <span class="ml-1">{{ alertMessage }}</span>
    </div>

    <button
      v-if="dismissible"
      type="button"
      class="status-alert__close -mr-1 rounded-md p-1 transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
      aria-label="Cerrar alerta"
      @click="isVisible = false"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

<style scoped>
.status-alert__icon {
  animation: status-alert-pulse 1.8s ease-in-out infinite;
}

.status-alert__close {
  animation: status-alert-blink 2s infinite both;
}

@keyframes status-alert-pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.12);
  }
}

@keyframes status-alert-blink {
  0%,
  50%,
  100% {
    opacity: 1;
  }

  25%,
  75% {
    opacity: 0.45;
  }
}
</style>
