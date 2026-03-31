<script setup lang="ts">
import { RouterLink } from "vue-router"
import { useRouter } from "vue-router"

import { useAuthStore } from "@/stores/auth"

const authStore = useAuthStore()
const router = useRouter()

async function onLogout() {
  await authStore.signOut()
  await router.push({ name: "login" })
}
</script>

<template>
  <header class="border-border bg-white border-b">
    <section class="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 md:hidden">
      <RouterLink to="/" class="flex items-center" aria-label="Go to home">
        <img src="/logo.svg" alt="Neatly logo" class="h-6 w-auto" />
      </RouterLink>

      <nav class="flex items-center gap-4" aria-label="Mobile actions">
        <button
          type="button"
          class="text-gray-700 transition-colors hover:text-gray-900"
          aria-label="Notifications"
        >
          <img src="/Frame.svg" alt="Notification icon" class="size-6" />
        </button>
        <button
          type="button"
          class="text-gray-700 transition-colors hover:text-gray-900"
          aria-label="Open menu"
        >
          <img src="/hamburger.svg" alt="Menu icon" class="size-6" />
        </button>
      </nav>
    </section>

    <section class="relative mx-auto hidden h-[100px] w-full max-w-[1440px] md:flex">
      <section class="absolute left-[160px] top-0 flex h-[100px] w-[659px] items-center gap-[48px]">
        <RouterLink to="/" class="flex items-center" aria-label="Go to home">
          <img src="/logo.svg" alt="Neatly logo" class="h-[45px] w-[167px]" />
        </RouterLink>

        <nav class="flex h-[100px] w-[444px] items-start p-0" aria-label="Main navigation">
          <RouterLink
            class="font-open-sans flex h-[100px] w-[133px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-[14px] leading-[16px] font-normal text-black transition-colors hover:text-green-700"
            to="/"
          >
            About Neatly
          </RouterLink>
          <RouterLink
            class="font-open-sans flex h-[100px] w-[168px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-[14px] leading-[16px] font-normal text-black transition-colors hover:text-green-700"
            to="/about"
          >
            Service &amp; Facilities
          </RouterLink>
          <RouterLink
            class="font-open-sans flex h-[100px] w-[143px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-[14px] leading-[16px] font-normal text-black transition-colors hover:text-green-700"
            to="/dev/backend"
          >
            Rooms &amp; Suits
          </RouterLink>
        </nav>
      </section>

      <section class="absolute left-[1110px] top-0 flex h-[100px] w-[180px] items-center justify-end p-0">
        <RouterLink
          v-if="authStore.isAuthenticated && authStore.isAdmin"
          to="/admin/customer-booking"
          class="font-open-sans text-green-800 mr-2 flex h-[100px] items-center justify-center gap-[10px] px-[16px] py-[10px] text-center text-[14px] leading-[16px] font-semibold transition-colors hover:text-green-600"
        >
          Admin
        </RouterLink>
        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="font-open-sans text-accent flex h-[100px] items-center justify-center gap-[10px] px-[16px] py-[10px] text-center text-[14px] leading-[16px] font-semibold transition-colors hover:text-orange-600"
          @click="onLogout"
        >
          Log out
        </button>
        <RouterLink
          v-else
          to="/login"
          class="font-open-sans text-accent flex h-[100px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-center text-[14px] leading-[16px] font-semibold transition-colors hover:text-orange-600"
        >
          Log in
        </RouterLink>
      </section>
    </section>
  </header>
</template>
