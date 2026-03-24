import { request } from './request'
import type { LoginParams, RegisterParams, LoginResult, UserInfo } from '@/types/user'

export function login(data: LoginParams) {
  return request<LoginResult>({ method: 'POST', url: '/api/auth/login', data })
}

export function register(data: RegisterParams) {
  return request<null>({ method: 'POST', url: '/api/auth/register', data })
}

export function getUserInfo() {
  return request<UserInfo>({ method: 'GET', url: '/api/auth/info' })
}
