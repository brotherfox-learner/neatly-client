import './assets/main.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { getSupabase } from './lib/supabase'
import router from './router'
import { useAuthStore } from './stores/auth'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 60_000,
        },
      },
    },
  })
  app.use(router)

  const authStore = useAuthStore(pinia)
  await authStore.initializeFromSession()

  const supabase = getSupabase()
  supabase?.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.access_token) {
      authStore.user = null
      authStore.initialized = true
      return
    }
    try {
      await authStore.fetchMe()
      authStore.initialized = true
    } catch {
      authStore.user = null
      authStore.initialized = true
    }
  })

  app.mount('#app')
}

void bootstrap()
