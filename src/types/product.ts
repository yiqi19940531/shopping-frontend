export interface Category {
  id: number
  name: string
  parentId: number
  children?: Category[]
}

export interface ProductVO {
  id: number
  spuNo: string
  name: string
  categoryId: number
  brand: string
  price: number
  originalPrice: number
  stock: number
  sales: number
  coverImageUrl: string
  description: string
  isHot: number
  isRecommend: number
}

export interface ProductDetail extends ProductVO {
  detail: string
  imageUrls: string[]
}

export interface ProductSearchParams {
  categoryId?: number
  keyword?: string
  pageNum?: number
  pageSize?: number
}
