<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { computed, onMounted, ref, unref } from 'vue'
import { z } from 'zod'

import { Button } from '@/components/ui'
import { api } from '@/lib/api'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { userResponseSchema } from '@/schemas/userResponse'

function formatQueryError(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }
  return 'Something went wrong'
}

const healthSchema = z.object({ status: z.string() }).passthrough()

const hasSupabaseSession = ref(false)
const sessionEmail = ref<string | null>(null)

const loginEmail = ref('')
const loginPassword = ref('')
const authBusy = ref(false)
const authFormError = ref('')

onMounted(() => {
  const supabase = getSupabase()
  if (!supabase) {
    return
  }
  void supabase.auth.getSession().then(({ data }) => {
    hasSupabaseSession.value = Boolean(data.session?.access_token)
    sessionEmail.value = data.session?.user?.email ?? null
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    hasSupabaseSession.value = Boolean(session?.access_token)
    sessionEmail.value = session?.user?.email ?? null
  })
})

async function signInWithPassword() {
  const supabase = getSupabase()
  if (!supabase) {
    return
  }
  authBusy.value = true
  authFormError.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginPassword.value,
  })
  authBusy.value = false
  if (error) {
    authFormError.value = error.message
    return
  }
  loginPassword.value = ''
}

async function signOut() {
  const supabase = getSupabase()
  authFormError.value = ''
  await supabase?.auth.signOut()
}

const apiBase = computed(() => import.meta.env.VITE_API_URL || '(set VITE_API_URL)')

const {
  isPending: healthPending,
  isError: healthIsError,
  data: healthData,
  error: healthErr,
  refetch: refetchHealth,
} = useQuery({
  queryKey: ['backend', 'health'],
  queryFn: async () => {
    const { data } = await api.get<unknown>('/actuator/health')
    return healthSchema.parse(data)
  },
})

const {
  isPending: mePending,
  isError: meIsError,
  data: meData,
  error: meErr,
  refetch: refetchMe,
} = useQuery({
  queryKey: ['backend', 'me'],
  queryFn: async () => {
    const { data } = await api.get<unknown>('/api/v1/me')
    return userResponseSchema.parse(data)
  },
  enabled: hasSupabaseSession,
  retry: false,
})

const healthErrorText = computed(() => formatQueryError(unref(healthErr)))
const meErrorText = computed(() => formatQueryError(unref(meErr)))
</script>

<template>
  <article class="mx-auto max-w-2xl space-y-8 py-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">Backend connection test</h1>
      <p class="text-muted-foreground text-sm">
        Run Spring at <span class="font-mono">{{ apiBase }}</span> and allow CORS from
        <span class="font-mono">http://localhost:5173</span> (default server config should already
        allow this).
      </p>
    </header>

    <section
      class="border-border bg-card text-card-foreground rounded-lg border p-4 shadow-sm"
      aria-labelledby="health-heading"
    >
      <h2 id="health-heading" class="mb-3 text-lg font-medium">Actuator health</h2>
      <p class="text-muted-foreground mb-3 text-sm">
        No login required — use this to verify CORS and that the server is up.
      </p>
      <Button class="mb-3" type="button" @click="() => refetchHealth()">Reload</Button>
      <p v-if="healthPending" class="text-sm">Loading…</p>
      <p v-else-if="healthIsError" class="text-destructive text-sm">
        {{ healthErrorText }}
      </p>
      <pre v-else class="bg-muted overflow-x-auto rounded-md p-3 text-xs">{{
        JSON.stringify(healthData, null, 2)
      }}</pre>
    </section>

    <section
      class="border-border bg-card text-card-foreground rounded-lg border p-4 shadow-sm"
      aria-labelledby="me-heading"
    >
      <h2 id="me-heading" class="mb-3 text-lg font-medium">GET /api/v1/me</h2>
      <p v-if="!isSupabaseConfigured()" class="text-muted-foreground text-sm">
        Set <span class="font-mono">VITE_SUPABASE_URL</span> and
        <span class="font-mono">VITE_SUPABASE_ANON_KEY</span> in
        <span class="font-mono">.env.local</span>, then sign in with Supabase so requests include a
        Bearer token.
      </p>
      <template v-else-if="!hasSupabaseSession">
        <p class="text-muted-foreground mb-3 text-sm">
          No session yet — use the form below (email / password) or sign in from your main app.
        </p>
        <section
          class="bg-muted/40 mb-4 rounded-md border border-dashed p-4"
          aria-labelledby="dev-login-heading"
        >
          <h3 id="dev-login-heading" class="mb-2 text-sm font-medium">
            Test Supabase sign-in (dev)
          </h3>
          <ol class="text-muted-foreground mb-4 list-decimal space-y-1 pl-5 text-xs">
            <li>
              In Supabase Dashboard → Authentication, enable the Email provider and create a user
              (or sign up from your app).
            </li>
            <li>
              Under Authentication → URL configuration, add
              <span class="font-mono">http://localhost:5173</span> to Site URL / Redirect URLs if
              you use magic links.
            </li>
          </ol>
          <form class="space-y-3" @submit.prevent="signInWithPassword">
            <div class="space-y-1">
              <label class="text-sm font-medium" for="dev-login-email">Email</label>
              <input
                id="dev-login-email"
                v-model="loginEmail"
                autocomplete="email"
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-md rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                name="email"
                required
                type="email"
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium" for="dev-login-password">Password</label>
              <input
                id="dev-login-password"
                v-model="loginPassword"
                autocomplete="current-password"
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-md rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                name="password"
                required
                type="password"
              />
            </div>
            <p v-if="authFormError" class="text-destructive text-sm">{{ authFormError }}</p>
            <Button :disabled="authBusy" type="submit">
              {{ authBusy ? 'Signing in…' : 'Sign in' }}
            </Button>
          </form>
        </section>
      </template>
      <template v-else>
        <p class="text-muted-foreground mb-2 text-sm">
          Session:
          <span class="text-foreground font-mono text-xs">{{ sessionEmail ?? '(has access token)' }}</span>
        </p>
        <div class="mb-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" @click="() => signOut()">Sign out</Button>
          <Button type="button" @click="() => refetchMe()">Load /me</Button>
        </div>
        <p v-if="mePending" class="text-sm">Loading…</p>
        <p v-else-if="meIsError" class="text-destructive text-sm">
          {{ meErrorText }}
        </p>
        <pre v-else class="bg-muted overflow-x-auto rounded-md p-3 text-xs">{{
          JSON.stringify(meData, null, 2)
        }}</pre>
      </template>
    </section>
  </article>
</template>
