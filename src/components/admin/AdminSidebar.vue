<script setup lang="ts">
import { useRoute, RouterLink } from "vue-router"
import {
  Briefcase,
  ClipboardCheck,
  Building2,
  Package,
  PieChart,
  MessageCircle,
  LogOut,
} from "lucide-vue-next"

const route = useRoute()

const navItems = [
  { to: "/admin/customer-booking", label: "Customer Booking", icon: Briefcase },
  { to: "/admin/room-management", label: "Room Management", icon: ClipboardCheck },
  { to: "/admin/hotel-information", label: "Hotel Information", icon: Building2 },
  { to: "/admin/room-property", label: "Room & Property", icon: Package },
  { to: "/admin/analytics", label: "Analytics Dashboard", icon: PieChart },
  { to: "/admin/chatbot-setup", label: "Chatbot Setup", icon: MessageCircle },
] as const

function isActive(path: string) {
  return route.path === path
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
        class="flex h-[32px] w-[120px] items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#81A08F]"
        aria-label="Neatly home"
      >
        <img src="/logo.svg" alt="Neatly logo" class="h-full w-full object-contain" />
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
            <component
              :is="item.icon"
              class="size-6 shrink-0 text-[#81A08F]"
              :stroke-width="1.5"
              aria-hidden="true"
            />
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
      <RouterLink
        to="/login"
        class="flex h-[72px] w-full items-start gap-4 bg-[#2F3E35] px-6 py-6 transition-colors hover:bg-[#343f38]"
      >
        <LogOut class="size-6 shrink-0 text-[#81A08F]" :stroke-width="2" aria-hidden="true" />
        <span class="body-1 flex-1 font-medium leading-[150%] tracking-[-0.02em] text-[#D5DFDA]">
          Log Out
        </span>
      </RouterLink>
    </div>
  </aside>
</template>
