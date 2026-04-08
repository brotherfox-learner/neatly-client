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
const phone = ref("")
const dateOfBirth = ref("")
const country = ref("")

const avatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref("")
const fileInputRef = ref<HTMLInputElement | null>(null)
const dobInputRef = ref<HTMLInputElement | null>(null)

const dobDisplay = computed(() => {
  if (!dateOfBirth.value) return ""
  const [yyyy, mm, dd] = dateOfBirth.value.split("-")
  return `${dd}/${mm}/${yyyy}`
})

const fieldErrors = ref<{
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  phone?: string
  dateOfBirth?: string
  country?: string
  avatar?: string
}>({})
const authError = ref("")
const isSubmitting = ref(false)

const isAuthReady = computed(() => isSupabaseConfigured())

const maxDobDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 13)
  return d.toISOString().split("T")[0]
})

function calcAge(dobStr: string): number {
  const dob = new Date(dobStr)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

function onChooseAvatar() {
  fileInputRef.value?.click()
}

function onAvatarSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  fieldErrors.value.avatar = undefined

  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
    fieldErrors.value.avatar = "Please select JPG, PNG, or WEBP image."
    target.value = ""
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    fieldErrors.value.avatar = "Image must be 5MB or smaller."
    target.value = ""
    return
  }

  if (avatarPreviewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
  }
  avatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
}

function onRemoveAvatar() {
  if (avatarPreviewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
  }
  avatarFile.value = null
  avatarPreviewUrl.value = ""
  fieldErrors.value.avatar = undefined
  if (fileInputRef.value) fileInputRef.value.value = ""
}

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Please enter your first name."),
    lastName: z.string().trim().min(1, "Please enter your last name."),
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email.")
      .email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
    phone: z.string().trim().min(1, "Please enter your phone number."),
    dateOfBirth: z
      .string()
      .trim()
      .min(1, "Please enter your date of birth.")
      .refine((v) => !isNaN(new Date(v).getTime()), "Please enter a valid date.")
      .refine((v) => calcAge(v) >= 13, "You must be at least 13 years old to register."),
    country: z.string().trim().min(1, "Please select your country."),
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

type FieldKey = keyof typeof fieldErrors.value

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
    phone: phone.value,
    dateOfBirth: dateOfBirth.value,
    country: country.value,
  })

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as FieldKey
      if (!fieldErrors.value[field]) {
        fieldErrors.value[field] = issue.message
      }
    }
    return
  }

  isSubmitting.value = true
  try {
    await authStore.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      dateOfBirth: parsed.data.dateOfBirth,
      country: parsed.data.country,
    })

    if (authStore.user && avatarFile.value) {
      try {
        const avatarUrl = await authStore.uploadProfileAvatar(avatarFile.value)
        await authStore.updateMe({
          firstName: authStore.user.firstName ?? null,
          lastName: authStore.user.lastName ?? null,
          phone: authStore.user.phone ?? null,
          country: authStore.user.country ?? null,
          dateOfBirth: authStore.user.dateOfBirth ?? null,
          avatarUrl,
        })
      } catch {
        // Avatar upload is optional — don't block registration if it fails
      }
    }

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
                <label class="body-1 text-gray-900 h-[24px]" for="first-name">First name <span class="text-red-600">*</span></label>
                <input id="first-name" v-model="firstName" type="text" placeholder="Enter your first name" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" :class="{ 'border-red-500': fieldErrors.firstName }" />
                <p v-if="fieldErrors.firstName" class="body-2 text-red-700">{{ fieldErrors.firstName }}</p>
              </section>

              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="last-name">Last name <span class="text-red-600">*</span></label>
                <input id="last-name" v-model="lastName" type="text" placeholder="Enter your last name" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" :class="{ 'border-red-500': fieldErrors.lastName }" />
                <p v-if="fieldErrors.lastName" class="body-2 text-red-700">{{ fieldErrors.lastName }}</p>
              </section>

              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-email">Email <span class="text-red-600">*</span></label>
                <input id="register-email" v-model="email" type="email" autocomplete="email" placeholder="Enter your email" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" :class="{ 'border-red-500': fieldErrors.email }" />
                <p v-if="fieldErrors.email" class="body-2 text-red-700">{{ fieldErrors.email }}</p>
              </section>

              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-phone">Phone number <span class="text-red-600">*</span></label>
                <input id="register-phone" v-model="phone" type="tel" placeholder="Enter your phone number" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" :class="{ 'border-red-500': fieldErrors.phone }" />
                <p v-if="fieldErrors.phone" class="body-2 text-red-700">{{ fieldErrors.phone }}</p>
              </section>

              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-password">Password <span class="text-red-600">*</span></label>
                <input id="register-password" v-model="password" type="password" autocomplete="new-password" placeholder="Enter your password" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" :class="{ 'border-red-500': fieldErrors.password }" />
                <p v-if="fieldErrors.password" class="body-2 text-red-700">{{ fieldErrors.password }}</p>
              </section>

              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-confirm-password">Confirm password <span class="text-red-600">*</span></label>
                <input id="register-confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" placeholder="Confirm your password" class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-[48px] w-full rounded-[4px] border bg-white px-[12px] pr-[16px] outline-none focus:border-gray-500" :class="{ 'border-red-500': fieldErrors.confirmPassword }" />
                <p v-if="fieldErrors.confirmPassword" class="body-2 text-red-700">{{ fieldErrors.confirmPassword }}</p>
              </section>

              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-dob">Date of Birth <span class="text-red-600">*</span></label>
                <div
                  class="flex h-[48px] w-full cursor-pointer items-center justify-between rounded-[4px] border bg-white px-[12px]"
                  :class="fieldErrors.dateOfBirth ? 'border-red-500' : 'border-gray-400'"
                  @click="dobInputRef?.showPicker()"
                >
                  <span class="body-1" :class="dateOfBirth ? 'text-gray-900' : 'text-gray-400'">
                    {{ dateOfBirth ? dobDisplay : 'Select your date of birth' }}
                  </span>
                  <img src="/Icon figma/date.svg" alt="" aria-hidden="true" class="h-6 w-6 shrink-0" />
                </div>
                <input
                  id="register-dob"
                  ref="dobInputRef"
                  v-model="dateOfBirth"
                  type="date"
                  :max="maxDobDate"
                  class="sr-only"
                />
                <p v-if="fieldErrors.dateOfBirth" class="body-2 text-red-700">{{ fieldErrors.dateOfBirth }}</p>
              </section>

              <section class="flex w-full flex-col gap-[4px]">
                <label class="body-1 text-gray-900 h-[24px]" for="register-country">Country <span class="text-red-600">*</span></label>
                <div class="relative">
                  <select
                    id="register-country"
                    v-model="country"
                    class="body-1 h-[48px] w-full appearance-none rounded-[4px] border bg-white py-0 pl-[12px] pr-[44px] outline-none focus:border-gray-500"
                    :class="[
                      fieldErrors.country ? 'border-red-500' : 'border-gray-400',
                      country ? 'text-gray-900' : 'text-gray-400',
                    ]"
                  >
                    <option value="">Select your country</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Japan">Japan</option>
                  </select>
                  <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true">
                    <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.83 8.33L10 12.5L14.17 8.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
                <p v-if="fieldErrors.country" class="body-2 text-red-700">{{ fieldErrors.country }}</p>
              </section>
            </section>

            <section class="border-border flex w-full flex-col gap-[24px] border-t pt-[24px] lg:gap-[40px] lg:pt-[40px]">
              <h2 class="headline-5 text-gray-600 tracking-[-0.02em]">Profile Picture <span class="body-2 text-gray-500 font-normal">(optional)</span></h2>

              <p v-if="authError" class="body-2 text-red-700">{{ authError }}</p>

              <section class="flex flex-col gap-4">
                <article class="relative h-[167px] w-[167px] overflow-visible rounded-[4px]">
                  <button
                    v-if="!avatarPreviewUrl"
                    type="button"
                    class="bg-gray-200 relative flex h-[167px] w-[167px] items-center justify-center rounded-[4px] transition-colors hover:bg-gray-300"
                    :disabled="isSubmitting"
                    aria-label="Upload profile picture"
                    @click="onChooseAvatar"
                  >
                    <section class="flex flex-col items-center gap-[8px]">
                      <span class="text-orange-500 text-2xl leading-none" aria-hidden="true">+</span>
                      <p class="body-2 text-orange-500">Upload photo</p>
                    </section>
                  </button>

                  <template v-else>
                    <div class="h-[167px] w-[167px] overflow-hidden rounded-[4px] bg-gray-200">
                      <img :src="avatarPreviewUrl" alt="Profile picture preview" class="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md"
                      :disabled="isSubmitting"
                      aria-label="Remove profile picture"
                      @click="onRemoveAvatar"
                    >
                      <svg viewBox="0 0 12 12" class="h-3 w-3" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M2 2L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      </svg>
                    </button>
                  </template>
                </article>

                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  :disabled="isSubmitting"
                  @change="onAvatarSelected"
                />

                <button
                  v-if="avatarPreviewUrl"
                  type="button"
                  class="body-1 inline-flex w-fit items-center justify-center rounded-[4px] border border-orange-600 px-4 py-2 font-semibold text-orange-600 transition-colors hover:bg-orange-50"
                  :disabled="isSubmitting"
                  @click="onChooseAvatar"
                >
                  Change Photo
                </button>

                <p v-if="fieldErrors.avatar" class="body-2 text-red-700">{{ fieldErrors.avatar }}</p>
              </section>

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

<style scoped>
select option:first-child {
  color: #9ca3af;
}
select option:not(:first-child) {
  color: #111827;
}
</style>
