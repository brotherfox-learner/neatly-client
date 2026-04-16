<script setup lang="ts">
import { computed, ref } from "vue"
import { z } from "zod"
import { RouterLink } from "vue-router"
import { useRoute, useRouter } from "vue-router"

import { isSupabaseConfigured } from "@/lib/supabase"
import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref("")
const password = ref("")
const fieldErrors = ref<{ email?: string; password?: string }>({})
const authError = ref("")
const isSubmitting = ref(false)

const isAuthReady = computed(() => isSupabaseConfigured())

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

async function onSubmit() {
  if (!isAuthReady.value) {
    authError.value = "Supabase is not configured."
    return
  }

  authError.value = ""
  fieldErrors.value = {}

  const parsed = loginSchema.safeParse({
    email: email.value,
    password: password.value,
  })

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (field === "email" || field === "password") {
        fieldErrors.value[field] = issue.message
      }
    }
    return
  }

  isSubmitting.value = true
  try {
    await authStore.signIn(email.value, password.value)
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : null
    if (redirect) {
      await router.push(redirect)
      return
    }
    if (authStore.isAdmin) {
      await router.push({ name: "admin-customer-booking" })
      return
    }
    await router.push({ name: "home" })
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "Login failed."
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <article class="bg-white lg:bg-green-700">
    <section
      class="mx-auto w-full max-w-[1440px] lg:grid lg:h-[min(924px,calc(100dvh-100px))] lg:min-h-[700px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,708px)_minmax(0,732px)]"
    >
      <section class="relative h-[269px] w-full lg:hidden">
        <img src="/loginimage.svg" alt="Hotel exterior with pool" class="h-full w-full object-cover" />
        <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black/40"></div>
      </section>

      <section class="relative hidden h-full lg:block">
        <img src="/loginimage.svg" alt="Hotel exterior with pool" class="h-full w-full object-cover" />
        <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black/40"></div>
      </section>

      <section class="bg-background flex min-h-[495px] items-end lg:h-full lg:items-start">
        <section
          class="flex w-full flex-col items-start gap-10 px-4 py-10 lg:w-[452px] lg:px-10 lg:pt-[120px] lg:pb-0 xl:ml-[min(120px,8.333333vw)] xl:px-0 xl:pt-[150px]"
        >
          <h1 class="headline-3 lg:headline-2 text-green-800 flex h-[55px] w-full items-center">
            Log In
          </h1>

          <form class="flex w-full flex-col gap-10" novalidate @submit.prevent="onSubmit">
            <section class="flex w-full flex-col gap-1">
              <label class="body-1 text-gray-900 flex h-6 w-full items-center" for="login-email">
                Username or Email
              </label>
              <input
                id="login-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="Enter your username or email"
                class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-12 w-full rounded-[4px] border bg-white px-3 pr-4 outline-none focus:border-gray-500"
              />
              <p v-if="fieldErrors.email" class="body-2 text-red-700">
                {{ fieldErrors.email }}
              </p>
            </section>

            <section class="flex w-full flex-col gap-1">
              <label class="body-1 text-gray-900 flex h-6 w-full items-center" for="login-password">
                Password
              </label>
              <input
                id="login-password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-12 w-full rounded-[4px] border bg-white px-3 pr-4 outline-none focus:border-gray-500"
              />
              <p v-if="fieldErrors.password" class="body-2 text-red-700">
                {{ fieldErrors.password }}
              </p>
            </section>

            <section class="flex w-full flex-col gap-4">
              <p v-if="authError" class="body-2 text-red-700">
                {{ authError }}
              </p>
              <button
                type="submit"
                :disabled="isSubmitting || !isAuthReady"
                class="font-open-sans text-[16px] leading-[16px] font-semibold h-12 w-full rounded-[4px] bg-orange-600 px-8 py-4 text-center text-white transition-colors hover:bg-orange-700"
              >
                {{ isSubmitting ? "Logging in..." : "Log In" }}
              </button>
              <section class="flex h-6 w-full items-start">
                <p class="body-1 text-gray-700 mr-2 flex items-center">
                  Don&apos;t have an account yet?
                </p>
                <RouterLink
                  to="/register"
                  class="font-open-sans text-[16px] leading-[16px] font-semibold text-orange-500 h-6 px-2 py-1 text-center"
                >
                  Register
                </RouterLink>
              </section>
            </section>
          </form>
        </section>
      </section>
    </section>
  </article>
</template>
