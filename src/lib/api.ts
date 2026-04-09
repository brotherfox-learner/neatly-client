import axios from 'axios'

import { getApiBaseUrl } from './apiBaseUrl'
import { getSupabase } from './supabase'

function isPublicBackendPath(url: string | undefined): boolean {
  if (!url) {
    return false
  }
  const path = url.split('?')[0] ?? ''
  return path.startsWith('/actuator/')
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
})

api.interceptors.request.use(async (config) => {
  if (isPublicBackendPath(config.url)) {
    return config
  }

  const supabase = getSupabase()
  if (!supabase) {
    return config
  }

  const sessionResult = await Promise.race([
    supabase.auth.getSession(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5_000)),
  ])

  if (!sessionResult) {
    return config
  }

  const token = sessionResult.data.session?.access_token
  if (token) {
    if (!config.headers) {
      config.headers = {}
    }
    // ถ้ามี Authorization ถูกตั้งมาก่อน (เช่นจาก fetchMe(accessToken)) ให้ใช้ของเดิม
    if (!('Authorization' in config.headers)) {
      ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
    }
  }
  return config
})
