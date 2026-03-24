export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  pages: number
}
