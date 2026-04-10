<script setup lang="ts">
// MenuLinkItem — Sidebar navigation link item (dark green background)
//
// States:
//   default  — bg-green-800, green-500 icon, green-300 text
//   hover    — bg-green-700  (CSS hover, automatic)
//   selected — bg-green-600, green-400 icon, green-100 text  (when active=true)
//
// Usage (with RouterLink — pass a `to` prop):
//   <MenuLinkItem to="/admin/bookings" label="Customer Booking" :active="isActive('/admin/bookings')">
//     <template #icon><Briefcase :size="24" :stroke-width="1.5" /></template>
//   </MenuLinkItem>
//
// Usage (as button — omit `to` prop):
//   <MenuLinkItem label="Log Out" @click="onLogout">
//     <template #icon><LogOut :size="24" /></template>
//   </MenuLinkItem>
//
// Props:
//   label    (required) — menu item text
//   to?      — route path or RouteLocationRaw; renders as <RouterLink> when given
//   active?  — marks this item as selected/current (default: false)
//
// Slots:
//   #icon — 24×24 icon area

import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  to?: RouteLocationRaw
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const itemClass = computed(() =>
  cn(
    'flex h-[72px] w-full items-start gap-4 px-6 py-6 transition-colors duration-150 outline-none',
    'focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-inset',
    props.active
      ? 'bg-green-600'
      : 'bg-green-800 hover:bg-green-700',
  ),
)

const iconClass = computed(() =>
  cn('size-6 shrink-0', props.active ? 'text-green-400' : 'text-green-500'),
)

const labelClass = computed(() =>
  cn(
    'body-1 flex-1 font-medium leading-[150%] tracking-[-0.02em]',
    props.active ? 'text-green-100' : 'text-green-300',
  ),
)
</script>

<template>
  <RouterLink
    v-if="to !== undefined"
    :to="to"
    :class="itemClass"
    :aria-current="active ? 'page' : undefined"
  >
    <span :class="iconClass">
      <slot name="icon" />
    </span>
    <span :class="labelClass">{{ label }}</span>
  </RouterLink>

  <button
    v-else
    type="button"
    :class="itemClass"
    :aria-current="active ? 'page' : undefined"
    @click="emit('click', $event)"
  >
    <span :class="iconClass">
      <slot name="icon" />
    </span>
    <span :class="labelClass">{{ label }}</span>
  </button>
</template>
