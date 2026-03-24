import { request } from '../request'
import type { OrderVO, AdminOrderSearchParams } from '@/types/order'
import type { PageResult } from '../types'

export function getAdminOrders(params: AdminOrderSearchParams) {
  return request<PageResult<OrderVO>>({ method: 'GET', url: '/api/admin/orders', params })
}

export function getAdminOrderDetail(orderNo: string) {
  return request<OrderVO>({ method: 'GET', url: `/api/admin/orders/${orderNo}` })
}

export function shipOrder(orderNo: string, data: { trackingNo: string }) {
  return request<null>({ method: 'PUT', url: `/api/admin/orders/${orderNo}/ship`, data })
}
