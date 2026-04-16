import './assets/main.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { getSupabase } from './lib/supabase'
import router from './router'
import { isMeUnauthorized, useAuthStore } from './stores/auth'

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
  supabase?.auth.onAuthStateChange(async (event, session) => {
    // Only treat explicit sign-out as "no user". Other events can briefly report
    // no session during token refresh; clearing `user` there caused SPA navigations
    // (e.g. admin sidebar) to hit the login guard until a full page reload.
    if (event === "SIGNED_OUT") {
      authStore.user = null
      authStore.initialized = true
      return
    }

    if (!session?.access_token) {
      authStore.initialized = true
      return
    }

    try {
      await authStore.fetchMe(session.access_token)
      authStore.initialized = true
    } catch (e) {
      // Fires on INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, etc. A transient /me
      // failure must not clear the profile; only real auth errors should log out.
      if (isMeUnauthorized(e)) {
        authStore.user = null
        await supabase.auth.signOut()
      }
      authStore.initialized = true
    }
  })

  app.mount('#app')
}

void bootstrap()
