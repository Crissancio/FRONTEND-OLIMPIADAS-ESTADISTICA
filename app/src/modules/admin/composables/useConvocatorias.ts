import { ref } from 'vue'
import type { AdminConvocatoria, AdminConvocatoriaStatus } from '@/modules/admin/data/admin.data'
import { ConvocatoriasService } from '@/modules/convocatorias/services/convocatorias.service'
import { toApiError } from '@/app/api/api-error'
import type {
  ConvocatoriaCreateDTO,
  ConvocatoriaResponseDTO,
  ConvocatoriaUpdateDTO
} from '@/modules/convocatorias/types/convocatorias.api'

type AdminConvocatoriaId = string

const toAdminStatus = (estado: string): AdminConvocatoriaStatus => {
  // Backend enum (DB): BORRADOR, FINALIZADA, PROXIMA, ACTIVA, INSCRIPCION EN CURSO
  // UI: Title Case.
  const normalized = (estado || '')
    .trim()
    .toUpperCase()
    // Backend might return underscores or extra spacing.
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
  if (normalized === 'BORRADOR') return 'Borrador'
  if (normalized === 'ACTIVA') return 'Activa'
  if (normalized === 'FINALIZADA') return 'Finalizada'
  if (normalized === 'PROXIMA') return 'Proxima'
  if (normalized === 'INSCRIPCION EN CURSO') return 'Inscripcion en curso'

  // Allow already-mapped UI strings.
  if (estado === 'Activa' || estado === 'Borrador' || estado === 'Finalizada') return estado
  if (estado === 'Proxima' || estado === 'Inscripcion en curso') return estado

  return 'Borrador'
}

const toAdminConvocatoria = (dto: ConvocatoriaResponseDTO): AdminConvocatoria => {
  return {
    id: String(dto.id_convocatoria),
    nombre: dto.nombre_convocatoria,
    gestion: dto.gestion,
    estado: toAdminStatus(dto.estado),
    inscritos: 0,
    categorias: 0,
    fases: 0,
    montoInscripcion: dto.monto_inscripcion ?? null,
    descripcion: dto.descripcion ?? '',
    inicioOlimpiada: dto.inicio_olimpiadas ?? '',
    finOlimpiada: dto.fin_olimpiadas ?? '',
    inicioInscripcion: dto.fecha_inicio_inscripcion ?? '',
    finInscripcion: dto.fecha_fin_inscripcion ?? ''
  }
}

const toUpdateDTO = (updates: Partial<AdminConvocatoria>): ConvocatoriaUpdateDTO => {
  const dto: ConvocatoriaUpdateDTO = {}

  if ('nombre' in updates) dto.nombre_convocatoria = updates.nombre ?? null
  if ('gestion' in updates) dto.gestion = updates.gestion ?? null
  if ('descripcion' in updates) dto.descripcion = updates.descripcion ?? null
  if ('inicioOlimpiada' in updates) dto.inicio_olimpiadas = updates.inicioOlimpiada ?? null
  if ('finOlimpiada' in updates) dto.fin_olimpiadas = updates.finOlimpiada ?? null
  if ('inicioInscripcion' in updates) dto.fecha_inicio_inscripcion = updates.inicioInscripcion ?? null
  if ('finInscripcion' in updates) dto.fecha_fin_inscripcion = updates.finInscripcion ?? null
  if ('montoInscripcion' in updates) dto.monto_inscripcion = updates.montoInscripcion ?? null
  if ('estado' in updates) dto.estado = updates.estado ?? null

  return dto
}

export const useConvocatorias = () => {
  const convocatorias = ref<AdminConvocatoria[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const page = ref(1)
  const limit = ref(10)
  const total = ref(0)
  const totalPages = ref(0)

  const refresh = async (params?: { page?: number; limit?: number }) => {
    isLoading.value = true
    error.value = null

    try {
      if (typeof params?.page === 'number') page.value = params.page
      if (typeof params?.limit === 'number') limit.value = params.limit

      const res = await ConvocatoriasService.list({ page: page.value, limit: limit.value })
      convocatorias.value = res.data.items.map(toAdminConvocatoria)
      total.value = res.data.meta.total
      totalPages.value = res.data.meta.total_pages
    } catch (e) {
      error.value = toApiError(e).message
      convocatorias.value = []
    } finally {
      isLoading.value = false
    }
  }

  const createConvocatoria = async (payload: ConvocatoriaCreateDTO) => {
    const res = await ConvocatoriasService.create(payload)
    const created = toAdminConvocatoria(res.data)
    await refresh({ page: 1 })
    return created
  }

  const updateConvocatoria = async (id: AdminConvocatoriaId, updates: Partial<AdminConvocatoria>) => {
    const numericId = Number(id)
    if (!Number.isFinite(numericId)) return null

    const res = await ConvocatoriasService.update(numericId, toUpdateDTO(updates))
    await refresh()
    return toAdminConvocatoria(res.data)
  }

  void refresh()

  return {
    convocatorias,
    isLoading,
    error,
    page,
    limit,
    total,
    totalPages,
    refresh,
    createConvocatoria,
    updateConvocatoria,
  }
}

export const useConvocatoria = (id?: string) => {
  const convocatoria = ref<AdminConvocatoria | undefined>(undefined)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const refresh = async () => {
    isLoading.value = true
    error.value = null

    if (!id) {
      convocatoria.value = undefined
      isLoading.value = false
      return
    }

    const numericId = Number(id)
    if (!Number.isFinite(numericId)) {
      convocatoria.value = undefined
      isLoading.value = false
      return
    }

    try {
      const res = await ConvocatoriasService.getById(numericId)
      convocatoria.value = toAdminConvocatoria(res.data)
    } catch (e) {
      error.value = toApiError(e).message
      convocatoria.value = undefined
    } finally {
      isLoading.value = false
    }
  }

  const update = async (updates: Partial<AdminConvocatoria>) => {
    if (!id) return null
    const numericId = Number(id)
    if (!Number.isFinite(numericId)) return null

    const res = await ConvocatoriasService.update(numericId, toUpdateDTO(updates))
    convocatoria.value = toAdminConvocatoria(res.data)
    return convocatoria.value
  }

  const publish = async () => {
    if (!id) return null
    const numericId = Number(id)
    if (!Number.isFinite(numericId)) return null

    const res = await ConvocatoriasService.publish(numericId)
    convocatoria.value = toAdminConvocatoria(res.data)
    return convocatoria.value
  }

  void refresh()

  return {
    convocatoria,
    isLoading,
    error,
    refresh,
    update,
    publish,
  }
}
