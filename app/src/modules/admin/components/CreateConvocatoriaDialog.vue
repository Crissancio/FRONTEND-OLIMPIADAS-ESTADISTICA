<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Hash } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { useConvocatorias } from '@/modules/admin/composables/useConvocatorias'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const { createConvocatoria } = useConvocatorias()

const isLoading = ref(false)
const form = ref({
  nombre: '',
  gestion: String(new Date().getFullYear()),
  descripcion: '',
  inicioOlimpiada: '',
  finOlimpiada: '',
  inicioInscripcion: '',
  finInscripcion: '',
})

watch(
  () => props.open,
  (open) => {
    if (open) return
    form.value = {
      nombre: '',
      gestion: String(new Date().getFullYear()),
      descripcion: '',
      inicioOlimpiada: '',
      finOlimpiada: '',
      inicioInscripcion: '',
      finInscripcion: '',
    }
  },
)

const close = () => emit('update:open', false)

const handleSubmit = () => {
  if (!form.value.nombre.trim() || !form.value.descripcion.trim()) return

  isLoading.value = true
  setTimeout(() => {
    const created = createConvocatoria({
      nombre: form.value.nombre,
      gestion: Number(form.value.gestion),
      estado: 'Borrador',
      descripcion: form.value.descripcion,
      inicioOlimpiada: form.value.inicioOlimpiada,
      finOlimpiada: form.value.finOlimpiada,
      inicioInscripcion: form.value.inicioInscripcion,
      finInscripcion: form.value.finInscripcion,
    })

    isLoading.value = false
    close()
    router.push(`/admin/convocatoria/${created.id}/gestionar?nuevaConvocatoria=true`)
  }, 700)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-8">
    <Card class="w-full max-w-2xl overflow-hidden border-gray-200 bg-white">
      <CardContent class="p-0">
        <div class="border-b border-gray-200 bg-white px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <FileText class="h-5 w-5" />
            </div>
            <div>
              <h2 class="font-heading text-xl font-bold text-text-main">Crear Nueva Convocatoria</h2>
              <p class="text-sm text-text-muted">Se creara con estado borrador.</p>
            </div>
          </div>
        </div>

        <form class="space-y-4 p-6" @submit.prevent="handleSubmit">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-text-main">Nombre de la Olimpiada</label>
            <input v-model="form.nombre" required class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Ej: XXI Olimpiada de Estadistica" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-text-main"><Hash class="mr-1 inline h-3.5 w-3.5" />Gestion</label>
            <input v-model="form.gestion" required type="number" min="2020" max="2100" class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" />
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-text-main">Inicio Olimpiada</label>
              <input v-model="form.inicioOlimpiada" class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Marzo 2026" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-text-main">Fin Olimpiada</label>
              <input v-model="form.finOlimpiada" class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Noviembre 2026" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-text-main">Inicio Inscripcion</label>
              <input v-model="form.inicioInscripcion" class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="2026-03-01" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-text-main">Fin Inscripcion</label>
              <input v-model="form.finInscripcion" class="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="2026-04-30" />
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-text-main">Descripcion</label>
            <textarea v-model="form.descripcion" required class="min-h-[7rem] w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" @click="close">Cancelar</Button>
            <Button type="submit" variant="accent" :disabled="isLoading">{{ isLoading ? 'Creando...' : 'Crear Convocatoria' }}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
