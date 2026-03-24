import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo } from '@/api/auth'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  const isAdmin = computed(() => userInfo.value?.role === 'ADMIN')
  const userId = computed(() => userInfo.value?.id ?? null)
  const nickname = computed(() => userInfo.value?.nickname || userInfo.value?.username || '')

  async function fetchUserInfo() {
    const info = await getUserInfo()
    userInfo.value = info
  }

  function clearUserInfo() {
    userInfo.value = null
  }

  return { userInfo, isAdmin, userId, nickname, fetchUserInfo, clearUserInfo }
})
