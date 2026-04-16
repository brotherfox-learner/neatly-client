/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Preferred base URL for REST + WebSocket (chat). Falls back to VITE_API_URL. */
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}