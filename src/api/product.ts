import { request } from './request'
import type { Category, ProductVO, ProductDetail, ProductSearchParams } from '@/types/product'
import type { PageResult } from './types'

export function getCategories() {
  return request<Category[]>({ method: 'GET', url: '/api/categories' })
}

export function getHotProducts(limit = 10) {
  return request<ProductVO[]>({ method: 'GET', url: '/api/products/hot', params: { limit } })
}

export function getRecommendProducts(limit = 10) {
  return request<ProductVO[]>({ method: 'GET', url: '/api/products/recommend', params: { limit } })
}

export function getProducts(params: ProductSearchParams) {
  return request<PageResult<ProductVO>>({ method: 'GET', url: '/api/products', params })
}

export function getProductDetail(id: number) {
  return request<ProductDetail>({ method: 'GET', url: `/api/products/${id}` })
}
