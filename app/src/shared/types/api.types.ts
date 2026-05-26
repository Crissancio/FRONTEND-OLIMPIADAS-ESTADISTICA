export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface PaginatedData<T> {
  items: T[]
  meta: PaginationMeta
}

export interface PaginatedResponse<T> {
  data: PaginatedData<T>
  message: string
}

export interface ResponseBase<T> {
  data: T
  message: string
}