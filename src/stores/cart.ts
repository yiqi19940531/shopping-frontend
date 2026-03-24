import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as cartApi from '@/api/cart'
import type { CartItem } from '@/types/cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  const cartCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const selectedItems = computed(() => items.value.filter((item) => item.isSelected === 1))
  const selectedCount = computed(() => selectedItems.value.length)
  const totalAmount = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + item.subtotal, 0),
  )

  async function fetchCart() {
    loading.value = true
    try {
      items.value = await cartApi.getCartList()
    } finally {
      loading.value = false
    }
  }

  async function addToCart(productId: number, quantity: number) {
    await cartApi.addToCart({ productId, quantity })
    await fetchCart()
  }

  async function updateQuantity(id: number, quantity: number) {
    await cartApi.updateCartQuantity(id, quantity)
    await fetchCart()
  }

  async function toggleSelect(id: number, isSelected: number) {
    await cartApi.toggleCartSelect(id, isSelected)
    await fetchCart()
  }

  async function removeItem(id: number) {
    await cartApi.removeCartItem(id)
    await fetchCart()
  }

  async function batchRemove(ids: number[]) {
    await cartApi.batchRemoveCartItems(ids)
    await fetchCart()
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    loading,
    cartCount,
    selectedItems,
    selectedCount,
    totalAmount,
    fetchCart,
    addToCart,
    updateQuantity,
    toggleSelect,
    removeItem,
    batchRemove,
    clearCart,
  }
})
