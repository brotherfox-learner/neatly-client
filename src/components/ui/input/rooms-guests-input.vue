<script setup lang="ts">
// RoomsGuestsInput — Rooms & guests counter with stepper popup
//
// Usage:
//   const rooms  = ref(1)
//   const guests = ref(2)
//
//   <RoomsGuestsInput v-model:rooms="rooms" v-model:guests="guests" />
//   <RoomsGuestsInput v-model:rooms="rooms" v-model:guests="guests" label="Rooms & Guests" />
//
// Props:
//   label?  — field label text (default: 'Rooms & Guests')
//   rooms?  — number of rooms 1-9   (bound via v-model:rooms,  default: 1)
//   guests? — number of guests 1-30 (bound via v-model:guests, default: 1)
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Minus, Plus } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  label?: string
  rooms?: number
  guests?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Rooms & Guests',
  rooms: 1,
  guests: 1,
})

const emit = defineEmits<{
  'update:rooms': [value: number]
  'update:guests': [value: number]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLDivElement>()

const summary = computed(() => {
  const r = props.rooms
  const g = props.guests
  return `${r} room${r !== 1 ? 's' : ''}, ${g} guest${g !== 1 ? 's' : ''}`
})

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

function changeRooms(delta: number) {
  emit('update:rooms', clamp(props.rooms + delta, 1, 9))
}

function changeGuests(delta: number) {
  emit('update:guests', clamp(props.guests + delta, 1, 30))
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <label
      v-if="label"
      class="block text-gray-900 text-base leading-[150%] font-normal mb-1 select-none"
    >
      {{ label }}
    </label>

    <button
      type="button"
      :aria-expanded="isOpen"
      :aria-haspopup="'dialog'"
      :aria-label="label ?? 'Rooms and guests'"
      :class="
        cn(
          'w-full h-12 flex flex-row items-center justify-between pl-3 pr-4 py-3 rounded border',
          'bg-white font-inter text-base leading-[150%] outline-none cursor-pointer',
          'transition-colors duration-200',
          isOpen ? 'border-orange-500' : 'border-gray-400',
        )
      "
      @click="isOpen = !isOpen"
    >
      <span class="text-gray-900">{{ summary }}</span>
      <ChevronDown
        :size="20"
        class="text-gray-600 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      />
    </button>

    <div
      v-if="isOpen"
      role="dialog"
      aria-label="Rooms and guests selector"
      class="absolute z-50 w-full mt-1 bg-white shadow-1 rounded px-4 py-4 flex flex-col gap-4"
    >
      <div class="flex items-center justify-between">
        <span class="text-gray-900 text-base leading-[150%] font-inter">Room</span>
        <div class="flex items-center gap-4">
          <button
            type="button"
            :disabled="rooms <= 1"
            class="w-6 h-6 flex items-center justify-center rounded-full border transition-colors duration-150"
            :class="
              rooms <= 1
                ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                : 'border-gray-700 text-gray-700 hover:border-orange-500 hover:text-orange-500 cursor-pointer'
            "
            aria-label="Decrease rooms"
            @click.stop="changeRooms(-1)"
          >
            <Minus :size="12" />
          </button>
          <span class="text-gray-900 text-base font-inter w-4 text-center select-none">
            {{ rooms }}
          </span>
          <button
            type="button"
            :disabled="rooms >= 9"
            class="w-6 h-6 flex items-center justify-center rounded-full border transition-colors duration-150"
            :class="
              rooms >= 9
                ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                : 'border-gray-700 text-gray-700 hover:border-orange-500 hover:text-orange-500 cursor-pointer'
            "
            aria-label="Increase rooms"
            @click.stop="changeRooms(1)"
          >
            <Plus :size="12" />
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-gray-900 text-base leading-[150%] font-inter">Guest</span>
        <div class="flex items-center gap-4">
          <button
            type="button"
            :disabled="guests <= 1"
            class="w-6 h-6 flex items-center justify-center rounded-full border transition-colors duration-150"
            :class="
              guests <= 1
                ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                : 'border-gray-700 text-gray-700 hover:border-orange-500 hover:text-orange-500 cursor-pointer'
            "
            aria-label="Decrease guests"
            @click.stop="changeGuests(-1)"
          >
            <Minus :size="12" />
          </button>
          <span class="text-gray-900 text-base font-inter w-4 text-center select-none">
            {{ guests }}
          </span>
          <button
            type="button"
            :disabled="guests >= 30"
            class="w-6 h-6 flex items-center justify-center rounded-full border transition-colors duration-150"
            :class="
              guests >= 30
                ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                : 'border-gray-700 text-gray-700 hover:border-orange-500 hover:text-orange-500 cursor-pointer'
            "
            aria-label="Increase guests"
            @click.stop="changeGuests(1)"
          >
            <Plus :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
