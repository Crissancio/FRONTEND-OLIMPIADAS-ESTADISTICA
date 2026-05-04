import { adminConvocatoriasMock, type AdminConvocatoria } from '@/modules/admin/data/admin.data'

const STORAGE_KEY = 'admin_convocatorias'

const ensureStorage = () => {
  const current = localStorage.getItem(STORAGE_KEY)
  if (current) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(adminConvocatoriasMock))
}

export const getConvocatorias = (): AdminConvocatoria[] => {
  ensureStorage()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return JSON.parse(raw) as AdminConvocatoria[]
}

export const getConvocatoriaById = (id: string): AdminConvocatoria | undefined => {
  const data = getConvocatorias()
  return data.find((item) => item.id === id)
}

export const createConvocatoria = (
  payload: Omit<AdminConvocatoria, 'id' | 'inscritos' | 'categorias' | 'fases'>,
): AdminConvocatoria => {
  const data = getConvocatorias()
  const newItem: AdminConvocatoria = {
    id: `conv-${Date.now()}`,
    inscritos: 0,
    categorias: 0,
    fases: 0,
    ...payload,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...data]))
  return newItem
}

export const updateConvocatoria = (
  id: string,
  updates: Partial<AdminConvocatoria>,
): AdminConvocatoria | null => {
  const data = getConvocatorias()
  const index = data.findIndex((item) => item.id === id)
  if (index < 0) return null
  const updated = { ...data[index], ...updates, id }
  data[index] = updated
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return updated
}
