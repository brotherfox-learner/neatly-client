<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue"
import { RouterLink, useRoute } from "vue-router"

const menuOpen = ref(false)
const route = useRoute()

watch(route, () => { menuOpen.value = false })

watch(menuOpen, (open) => {
  if (typeof document === "undefined") return
  document.body.style.overflow = open ? "hidden" : ""
})

onUnmounted(() => {
  if (typeof document !== "undefined") document.body.style.overflow = ""
})

function closeMenu() { menuOpen.value = false }
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
      class="fixed inset-0 z-[200] flex flex-col bg-white md:hidden"
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

      <nav
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

      <div class="absolute left-[1191px] top-0 flex h-[100px] w-[89px] items-center p-0">
        <RouterLink
          to="/login"
          class="font-open-sans text-accent flex h-[100px] w-[89px] items-center justify-center gap-[10px] px-[24px] py-[10px] text-center text-[14px] leading-[16px] font-semibold transition-colors hover:text-orange-600"
        >
          Log in
        </RouterLink>
      </div>
    </div>
  </header>
</template>
