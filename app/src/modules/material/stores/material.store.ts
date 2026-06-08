import { defineStore } from 'pinia'
import { publicService } from '@/modules/public/services/public.service'
import { toApiError } from '@/app/api/api-error'
import type { MaterialPublicoGeneralDTO, GetMaterialesPublicParams } from '@/modules/public/types/public.api'

export const useMaterialStore = defineStore('publicMateriales', {
  state: () => ({
    items: [] as MaterialPublicoGeneralDTO[],
    totalPages: 1,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchMateriales(params: GetMaterialesPublicParams, append = false) {
      this.loading = true
      this.error = null
      try {
        const res = await publicService.obtenerMateriales(params)
        if (res && res.data) {
          if (append) {
            this.items = [...this.items, ...res.data.items]
          } else {
            this.items = res.data.items
          }
          this.totalPages = res.data.meta.total_pages
        }
      } catch (err) {
        this.error = toApiError(err).message
      } finally {
        this.loading = false
      }
    },
    resetStore() {
      this.items = []
      this.totalPages = 1
      this.error = null
      this.loading = false
    }
  }
})