import { request } from './request'
import type { Address, AddressForm } from '@/types/address'

export function getAddresses() {
  return request<Address[]>({ method: 'GET', url: '/api/addresses' })
}

export function createAddress(data: AddressForm) {
  return request<Address>({ method: 'POST', url: '/api/addresses', data })
}

export function updateAddress(id: number, data: AddressForm) {
  return request<null>({ method: 'PUT', url: `/api/addresses/${id}`, data })
}

export function setDefaultAddress(id: number) {
  return request<null>({ method: 'PUT', url: `/api/addresses/${id}/default` })
}

export function deleteAddress(id: number) {
  return request<null>({ method: 'DELETE', url: `/api/addresses/${id}` })
}
