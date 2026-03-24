import { request } from './request'
import type { OrderVO, CreateOrderParams, OrderSearchParams } from '@/types/order'
import type { PageResult } from './types'

export function createOrder(data: CreateOrderParams) {
  return request<OrderVO>({ method: 'POST', url: '/api/orders', data })
}

export function getOrders(params: OrderSearchParams) {
  return request<PageResult<OrderVO>>({ method: 'GET', url: '/api/orders', params })
}

export function getOrderDetail(orderNo: string) {
  return request<OrderVO>({ method: 'GET', url: `/api/orders/${orderNo}` })
}

export function cancelOrder(orderNo: string, reason?: string) {
  return request<null>({ method: 'PUT', url: `/api/orders/${orderNo}/cancel`, params: { reason } })
}

export function confirmReceive(orderNo: string) {
  return request<null>({ method: 'PUT', url: `/api/orders/${orderNo}/receive` })
}
