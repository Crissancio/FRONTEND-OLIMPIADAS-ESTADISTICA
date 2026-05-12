import type { AxiosError } from 'axios'

export type ApiError = {
  status?: number
  message: string
  details?: unknown
}

export function toApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<any> | undefined
  const status = axiosError?.response?.status
  const message =
    axiosError?.response?.data?.detail ??
    axiosError?.message ??
    (typeof error === 'string' ? error : 'Unknown error')

  return {
    status,
    message,
    details: axiosError?.response?.data
  }
}
