<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowRight, UserCheck } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

const emit = defineEmits<{
  (e: 'verificar', payload: { ci: string; fechaNacimiento: Date }): void
}>()

const ci = ref('')

const fechaNacimiento = ref<Date | null>(null)

// Bloqueamos exactamente 13 años atrás
const limiteMaximo = computed(() => {
  const hoy = new Date()
  hoy.setFullYear(hoy.getFullYear() - 13)
  return hoy
})

const onSubmit = () => {
  if (!ci.value || !fechaNacimiento.value) return
  // Eliminamos cualquier espacio accidental en el CI
  emit('verificar', { ci: ci.value.trim(), fechaNacimiento: fechaNacimiento.value })
}
</script>

<template>
  <div class="max-w-md mx-auto py-6">
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <UserCheck class="w-8 h-8 text-primary" />
      </div>
      <h3 class="text-2xl font-heading font-bold text-text-main mb-2">Verificación Inicial</h3>
      <p class="text-text-muted text-sm">
        Ingresa tus datos para verificar si ya estás en nuestro sistema o si eres un estudiante nuevo.
      </p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-5">
      <div class="form-group">
        <label class="block text-sm font-semibold text-text-main mb-1.5">Carnet de Identidad</label>
        <input 
          v-model="ci" 
          type="text" 
          required
          class="w-full h-11 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
          placeholder="Ej. 1234567" 
        />
      </div>

      <div class="form-group">
        <label class="block text-sm font-semibold text-text-main mb-1.5">Fecha de Nacimiento</label>
        <DatePicker v-model="fechaNacimiento" :max-date="limiteMaximo">
          <template #default="{ inputValue, inputEvents }">
            <input
              :value="inputValue"
              v-on="inputEvents"
              required
              readonly
              class="w-full h-11 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm cursor-pointer focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Selecciona tu fecha"
            />
          </template>
        </DatePicker>
      </div>

      <Button type="submit" variant="default" size="lg" class="w-full font-bold flex justify-center items-center gap-2 mt-4">
        Continuar <ArrowRight class="w-5 h-5" />
      </Button>
    </form>
  </div>
</template>