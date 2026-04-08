<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"

import { useAuthStore } from "@/stores/auth"

const authStore = useAuthStore()
const router = useRouter()

/** Public icons under `public/Icon figma/` (URL-encoded for spaces). */
function iconFile(file: string) {
  return encodeURI(`/Icon figma/${file}`)
}

const displayName = computed(() => {
  const u = authStore.user
  if (!u) return ""
  const first = u.firstName?.trim() ?? ""
  const last = u.lastName?.trim() ?? ""
  if (first || last) return [first, last].filter(Boolean).join(" ")
  const email = u.email
  const at = email.indexOf("@")
  return at > 0 ? email.slice(0, at) : email
})

const avatarSrc = computed(() => {
  const u = authStore.user?.avatarUrl?.trim()
  return u || null
})

async function onLogout() {
  await authStore.signOut()
  await router.push({ name: "login" })
}

const menuOpen = ref(false)
const route = useRoute()

watch(route, () => {
  menuOpen.value = false
})

watch(menuOpen, (open) => {
  if (typeof document === "undefined") return
  document.body.style.overflow = open ? "hidden" : ""
})

onUnmounted(() => {
  if (typeof document !== "undefined") document.body.style.overflow = ""
})

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <!-- ── Mobile header (hidden while full-screen menu is open) ── -->
  <header
    v-show="!menuOpen"
    class="border-border sticky top-0 z-50 bg-white border-b md:hidden"
  >
    <div class="flex h-12 items-center justify-between px-4">
      <RouterLink to="/" class="flex items-center" aria-label="Go to home" @click="closeMenu">
        <img src="/logo.svg" alt="Neatly logo" class="h-6 w-auto" />
      </RouterLink>

      <nav class="flex items-center gap-4" aria-label="Mobile actions">
        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
          aria-label="Notifications"
        >
          <img :src="iconFile('notibell.svg')" alt="" class="size-6" width="24" height="24" />
        </button>
        <button
          type="button"
          class="text-gray-700 transition-colors hover:text-gray-900"
          aria-label="Open menu"
          aria-expanded="false"
          @click="menuOpen = true"
        >
          <img src="/hamburger.svg" alt="Menu icon" class="size-6" />
        </button>
      </nav>
    </div>
  </header>

  <!-- Full-screen white menu: covers entire viewport so no page UI shows through -->
  <Teleport to="body">
    <div
      v-if="menuOpen"
      class="fixed inset-0 z-200 flex flex-col bg-white md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
    >
      <div class="border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
        <RouterLink to="/" class="flex items-center" aria-label="Go to home" @click="closeMenu">
          <img src="/logo.svg" alt="Neatly logo" class="h-6 w-auto" />
        </RouterLink>

        <nav class="flex items-center gap-4" aria-label="Mobile menu actions">
          <button
            v-if="authStore.isAuthenticated"
            type="button"
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            aria-label="Notifications"
          >
            <img :src="iconFile('notibell.svg')" alt="" class="size-6" width="24" height="24" />
          </button>
          <button
            v-else
            type="button"
            class="text-gray-700 transition-colors hover:text-gray-900"
            aria-label="Notifications"
          >
            <img src="/Frame.svg" alt="Notification icon" class="size-6" />
          </button>
          <button
            type="button"
            class="text-gray-700 transition-colors hover:text-gray-900"
            aria-label="Close menu"
            aria-expanded="true"
            @click="closeMenu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </nav>
      </div>

      <!-- Logged-in: user menu (Figma mobile dropdown) -->
      <nav
        v-if="authStore.isAuthenticated"
        class="shadow-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded p-6 px-4"
        aria-label="Account menu"
      >
        <div class="flex items-center gap-2">
          <div
            class="size-10 shrink-0 overflow-hidden rounded-full bg-gray-200"
            aria-hidden="true"
          >
            <img
              v-if="avatarSrc"
              :src="avatarSrc"
              alt="Profile photo"
              class="size-full object-cover"
              width="40"
              height="40"
            />
            <div v-else class="flex size-full items-center justify-center">
              <img
                :src="iconFile('profile.svg')"
                alt=""
                class="size-5"
                width="20"
                height="20"
              />
            </div>
          </div>
          <p
            class="min-w-0 truncate text-center text-[14px] leading-4 text-gray-700 [font-family:var(--font-open-sans)]"
          >
            {{ displayName }}
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-gray-300" role="presentation" />

        <ul class="flex w-full flex-col">
          <li>
            <RouterLink
              :to="{ name: 'profile' }"
              class="body-2 text-gray-700 flex w-full items-center gap-3 px-4 py-4 transition-colors hover:bg-gray-100"
              @click="closeMenu"
            >
              <img
                :src="iconFile('profile.svg')"
                alt=""
                class="size-4 shrink-0"
                width="16"
                height="16"
              />
              <span>Profile</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'payment method' }"
              class="body-2 text-gray-700 flex w-full items-center gap-3 px-4 py-4 transition-colors hover:bg-gray-100"
              @click="closeMenu"
            >
              <img
                :src="iconFile('credit.svg')"
                alt=""
                class="size-4 shrink-0"
                width="16"
                height="16"
              />
              <span>Payment Method</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'search' }"
              class="body-2 text-gray-700 flex w-full items-center gap-3 px-4 py-4 transition-colors hover:bg-gray-100"
              @click="closeMenu"
            >
              <img
                :src="iconFile('booking-1.svg')"
                alt=""
                class="size-4 shrink-0"
                width="16"
                height="16"
              />
              <span>Booking History</span>
            </RouterLink>
          </li>
        </ul>

        <button
          type="button"
          class="body-2 text-gray-700 flex w-full items-center gap-3 border-t border-gray-300 px-4 py-4 text-left transition-colors hover:bg-gray-100"
          @click="onLogout(); closeMenu()"
        >
          <img
            :src="iconFile('logout.svg')"
            alt=""
            class="size-4 shrink-0"
            width="16"
            height="16"
          />
          <span>Log out</span>
        </button>
      </nav>

      <!-- Guest: marketing links + Log in -->
      <nav
        v-else
        class="min-h-0 flex-1 overflow-y-auto px-6 pt-8"
        aria-label="Mobile navigation menu"
      >
        <RouterLink
          :to="{ name: 'home', hash: '#about-neatly' }"
          class="font-open-sans border-border block border-b py-5 text-[16px] font-normal text-[#2A2E3F] transition-colors hover:text-green-700"
          @click="closeMenu"
        >
          About Neatly
        </RouterLink>
        <RouterLink
          :to="{ name: 'home', hash: '#service-facilities' }"
          class="font-open-sans border-border block border-b py-5 text-[16px] font-normal text-[#2A2E3F] transition-colors hover:text-green-700"
          @click="closeMenu"
        >
          Service &amp; Facilities
        </RouterLink>
        <RouterLink
          :to="{ name: 'home', hash: '#rooms-suits' }"
          class="font-open-sans border-border block border-b py-5 text-[16px] font-normal text-[#2A2E3F] transition-colors hover:text-green-700"
          @click="closeMenu"
        >
          Rooms &amp; Suits
        </RouterLink>
        <RouterLink
          to="/login"
          class="font-open-sans mt-6 inline-flex rounded-md bg-[#C14817] px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#a83e14]"
          @click="closeMenu"
        >
          Log in
        </RouterLink>
      </nav>
    </div>
  </Teleport>

  <!-- ── Desktop header ── -->
  <header class="border-border sticky top-0 z-50 hidden bg-white border-b md:block">
    <div class="relative mx-auto h-[100px] w-full max-w-[1440px] md:flex">
      <div class="absolute left-[160px] top-0 flex h-[100px] w-[659px] items-center gap-[48px]">
        <RouterLink to="/" class="flex items-center" aria-label="Go to home">
          <img src="/logo.svg" alt="Neatly logo" class="h-[45px] w-[167px]" />
        </RouterLink>

        <nav class="flex h-[100px] w-[444px] items-start p-0" aria-label="Main navigation">
          <RouterLink
            class="font-open-sans flex h-[100px] w-[133px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-[14px] leading-[16px] font-normal text-black transition-colors hover:text-green-700"
            :to="{ name: 'home', hash: '#about-neatly' }"
          >
            About Neatly
          </RouterLink>
          <RouterLink
            class="font-open-sans flex h-[100px] w-[168px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-[14px] leading-[16px] font-normal text-black transition-colors hover:text-green-700"
            :to="{ name: 'home', hash: '#service-facilities' }"
          >
            Service &amp; Facilities
          </RouterLink>
          <RouterLink
            class="font-open-sans flex h-[100px] w-[143px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-[14px] leading-[16px] font-normal text-black transition-colors hover:text-green-700"
            :to="{ name: 'home', hash: '#rooms-suits' }"
          >
            Rooms &amp; Suits
          </RouterLink>
        </nav>
      </div>

      <section
        class="absolute left-[1110px] top-0 flex h-[100px] w-[180px] min-w-0 items-center justify-end gap-4 p-0"
      >
        <RouterLink
          v-if="authStore.isAuthenticated && authStore.isAdmin"
          to="/admin/customer-booking"
          class="font-open-sans text-green-800 mr-2 flex h-[100px] shrink-0 items-center justify-center gap-[10px] px-[16px] py-[10px] text-center text-[14px] leading-[16px] font-semibold transition-colors hover:text-green-600"
        >
          Admin
        </RouterLink>

        <template v-if="authStore.isAuthenticated">
          <div class="flex min-w-0 items-center gap-4">
            <button
              type="button"
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
              aria-label="Notifications"
            >
              <img :src="iconFile('notibell.svg')" alt="" class="size-6" width="24" height="24" />
            </button>
            <RouterLink
              :to="{ name: 'profile' }"
              class="flex min-w-0 items-center gap-2 rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              aria-label="Open your profile"
            >
              <div
                class="size-10 shrink-0 overflow-hidden rounded-full bg-gray-200"
                aria-hidden="true"
              >
                <img
                  v-if="avatarSrc"
                  :src="avatarSrc"
                  alt=""
                  class="size-full object-cover"
                  width="40"
                  height="40"
                />
                <div v-else class="flex size-full items-center justify-center">
                  <img
                    :src="iconFile('profile.svg')"
                    alt=""
                    class="size-5"
                    width="20"
                    height="20"
                  />
                </div>
              </div>
              <span
                class="max-w-28 truncate text-center text-[14px] leading-4 text-gray-700 [font-family:var(--font-open-sans)]"
              >
                {{ displayName }}
              </span>
            </RouterLink>
          </div>
        </template>

        <RouterLink
          v-else
          to="/login"
          class="font-open-sans text-accent flex h-[100px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-center text-[14px] leading-[16px] font-semibold transition-colors hover:text-orange-600"
        >
          Log in
        </RouterLink>
      </section>
    </div>
  </header>
</template>
