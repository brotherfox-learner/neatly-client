<script setup lang="ts">
// BaseDatePicker — Single date selector with calendar popup
//
// Value format: ISO 8601 string  'YYYY-MM-DD'  e.g. '2024-12-25'
//
// Usage:
//   const birthday = ref('')
//
//   <BaseDatePicker v-model="birthday" label="Date of Birth" />
//   <BaseDatePicker v-model="birthday" label="Date of Birth" placeholder="Select a date" />
//
// Props:
//   label?      — field label text
//   placeholder?— placeholder when no date chosen (default: 'Place Holder')
//   modelValue? — ISO date string YYYY-MM-DD (bound via v-model)
//   id?         — explicit element id (auto-generated if omitted)
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  label?: string
  placeholder?: string
  modelValue?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Place Holder',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLDivElement>()

const today = new Date()
const todayIso = isoFromDate(today)

const viewMonth = ref(
  props.modelValue ? parseIso(props.modelValue) : new Date(today.getFullYear(), today.getMonth(), 1),
)

const inputId = computed(
  () => props.id ?? `date-picker-${Math.random().toString(36).slice(2, 9)}`,
)

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

interface Cell {
  iso: string
  dayNum: number
  inMonth: boolean
}

function isoFromDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
}

function buildMonthGrid(year: number, monthIndex: number): Cell[][] {
  const first = new Date(year, monthIndex, 1)
  const mondayIndex = (first.getDay() + 6) % 7
  const weeks: Cell[][] = []
  const cursor = new Date(year, monthIndex, 1 - mondayIndex)
  for (let w = 0; w < 6; w++) {
    const row: Cell[] = []
    for (let c = 0; c < 7; c++) {
      const y = cursor.getFullYear()
      const m = cursor.getMonth()
      const d = cursor.getDate()
      const mm = String(m + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      const iso = `${y}-${mm}-${dd}`
      row.push({ iso, dayNum: d, inMonth: m === monthIndex })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(row)
  }
  return weeks
}

const monthLabel = computed(() => {
  const d = viewMonth.value
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
})

const grid = computed(() => buildMonthGrid(viewMonth.value.getFullYear(), viewMonth.value.getMonth()))

const formattedValue = computed(() => {
  if (!props.modelValue) return ''
  const d = parseIso(props.modelValue)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
})

function prevMonth() {
  const d = viewMonth.value
  viewMonth.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

function nextMonth() {
  const d = viewMonth.value
  viewMonth.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

function selectDate(cell: Cell) {
  emit('update:modelValue', cell.iso)
  isOpen.value = false
}

function dayCellClass(cell: Cell): string {
  const base = 'font-inter relative flex w-8 h-8 items-center justify-center text-sm transition-colors rounded-full'
  const isSelected = cell.iso === props.modelValue
  const isToday = cell.iso === todayIso

  if (isSelected) {
    return cn(base, 'bg-orange-500 text-white cursor-pointer')
  }
  if (isToday && cell.inMonth) {
    return cn(base, 'border border-orange-500 text-gray-800 cursor-pointer hover:bg-gray-100')
  }
  if (cell.inMonth) {
    return cn(base, 'text-gray-800 cursor-pointer hover:bg-gray-100')
  }
  return cn(base, 'text-gray-600 opacity-40 cursor-pointer hover:bg-gray-100')
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
      :for="inputId"
      class="block text-gray-900 text-base leading-[150%] font-normal mb-1 select-none"
    >
      {{ label }}
    </label>

    <button
      :id="inputId"
      type="button"
      :aria-label="label ?? 'Select date'"
      :aria-expanded="isOpen"
      :aria-haspopup="'dialog'"
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
      <span :class="formattedValue ? 'text-gray-900' : 'text-gray-600'">
        {{ formattedValue || placeholder }}
      </span>
      <Calendar :size="24" class="text-gray-600 shrink-0" aria-hidden="true" />
    </button>

    <div
      v-if="isOpen"
      role="dialog"
      :aria-label="label ?? 'Date picker'"
      class="absolute z-50 mt-1 bg-white rounded shadow-1 overflow-hidden w-64"
    >
      <div
        class="flex items-center justify-between px-6 pt-4 pb-3 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      >
        <button
          type="button"
          class="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Previous month"
          @click.stop="prevMonth"
        >
          <ChevronLeft :size="20" />
        </button>

        <div class="flex items-center gap-0.5">
          <span class="text-gray-800 text-sm font-medium leading-[150%]">{{ monthLabel }}</span>
          <ChevronDown :size="20" class="text-gray-600" aria-hidden="true" />
        </div>

        <button
          type="button"
          class="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Next month"
          @click.stop="nextMonth"
        >
          <ChevronRight :size="20" />
        </button>
      </div>

      <div
        class="grid grid-cols-7 px-4 py-0 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      >
        <div
          v-for="(day, i) in WEEKDAYS"
          :key="i"
          class="h-8 flex items-center justify-center text-gray-800 text-sm font-medium leading-[150%]"
        >
          {{ day }}
        </div>
      </div>

      <div class="px-4 pb-4">
        <div
          v-for="(week, wi) in grid"
          :key="wi"
          class="grid grid-cols-7"
        >
          <button
            v-for="cell in week"
            :key="cell.iso"
            type="button"
            :aria-label="parseIso(cell.iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })"
            :aria-pressed="cell.iso === modelValue"
            :class="dayCellClass(cell)"
            @click.stop="selectDate(cell)"
          >
            {{ cell.dayNum }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
