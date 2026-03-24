import { request } from './request'
import type { CartItem, AddCartParams } from '@/types/cart'

export function getCartList() {
  return request<CartItem[]>({ method: 'GET', url: '/api/cart' })
}

export function addToCart(data: AddCartParams) {
  return request<null>({ method: 'POST', url: '/api/cart', data })
}

export function updateCartQuantity(id: number, quantity: number) {
  return request<null>({ method: 'PUT', url: `/api/cart/${id}`, params: { quantity } })
}

export function toggleCartSelect(id: number, isSelected: number) {
  return request<null>({ method: 'PUT', url: `/api/cart/${id}/select`, params: { isSelected } })
}

export function removeCartItem(id: number) {
  return request<null>({ method: 'DELETE', url: `/api/cart/${id}` })
}

export function batchRemoveCartItems(ids: number[]) {
  return request<null>({ method: 'DELETE', url: '/api/cart/batch', data: ids })
}
