import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/storage'
import type { ApiResponse } from './types'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

// 请求拦截器：注入 JWT Token
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：统一处理错误 & 解包 data
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401) {
        removeToken()
        const redirect = encodeURIComponent(window.location.hash.slice(1) || '/')
        window.location.hash = `/login?redirect=${redirect}`
      }
      return Promise.reject(new Error(res.message))
    }
    return res.data as any
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      removeToken()
      window.location.hash = '/login'
    } else if (status === 403) {
      ElMessage.error('没有操作权限')
    } else {
      ElMessage.error(error.response?.data?.message || '网络错误')
    }
    return Promise.reject(error)
  },
)

export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return service(config) as unknown as Promise<T>
}

export default service
