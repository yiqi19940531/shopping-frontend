export interface UserInfo {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  role: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  nickname?: string
  phone?: string
}

export interface LoginResult {
  token: string
  userId: number
  username: string
  nickname: string
  role: string
}
