import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCategories } from '@/api/product'
import type { Category } from '@/types/product'

export const useAdminStore = defineStore('admin', () => {
  const categories = ref<Category[]>([])

  async function fetchCategories() {
    categories.value = await getCategories()
  }

  return { categories, fetchCategories }
})
