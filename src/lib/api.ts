import axios, { AxiosHeaders } from 'axios'

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

let isRedirectingToLogin = false

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
      config.headers = new AxiosHeaders()
    }
    // If Authorization was already set (e.g. fetchMe(accessToken)), keep it.
    if (!('Authorization' in config.headers)) {
      ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const requestUrl = error.config?.url
      if (status === 401 && !isPublicBackendPath(requestUrl) && typeof window !== 'undefined' && !isRedirectingToLogin) {
        isRedirectingToLogin = true
        const currentPath = `${window.location.pathname}${window.location.search}`
        const redirect = encodeURIComponent(currentPath)
        window.location.assign(`/login?redirect=${redirect}&reason=session-expired`)
      }
    }
    return Promise.reject(error)
  },
)
