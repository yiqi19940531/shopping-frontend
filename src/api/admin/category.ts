import { request } from '../request'
import type { Category } from '@/types/product'

export interface CategoryForm {
  name: string
  parentId?: number
  level?: number
  sortOrder?: number
}

export function createCategory(data: CategoryForm) {
  return request<null>({ method: 'POST', url: '/api/admin/categories', data })
}

export function updateCategory(id: number, data: CategoryForm) {
  return request<null>({ method: 'PUT', url: `/api/admin/categories/${id}`, data })
}

export function deleteCategory(id: number) {
  return request<null>({ method: 'DELETE', url: `/api/admin/categories/${id}` })
}
