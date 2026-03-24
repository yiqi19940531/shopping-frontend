import type { OrderStatus } from '@/types/order'

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '待付款',
  PAID: '待发货',
  SHIPPED: '已发货',
  RECEIVED: '已收货',
  CANCELLED: '已取消',
}

export const ORDER_STATUS_TYPE_MAP: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  SHIPPED: '',
  RECEIVED: 'success',
  CANCELLED: 'danger',
}
