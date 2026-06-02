import axios from 'axios'
import { STORAGE_KEYS } from './constants'
import { toApiError} from './api-error'
const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/').replace(/\/+$/, '')

export const apiClient = axios.create({baseURL})

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER)
    }
    return Promise.reject(toApiError(error))  
  }
)
