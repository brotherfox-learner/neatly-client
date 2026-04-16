<script setup lang="ts">
import { useRouter } from "vue-router"
import { useRoute, RouterLink } from "vue-router"

import AdminSidebarMenuIcon from "@/components/admin/AdminSidebarMenuIcon.vue"
import { useAuthStore } from "@/stores/auth"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { to: "/admin/customer-booking", label: "Customer Booking", icon: "booking" as const },
  { to: "/admin/room-management", label: "Room Management", icon: "manage" as const },
  { to: "/admin/hotel-information", label: "Hotel Information", icon: "hotel" as const },
  { to: "/admin/room-property", label: "Room & Property", icon: "room" as const },
  { to: "/admin/analytics", label: "Analytics Dashboard", icon: "analytic" as const },
  { to: "/admin/chatbot-setup", label: "Chatbot Setup", icon: "chat" as const },
  { to: "/admin/live-chat", label: "Live Chat Responses", icon: "chat" as const },
] as const

function isActive(path: string) {
  return route.path === path
}

async function onLogout() {
  await authStore.signOut()
  await router.push({ name: "login" })
}
</script>

<template>
  <aside
    class="box-border flex h-screen min-h-0 w-[240px] shrink-0 flex-col items-start gap-10 border-r border-[#E4E6ED] bg-[#2F3E35]"
    aria-label="Admin navigation"
  >
    <header
      class="flex w-full flex-col items-center justify-end gap-4 self-stretch px-6 pb-0 pt-10"
    >
      <RouterLink
        to="/"
        class="flex h-10 w-[148px] max-w-full shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#81A08F]"
        aria-label="Neatly home"
      >
        <img
          src="/logo-white.svg"
          alt="Neatly logo"
          class="h-full w-full object-contain"
          width="180"
          height="49"
        />
      </RouterLink>
      <p class="body-1 w-[149px] text-center text-[#ABC0B4]">Admin Panel Control</p>
    </header>

    <nav class="flex min-h-0 w-full flex-1 flex-col" aria-label="Primary admin">
      <ul class="flex w-full flex-col">
        <li v-for="item in navItems" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex h-[72px] w-full items-start gap-4 px-6 py-6 transition-colors"
            :class="
              isActive(item.to) ? 'bg-[#3A4B42]' : 'bg-[#2F3E35] hover:bg-[#343f38]'
            "
          >
            <span class="inline-flex shrink-0 text-[#81A08F]">
              <AdminSidebarMenuIcon :name="item.icon" />
            </span>
            <span
              class="body-1 flex-1 font-medium leading-[150%] tracking-[-0.02em] text-[#D5DFDA]"
            >
              {{ item.label }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="mt-auto w-full border-t border-[#465C50]">
      <button
        type="button"
        class="flex h-[72px] w-full items-start gap-4 bg-[#2F3E35] px-6 py-6 transition-colors hover:bg-[#343f38]"
        @click="onLogout"
      >
        <span class="inline-flex shrink-0 text-[#81A08F]">
          <AdminSidebarMenuIcon name="logout" />
        </span>
        <span class="body-1 flex-1 font-medium leading-[150%] tracking-[-0.02em] text-[#D5DFDA]">
          Log Out
        </span>
      </button>
    </div>
  </aside>
</template>
