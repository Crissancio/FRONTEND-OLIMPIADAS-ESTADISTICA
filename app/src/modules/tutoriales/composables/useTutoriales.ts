import { ref, computed } from 'vue'
import { TUTORIALES, MODULOS_TUTORIALES, MODULO_LABELS, normalizar } from '../data/tutoriales.data'
import type { TutorialModule } from '../data/tutoriales.data'

export function useTutoriales() {
  const moduloActivo = ref<TutorialModule | 'Todos'>('Todos')
  const busqueda = ref('')

  const tutorialesFiltrados = computed(() => {
    let lista = moduloActivo.value === 'Todos'
      ? TUTORIALES
      : TUTORIALES.filter((t) => t.module === moduloActivo.value)

    const q = normalizar(busqueda.value)
    if (q) {
      lista = lista.filter(
        (t) =>
          normalizar(t.title).includes(q) ||
          normalizar(t.description).includes(q),
      )
    }

    return lista
  })

  const modulos = computed(() => MODULOS_TUTORIALES)
  const moduloLabels = MODULO_LABELS

  return {
    moduloActivo,
    busqueda,
    tutorialesFiltrados,
    modulos,
    moduloLabels,
  }
}