<script setup lang="ts">
// DateRangePicker — Check In / Check Out dual calendar date range selector
//
// Value format: ISO 8601 string 'YYYY-MM-DD'  e.g. '2024-12-25'
// Both dates are required; checkOut must be at least 1 day after checkIn.
//
// Usage:
//   const checkIn  = ref('2024-12-25')
//   const checkOut = ref('2024-12-26')
//
//   <DateRangePicker v-model:checkIn="checkIn" v-model:checkOut="checkOut" />
//
// Props (defineModel — both required):
//   checkIn  — check-in ISO date string  (v-model:checkIn)
//   checkOut — check-out ISO date string (v-model:checkOut)
//
// Emits:
//   openChange(open: boolean) — fires when the calendar popup opens or closes
//
// Exposes:
//   closePopover() — programmatically close the calendar popup
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const checkIn = defineModel<string>('checkIn', { required: true })
const checkOut = defineModel<string>('checkOut', { required: true })

const emit = defineEmits<{ openChange: [open: boolean] }>()

function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDaysIso(iso: string, days: number): string {
  const [y, mo, da] = iso.split('-').map(Number)
  const dt = new Date((y ?? 0), (mo ?? 1) - 1, (da ?? 1))
  dt.setDate(dt.getDate() + days)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
}

const checkInMin = todayIso()
const open = ref(false)
const activeField = ref<'checkin' | 'checkout'>('checkin')
const rootRef = ref<HTMLElement | null>(null)
const viewMonth = ref(new Date())

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

interface Cell {
  iso: string
  dayNum: number
  inMonth: boolean
  disabled: boolean
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
      row.push({ iso, dayNum: d, inMonth: m === monthIndex, disabled: iso < checkInMin })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(row)
  }
  return weeks
}

const leftMonthLabel = computed(() => {
  const d = viewMonth.value
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
})

const rightMonthLabel = computed(() => {
  const d = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 1)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
})

const leftGrid = computed(() =>
  buildMonthGrid(viewMonth.value.getFullYear(), viewMonth.value.getMonth()),
)
const rightGrid = computed(() => {
  const d = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 1)
  return buildMonthGrid(d.getFullYear(), d.getMonth())
})

const minCheckoutIso = computed(() => addDaysIso(checkIn.value, 1))

function isRangeStart(iso: string): boolean { return iso === checkIn.value }
function isRangeEnd(iso: string): boolean { return iso === checkOut.value }
function isRangeMiddle(iso: string): boolean {
  return iso > checkIn.value && iso < checkOut.value
}

function isDayDisabled(cell: Cell): boolean {
  if (cell.disabled) return true
  if (activeField.value === 'checkout' && cell.iso < minCheckoutIso.value && cell.iso !== checkIn.value) {
    return true
  }
  return false
}

function dayCellClass(cell: Cell): string {
  const base = 'font-inter relative flex w-8 h-8 items-center justify-center text-sm transition-colors'
  if (isDayDisabled(cell)) {
    return cn(base, 'cursor-not-allowed opacity-40', cell.inMonth ? 'text-gray-900' : 'text-gray-500')
  }
  if (isRangeStart(cell.iso)) {
    return cn(base, 'rounded-full bg-orange-500 text-white cursor-pointer z-10 hover:bg-orange-400')
  }
  if (isRangeEnd(cell.iso)) {
    return cn(base, 'rounded-full bg-orange-500 text-white cursor-pointer z-10 hover:bg-orange-400')
  }
  if (isRangeMiddle(cell.iso)) {
    return cn(base, 'bg-[#ECE0FD] text-gray-800 cursor-pointer')
  }
  if (cell.inMonth) {
    return cn(base, 'rounded-full text-gray-800 cursor-pointer hover:bg-gray-100')
  }
  return cn(base, 'rounded-full text-gray-600 opacity-40 cursor-pointer hover:bg-gray-100')
}

function onDayClick(iso: string, cellDisabled: boolean) {
  if (isDayDisabled({ iso, dayNum: 0, inMonth: true, disabled: cellDisabled })) return

  if (activeField.value === 'checkin') {
    checkIn.value = iso
    const minOut = addDaysIso(iso, 1)
    if (checkOut.value <= iso || checkOut.value < minOut) {
      checkOut.value = minOut
    }
    activeField.value = 'checkout'
    return
  }
  if (iso < minCheckoutIso.value) return
  checkOut.value = iso
  open.value = false
  activeField.value = 'checkin'
}

function prevMonths() {
  const d = viewMonth.value
  viewMonth.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

function nextMonths() {
  const d = viewMonth.value
  viewMonth.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

function toggleCheckIn() {
  if (open.value && activeField.value === 'checkin') {
    open.value = false
    return
  }
  activeField.value = 'checkin'
  open.value = true
  emit('openChange', true)
}

function toggleCheckOut() {
  if (open.value && activeField.value === 'checkout') {
    open.value = false
    return
  }
  activeField.value = 'checkout'
  open.value = true
  emit('openChange', true)
}

function formatDisplay(iso: string): string {
  const d = parseIso(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    if (open.value) {
      open.value = false
      emit('openChange', false)
    }
  }
}

defineExpose({
  closePopover() {
    open.value = false
  },
})

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative">
    <div class="flex flex-row items-end gap-6">
      <div class="flex flex-col gap-1">
        <label class="text-gray-900 text-base leading-[150%] font-normal select-none">
          Check In
        </label>
        <button
          type="button"
          aria-label="Select check-in date"
          :aria-expanded="open && activeField === 'checkin'"
          :class="
            cn(
              'flex flex-row items-center justify-between gap-2 pl-3 pr-4 py-3 h-12 rounded border',
              'font-inter text-base leading-[150%] outline-none cursor-pointer',
              'transition-colors duration-200 min-w-[240px]',
              open && activeField === 'checkin' ? 'border-orange-500' : 'border-gray-400',
            )
          "
          @click="toggleCheckIn"
        >
          <span :class="checkIn ? 'text-gray-900' : 'text-gray-600'">
            {{ checkIn ? formatDisplay(checkIn) : 'Place Holder' }}
          </span>
          <Calendar :size="24" class="text-gray-600 shrink-0" aria-hidden="true" />
        </button>
      </div>

      <span class="pb-3 text-gray-900 text-base select-none">-</span>

      <div class="flex flex-col gap-1">
        <label class="text-gray-900 text-base leading-[150%] font-normal select-none">
          Check Out
        </label>
        <button
          type="button"
          aria-label="Select check-out date"
          :aria-expanded="open && activeField === 'checkout'"
          :class="
            cn(
              'flex flex-row items-center justify-between gap-2 pl-3 pr-4 py-3 h-12 rounded border',
              'font-inter text-base leading-[150%] outline-none cursor-pointer',
              'transition-colors duration-200 min-w-[240px]',
              open && activeField === 'checkout' ? 'border-orange-500' : 'border-gray-400',
            )
          "
          @click="toggleCheckOut"
        >
          <span :class="checkOut ? 'text-gray-900' : 'text-gray-600'">
            {{ checkOut ? formatDisplay(checkOut) : 'Place Holder' }}
          </span>
          <Calendar :size="24" class="text-gray-600 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div
      v-if="open"
      role="dialog"
      aria-label="Date range picker"
      class="absolute z-50 mt-1 bg-white rounded shadow-1 flex flex-row overflow-hidden"
    >
      <div class="w-64">
        <div
          class="flex items-center justify-between px-6 pt-4 pb-3 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          <button
            type="button"
            class="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Previous month"
            @click.stop="prevMonths"
          >
            <ChevronLeft :size="20" />
          </button>
          <div class="flex items-center gap-0.5">
            <span class="text-gray-800 text-sm font-medium leading-[150%]">{{ leftMonthLabel }}</span>
            <ChevronDown :size="20" class="text-gray-600" aria-hidden="true" />
          </div>
          <div class="w-5 h-5" />
        </div>

        <div
          class="grid grid-cols-7 px-4 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          <div
            v-for="(d, i) in WEEKDAYS"
            :key="i"
            class="h-8 flex items-center justify-center text-gray-800 text-sm font-medium"
          >
            {{ d }}
          </div>
        </div>

        <div class="px-4 pb-4">
          <div v-for="(week, wi) in leftGrid" :key="wi" class="grid grid-cols-7">
            <button
              v-for="cell in week"
              :key="cell.iso"
              type="button"
              :aria-label="parseIso(cell.iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })"
              :disabled="isDayDisabled(cell)"
              :class="dayCellClass(cell)"
              @click.stop="onDayClick(cell.iso, cell.disabled)"
            >
              {{ cell.dayNum }}
            </button>
          </div>
        </div>
      </div>

      <div class="w-px bg-gray-200 my-4" />

      <div class="w-64">
        <div
          class="flex items-center justify-between px-6 pt-4 pb-3 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          <div class="w-5 h-5" />
          <div class="flex items-center gap-0.5">
            <span class="text-gray-800 text-sm font-medium leading-[150%]">{{ rightMonthLabel }}</span>
            <ChevronDown :size="20" class="text-gray-600" aria-hidden="true" />
          </div>
          <button
            type="button"
            class="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Next month"
            @click.stop="nextMonths"
          >
            <ChevronRight :size="20" />
          </button>
        </div>

        <div
          class="grid grid-cols-7 px-4 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          <div
            v-for="(d, i) in WEEKDAYS"
            :key="i"
            class="h-8 flex items-center justify-center text-gray-800 text-sm font-medium"
          >
            {{ d }}
          </div>
        </div>

        <div class="px-4 pb-4">
          <div v-for="(week, wi) in rightGrid" :key="wi" class="grid grid-cols-7">
            <button
              v-for="cell in week"
              :key="cell.iso"
              type="button"
              :aria-label="parseIso(cell.iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })"
              :disabled="isDayDisabled(cell)"
              :class="dayCellClass(cell)"
              @click.stop="onDayClick(cell.iso, cell.disabled)"
            >
              {{ cell.dayNum }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
