import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/auth'
import { getToken, setToken, removeToken } from '@/utils/storage'
import type { LoginParams, RegisterParams } from '@/types/user'
import { useUserStore } from './user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())

  const isLoggedIn = computed(() => !!token.value)

  async function login(params: LoginParams) {
    const res = await loginApi(params)
    token.value = res.token
    setToken(res.token)
    // 登录成功后拉取用户信息
    const userStore = useUserStore()
    await userStore.fetchUserInfo()
  }

  async function registerUser(params: RegisterParams) {
    await registerApi(params)
  }

  function logout() {
    token.value = null
    removeToken()
    const userStore = useUserStore()
    userStore.clearUserInfo()
  }

  return { token, isLoggedIn, login, registerUser, logout }
})
