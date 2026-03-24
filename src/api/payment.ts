import { request } from './request'

export function pay(orderNo: string) {
  return request<null>({ method: 'POST', url: '/api/payment/pay', params: { orderNo } })
}
