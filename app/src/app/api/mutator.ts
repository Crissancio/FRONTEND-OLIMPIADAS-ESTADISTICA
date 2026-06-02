import type { AxiosRequestConfig } from 'axios'
import { apiClient } from './api-client'

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient({
    ...config,
    ...options,
  })
  return response.data
}