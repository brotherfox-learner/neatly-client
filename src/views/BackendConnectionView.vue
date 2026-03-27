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
  return 'เกิดข้อผิดพลาด'
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

const apiBase = computed(() => import.meta.env.VITE_API_URL || '(ตั้ง VITE_API_URL)')

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
      <h1 class="text-2xl font-semibold tracking-tight">ทดสอบการเชื่อมต่อ Backend</h1>
      <p class="text-muted-foreground text-sm">
        รัน Spring ที่ <span class="font-mono">{{ apiBase }}</span> และให้ CORS อนุญาต
        <span class="font-mono">http://localhost:5173</span> (ค่าเริ่มต้นของ server ตรงแล้ว)
      </p>
    </header>

    <section
      class="border-border bg-card text-card-foreground rounded-lg border p-4 shadow-sm"
      aria-labelledby="health-heading"
    >
      <h2 id="health-heading" class="mb-3 text-lg font-medium">Actuator health</h2>
      <p class="text-muted-foreground mb-3 text-sm">ไม่ต้อง login — ใช้ยืนยัน CORS + เซิร์ฟเวอร์ทำงาน</p>
      <Button class="mb-3" type="button" @click="() => refetchHealth()">โหลดใหม่</Button>
      <p v-if="healthPending" class="text-sm">กำลังโหลด…</p>
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
        ตั้งค่า <span class="font-mono">VITE_SUPABASE_URL</span> และ
        <span class="font-mono">VITE_SUPABASE_ANON_KEY</span> ใน <span class="font-mono">.env.local</span>
        แล้ว login ผ่าน Supabase เพื่อส่ง Bearer token
      </p>
      <template v-else-if="!hasSupabaseSession">
        <p class="text-muted-foreground mb-3 text-sm">
          ยังไม่มี session — ใช้ฟอร์มด้านล่าง (อีเมล/รหัสผ่าน) หรือ login จากแอปจริงของคุณ
        </p>
        <section
          class="bg-muted/40 mb-4 rounded-md border border-dashed p-4"
          aria-labelledby="dev-login-heading"
        >
          <h3 id="dev-login-heading" class="mb-2 text-sm font-medium">
            ทดสอบ login กับ Supabase (dev)
          </h3>
          <ol class="text-muted-foreground mb-4 list-decimal space-y-1 pl-5 text-xs">
            <li>
              ใน Supabase Dashboard → Authentication → เปิด Email provider แล้วสร้าง user (หรือ Sign up จากแอป)
            </li>
            <li>
              Authentication → URL configuration → ใส่
              <span class="font-mono">http://localhost:5173</span> ใน Site URL / Redirect URLs ถ้าใช้ magic link
            </li>
          </ol>
          <form class="space-y-3" @submit.prevent="signInWithPassword">
            <div class="space-y-1">
              <label class="text-sm font-medium" for="dev-login-email">อีเมล</label>
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
              <label class="text-sm font-medium" for="dev-login-password">รหัสผ่าน</label>
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
              {{ authBusy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ' }}
            </Button>
          </form>
        </section>
      </template>
      <template v-else>
        <p class="text-muted-foreground mb-2 text-sm">
          Session:
          <span class="text-foreground font-mono text-xs">{{ sessionEmail ?? '(มี access token)' }}</span>
        </p>
        <div class="mb-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" @click="() => signOut()">ออกจากระบบ</Button>
          <Button type="button" @click="() => refetchMe()">โหลด /me</Button>
        </div>
        <p v-if="mePending" class="text-sm">กำลังโหลด…</p>
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
