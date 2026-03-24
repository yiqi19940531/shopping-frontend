export interface CartItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  productStock: number
  productCoverUrl: string
  quantity: number
  isSelected: number
  subtotal: number
}

export interface AddCartParams {
  productId: number
  quantity: number
}
