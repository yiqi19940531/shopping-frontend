import { request } from './request'
import { getToken } from '@/utils/storage'

export interface UploadResult {
  fileId: string
  url: string
}

export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<UploadResult>({
    method: 'POST',
    url: '/api/files/upload',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function getFileUrl(fileId: string): string {
  if (!fileId) return ''
  if (fileId.startsWith('http')) return fileId
  const base = import.meta.env.VITE_API_BASE_URL || ''
  return `${base}/api/files/${fileId}`
}

export function getUploadHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getUploadAction(): string {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  return `${base}/api/files/upload`
}
