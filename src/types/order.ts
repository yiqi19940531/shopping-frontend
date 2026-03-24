export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED'

export interface OrderItem {
  productId: number
  productName: string
  productImageUrl: string
  price: number
  quantity: number
  totalAmount: number
}

export interface OrderVO {
  orderNo: string
  totalAmount: number
  status: OrderStatus
  statusDesc: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  trackingNo: string
  remark: string
  createTime: string
  paymentTime: string
  shipTime: string
  items: OrderItem[]
}

export interface CreateOrderParams {
  cartItemIds: number[]
  addressId: number
  remark?: string
}

export interface OrderSearchParams {
  status?: OrderStatus | ''
  pageNum?: number
  pageSize?: number
}

export interface AdminOrderSearchParams {
  orderNo?: string
  userId?: number
  status?: OrderStatus | ''
  pageNum?: number
  pageSize?: number
}
