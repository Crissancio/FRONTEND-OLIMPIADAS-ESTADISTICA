import { ref, computed } from 'vue'
import { TUTORIALES, MODULOS_TUTORIALES } from '../data/tutoriales.data'

export function useTutoriales() {
  const moduloActivo = ref<string>('Todos')

  const tutorialesFiltrados = computed(() => {
    if (moduloActivo.value === 'Todos') return TUTORIALES
    return TUTORIALES.filter((t) => t.module === moduloActivo.value)
  })

  const modulos = computed(() => ['Todos', ...MODULOS_TUTORIALES])

  return {
    moduloActivo,
    tutorialesFiltrados,
    modulos,
  }
}