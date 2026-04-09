/**
 * Backend HTTP/WS base URL. Prefer VITE_API_BASE_URL; fall back to VITE_API_URL (used by axios in api.ts).
 */
export function getApiBaseUrl(): string {
  const raw =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080'
  return String(raw).replace(/\/$/, '')
}

export function getChatWebSocketUrl(): string {
  return getApiBaseUrl().replace(/^http/, 'ws') + '/ws/chat'
}
