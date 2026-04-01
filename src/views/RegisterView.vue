<script setup lang="ts">
import { computed, ref } from "vue"
import { z } from "zod"
import { useRouter } from "vue-router"

import { isSupabaseConfigured } from "@/lib/supabase"
import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const fieldErrors = ref<{
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}>({})
const authError = ref("")
const isSubmitting = ref(false)

const isAuthReady = computed(() => isSupabaseConfigured())

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Please enter your first name."),
    lastName: z
      .string()
      .trim()
      .min(1, "Please enter your last name."),
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email.")
      .email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Password and confirm password do not match.",
      })
    }
  })

async function onSubmit() {
  authError.value = ""
  fieldErrors.value = {}

  if (!isAuthReady.value) {
    authError.value = "Supabase is not configured."
    return
  }

  const parsed = registerSchema.safeParse({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  })

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (
        field === "firstName" ||
        field === "lastName" ||
        field === "email" ||
        field === "password" ||
        field === "confirmPassword"
      ) {
        fieldErrors.value[field] = issue.message
      }
    }
    return
  }

  isSubmitting.value = true
  try {
    await authStore.signUp({
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    })
    await router.push({ name: "login" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Register failed."
    if (/already/i.test(message) && /email/i.test(message)) {
      fieldErrors.value.email = message
    } else {
      authError.value = message
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <article class="bg-background lg:bg-green-700">
    <section class="mx-auto w-full max-w-[1440px] lg:relative lg:min-h-[1542px]">
      <section class="relative hidden h-[1542px] lg:block">
        <img src="/registerblackground.jpg" alt="Resort pool background" class="h-full w-full object-cover" />
        <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/60 to-transparent"></div>
      </section>

      <section class="w-full px-[16px] py-[40px] lg:absolute lg:left-1/2 lg:top-[60px] lg:w-[min(1092px,100%)] lg:-translate-x-1/2 lg:p-0">
        <section class="bg-background flex flex-col items-start gap-[40px] lg:gap-[60px] lg:rounded-[4px] lg:p-[80px] lg:shadow-[4px_4px_16px_rgba(0,0,0,0.08)]">
          <h1 class="headline-3 lg:headline-2 text-green-800 flex h-[55px] w-[343px] items-center lg:w-full">Register</h1>

          <form class="flex w-[343px] flex-col gap-[24px] lg:w-full lg:gap-[40px]" novalidate @submit.prevent="onSubmit">
            <h2 class="headline-5 text-gray-600 tracking-[-0.02em]">Basic Information</h2>

            <section class="grid w-full grid-cols-1 gap-[24px] lg:grid-cols-2 lg:gap-x-[40px] lg:gap-y-[40px]">
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="first-name">First name</label>
                <input id="first-name" v-model="firstName" type="text" placeholder="Enter your first name" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" />
                <p v-if="fieldErrors.firstName" class="body-2 text-red-700">
                  {{ fieldErrors.firstName }}
                </p>
              </section>
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="last-name">Last name</label>
                <input id="last-name" v-model="lastName" type="text" placeholder="Enter your last name" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" />
                <p v-if="fieldErrors.lastName" class="body-2 text-red-700">
                  {{ fieldErrors.lastName }}
                </p>
              </section>
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-username">Username</label>
                <input id="register-username" type="text" placeholder="Enter your username" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" />
              </section>
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-email">Email</label>
                <input id="register-email" v-model="email" type="email" autocomplete="email" placeholder="Enter your email" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" />
                <p v-if="fieldErrors.email" class="body-2 text-red-700">
                  {{ fieldErrors.email }}
                </p>
              </section>
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-password">Password</label>
                <input id="register-password" v-model="password" type="password" autocomplete="new-password" placeholder="Enter your password" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" />
                <p v-if="fieldErrors.password" class="body-2 text-red-700">
                  {{ fieldErrors.password }}
                </p>
              </section>
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-confirm-password">Confirm password</label>
                <input id="register-confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" placeholder="Confirm your password" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" />
                <p v-if="fieldErrors.confirmPassword" class="body-2 text-red-700">
                  {{ fieldErrors.confirmPassword }}
                </p>
              </section>
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-phone">Phone number</label>
                <input id="register-phone" type="tel" placeholder="Enter your phone number" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" />
              </section>
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-dob">Date of Birth</label>
                <input id="register-dob" type="date" class="body-1 text-gray-900 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" />
              </section>
              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-country">Country</label>
                <select id="register-country" class="body-1 text-gray-900 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500">
                  <option value="">Select your country</option>
                  <option value="thailand">Thailand</option>
                  <option value="singapore">Singapore</option>
                  <option value="japan">Japan</option>
                </select>
              </section>
            </section>

            <section class="border-border flex w-full flex-col gap-[24px] border-t pt-[24px] lg:gap-[40px] lg:pt-[40px]">
              <h2 class="headline-5 text-gray-600 tracking-[-0.02em]">Profile Picture</h2>
              <p v-if="authError" class="body-2 text-red-700">{{ authError }}</p>
              <button type="button" class="bg-gray-200 relative flex h-[167px] w-[167px] items-center justify-center rounded-[4px]" aria-label="Upload profile picture">
                <section class="flex flex-col items-center gap-[8px]">
                  <section class="text-orange-500 text-2xl leading-none">+</section>
                  <p class="body-2 text-orange-500">Upload photo</p>
                </section>
              </button>
              <section class="w-full lg:w-[446px]">
                <button type="submit" :disabled="isSubmitting || !isAuthReady" class="font-open-sans text-[16px] leading-[16px] font-semibold h-[48px] w-full rounded-[4px] bg-orange-600 px-[32px] py-[16px] text-center text-white transition-colors hover:bg-orange-700 disabled:opacity-60">
                  {{ isSubmitting ? "Registering..." : "Register" }}
                </button>
              </section>
            </section>
          </form>
        </section>
      </section>
    </section>
  </article>
</template>
