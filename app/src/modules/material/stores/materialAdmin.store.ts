import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMaterialAdminStore = defineStore('materialAdmin', () => {
  const filters = ref({
    busqueda: '',
    tipo_material: 'all'
  })
  const scrollPosition = ref(0)

  return {
    filters,
    scrollPosition
  }
})