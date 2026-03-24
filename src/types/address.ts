export interface Address {
  id: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault?: number
}

export interface AddressForm {
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
}
