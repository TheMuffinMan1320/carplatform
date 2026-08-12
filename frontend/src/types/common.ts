export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface PageParams {
  page?: number
  size?: number
  sort?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  code: string
  message: string
  path: string
  validationErrors: ValidationError[] | null
}
