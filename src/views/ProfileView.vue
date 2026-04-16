<script setup lang="ts">
import axios from "axios"
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

import { useAuthStore } from "@/stores/auth"

const DEFAULT_AVATAR = "/avatar-default.svg"

const authStore = useAuthStore()
const router = useRouter()
const isSubmitting = ref(false)
const formError = ref("")
const fileInputRef = ref<HTMLInputElement | null>(null)

const firstName = ref("")
const lastName = ref("")
const phoneNumber = ref("")
const dateOfBirth = ref("")
const country = ref("Thailand")
const avatarDraftUrl = ref("")
const avatarPreviewUrl = ref("")
const avatarFile = ref<File | null>(null)
const clearAvatarPending = ref(false)

const email = computed(() => authStore.user?.email || "")

function normalizeText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeDate(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null
}

function revokePreviewUrl() {
  if (avatarPreviewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
  }
  avatarPreviewUrl.value = ""
}

function syncDraftFromUser() {
  const user = authStore.user
  if (!user) return
  firstName.value = user.firstName ?? ""
  lastName.value = user.lastName ?? ""
  phoneNumber.value = user.phone ?? ""
  country.value = user.country ?? "Thailand"
  dateOfBirth.value = user.dateOfBirth ?? ""
  avatarDraftUrl.value = user.avatarUrl?.trim() || ""
  avatarFile.value = null
  clearAvatarPending.value = false
  revokePreviewUrl()
}

watch(
  () => authStore.user,
  () => syncDraftFromUser(),
  { immediate: true },
)

function onChooseAvatarClick() {
  fileInputRef.value?.click()
}

function onAvatarSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  formError.value = ""
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
    formError.value = "Please select JPG, PNG, or WEBP image."
    target.value = ""
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    formError.value = "Image must be 5MB or smaller."
    target.value = ""
    return
  }
  avatarFile.value = file
  clearAvatarPending.value = false
  revokePreviewUrl()
  avatarPreviewUrl.value = URL.createObjectURL(file)
}

function onRemoveAvatar() {
  avatarFile.value = null
  clearAvatarPending.value = true
  avatarDraftUrl.value = ""
  revokePreviewUrl()
}

const avatarSrc = computed(() => {
  if (avatarPreviewUrl.value) return avatarPreviewUrl.value
  if (clearAvatarPending.value) return DEFAULT_AVATAR
  if (avatarDraftUrl.value) return avatarDraftUrl.value
  return DEFAULT_AVATAR
})

async function onUpdateProfile() {
  if (!authStore.user) return
  isSubmitting.value = true
  formError.value = ""
  try {
    let nextAvatarUrl: string | null = clearAvatarPending.value
      ? null
      : avatarDraftUrl.value || null

    if (avatarFile.value) {
      nextAvatarUrl = await authStore.uploadProfileAvatar(avatarFile.value)
    }

    await authStore.updateMe({
      firstName: normalizeText(firstName.value),
      lastName: normalizeText(lastName.value),
      phone: normalizeText(phoneNumber.value),
      country: normalizeText(country.value),
      dateOfBirth: normalizeDate(dateOfBirth.value),
      avatarUrl: nextAvatarUrl,
    })
    syncDraftFromUser()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      formError.value = error.response?.data?.message || "Failed to update profile."
    } else {
      formError.value = "Failed to update profile."
    }
  } finally {
    isSubmitting.value = false
  }
}

async function onLogout() {
  await authStore.signOut()
  await router.push({ name: "login" })
}
</script>

<template>
  <article v-if="authStore.user" class="bg-background px-0 py-0 lg:py-10">
    <section
      class="mx-auto flex w-full max-w-[373px] flex-col gap-6 bg-background px-4 py-10 lg:max-w-[930px] lg:gap-[60px] lg:rounded-[4px] lg:px-0 lg:py-0"
    >
      <header class="flex items-center gap-6">
        <h1 class="headline-3 text-green-800 lg:headline-2 lg:flex-1">Profile</h1>
        <button
          type="button"
          class="font-open-sans hidden h-12 w-[176px] items-center justify-center rounded-[4px] bg-orange-600 px-8 text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60 lg:inline-flex"
          :disabled="isSubmitting"
          @click="onUpdateProfile"
        >
          {{ isSubmitting ? "Updating..." : "Update Profile" }}
        </button>
      </header>

      <main class="flex flex-col gap-6 lg:gap-10">
        <p v-if="formError" class="body-2 text-red">
          {{ formError }}
        </p>
        <section class="flex flex-col gap-6 lg:gap-10">
          <h2 class="headline-5 text-gray-600">Basic Information</h2>

          <section class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-6">
            <section class="flex flex-col gap-1">
              <label for="profile-first-name" class="body-1 text-gray-900">First name</label>
              <input
                id="profile-first-name"
                type="text"
                v-model="firstName"
                class="body-1 h-12 w-full rounded-[4px] border border-gray-400 bg-white px-3 text-black outline-none"
              />
            </section>

            <section class="flex flex-col gap-1">
              <label for="profile-last-name" class="body-1 text-gray-900">Last name</label>
              <input
                id="profile-last-name"
                type="text"
                v-model="lastName"
                class="body-1 h-12 w-full rounded-[4px] border border-gray-400 bg-white px-3 text-black outline-none"
              />
            </section>

            <section class="flex flex-col gap-1">
              <label for="profile-email" class="body-1 text-gray-900">Email</label>
              <input
                id="profile-email"
                type="email"
                :value="email"
                readonly
                class="body-1 h-12 w-full cursor-not-allowed rounded-[4px] border border-gray-300 bg-gray-200 px-3 text-gray-700 outline-none"
              />
            </section>

            <section class="flex flex-col gap-1">
              <label for="profile-phone" class="body-1 text-gray-900">Phone number</label>
              <input
                id="profile-phone"
                v-model="phoneNumber"
                type="text"
                class="body-1 h-12 w-full rounded-[4px] border border-gray-400 bg-white px-3 text-black outline-none"
              />
            </section>

            <section class="flex flex-col gap-1">
              <label for="profile-dob" class="body-1 text-gray-900">Date of Birth</label>
              <div class="relative">
                <input
                  id="profile-dob"
                  v-model="dateOfBirth"
                  type="text"
                  class="body-1 h-12 w-full rounded-[4px] border border-gray-400 bg-white py-3 pl-3 pr-10 text-black outline-none"
                />
                <span
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="3.75" y="5.25" width="16.5" height="15" rx="1.25" stroke="currentColor" stroke-width="1.5" />
                    <path d="M7.5 3.75V6.75M16.5 3.75V6.75M3.75 9.75H20.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </span>
              </div>
            </section>

            <section class="flex flex-col gap-1">
              <label for="profile-country" class="body-1 text-gray-900">Country</label>
              <div class="relative">
                <select
                  id="profile-country"
                  v-model="country"
                  class="body-1 h-12 w-full appearance-none rounded-[4px] border border-gray-400 bg-white py-3 pl-3 pr-10 text-black outline-none"
                >
                  <option value="Thailand">Thailand</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                </select>
                <span
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 20 20"
                    class="h-5 w-5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5.83 8.33L10 12.5L14.17 8.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
            </section>
          </section>
        </section>

        <section class="flex flex-col gap-10 border-t border-gray-300 pt-10">
          <h2 class="headline-5 text-gray-600">Profile Picture</h2>
          <section class="flex items-end justify-between">
            <section class="flex flex-col gap-4">
              <article class="relative h-[167px] w-[167px] overflow-visible rounded-[4px]">
                <div class="h-[167px] w-[167px] overflow-hidden rounded-[4px] bg-gray-200">
                  <img :src="avatarSrc" alt="User profile picture" class="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-white shadow-[2px_2px_12px_rgba(64,50,133,0.12)]"
                  aria-label="Remove profile picture"
                  @click="onRemoveAvatar"
                >
                  <svg
                    viewBox="0 0 12 12"
                    class="h-3 w-3"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M2 2L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    <path d="M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </button>
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
                type="button"
                class="body-1 inline-flex w-fit items-center justify-center rounded-[4px] border border-orange-600 px-4 py-2 font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                :disabled="isSubmitting"
                @click="onChooseAvatarClick"
              >
                Change Profile
              </button>
            </section>

            <button
              type="button"
              class="font-open-sans inline-flex h-12 items-center justify-center gap-2 rounded-[4px] border border-gray-400 px-8 text-[16px] leading-[16px] font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              @click="onLogout"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Log out
            </button>
          </section>
        </section>

        <button
          type="button"
          class="font-open-sans inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-orange-600 px-8 text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60 lg:hidden"
          :disabled="isSubmitting"
          @click="onUpdateProfile"
        >
          {{ isSubmitting ? "Updating..." : "Update Profile" }}
        </button>
      </main>
    </section>
  </article>
</template>
