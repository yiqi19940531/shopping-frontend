import { request } from '../request'
import type { ProductVO, ProductDetail, ProductSearchParams } from '@/types/product'
import type { PageResult } from '../types'

export interface AdminProductForm {
  name: string
  categoryId: number
  brand?: string
  price: number
  originalPrice?: number
  stock?: number
  coverImageId?: string
  description?: string
  detail?: string
  isHot?: number
  isRecommend?: number
  imageFileIds?: string[]
}

export function getAdminProducts(params: ProductSearchParams) {
  return request<PageResult<ProductVO>>({ method: 'GET', url: '/api/admin/products', params })
}

export function getAdminProduct(id: number) {
  return request<ProductDetail>({ method: 'GET', url: `/api/admin/products/${id}` })
}

export function createProduct(data: AdminProductForm) {
  return request<null>({ method: 'POST', url: '/api/admin/products', data })
}

export function updateProduct(id: number, data: AdminProductForm) {
  return request<null>({ method: 'PUT', url: `/api/admin/products/${id}`, data })
}

export function deleteProduct(id: number) {
  return request<null>({ method: 'DELETE', url: `/api/admin/products/${id}` })
}

export function updateProductStatus(id: number, status: number) {
  return request<null>({ method: 'PUT', url: `/api/admin/products/${id}/status`, params: { status } })
}

export function updateProductStock(id: number, stock: number) {
  return request<null>({ method: 'PUT', url: `/api/admin/products/${id}/stock`, params: { stock } })
}

export function updateProductPrice(id: number, price: number) {
  return request<null>({ method: 'PUT', url: `/api/admin/products/${id}/price`, params: { price } })
}
