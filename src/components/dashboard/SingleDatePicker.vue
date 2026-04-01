<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-vue-next'
import { format } from 'date-fns'

const props = defineProps<{
  modelValue: Date | null
  placeholder?: string
  disabledDate?: (date: Date) => boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [date: Date | null]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const viewMonth = ref(new Date())

// 'day' | 'month' | 'year'
const viewMode = ref<'day' | 'month' | 'year'>('day')

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Year grid (12 years per page) ─────────────────────────────
const yearPageStart = ref(Math.floor(new Date().getFullYear() / 12) * 12)
const yearGrid = computed(() => {
  const years = []
  for (let i = 0; i < 12; i++) years.push(yearPageStart.value + i)
  return years
})

// ── Header label ───────────────────────────────────────────────
const headerLabel = computed(() => {
  if (viewMode.value === 'year') return `${yearPageStart.value} – ${yearPageStart.value + 11}`
  if (viewMode.value === 'month') return `${viewMonth.value.getFullYear()}`
  return `${monthNames[viewMonth.value.getMonth()]} ${viewMonth.value.getFullYear()}`
})

const displayValue = computed(() =>
  props.modelValue ? format(props.modelValue, 'd MMM yyyy') : (props.placeholder ?? 'Select date')
)

// ── Day grid ───────────────────────────────────────────────────
interface Cell { date: Date; dayNum: number; inMonth: boolean; disabled: boolean }

const grid = computed((): Cell[][] => {
  const year = viewMonth.value.getFullYear()
  const month = viewMonth.value.getMonth()
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const weeks: Cell[][] = []
  const cursor = new Date(year, month, 1 - mondayOffset)
  for (let w = 0; w < 6; w++) {
    const row: Cell[] = []
    for (let c = 0; c < 7; c++) {
      const date = new Date(cursor)
      row.push({
        date,
        dayNum: date.getDate(),
        inMonth: date.getMonth() === month,
        disabled: props.disabledDate ? props.disabledDate(date) : false,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(row)
  }
  return weeks
})

function isSelected(date: Date): boolean {
  if (!props.modelValue) return false
  return format(date, 'yyyy-MM-dd') === format(props.modelValue, 'yyyy-MM-dd')
}

// ── Navigation ─────────────────────────────────────────────────
function onPrev() {
  if (viewMode.value === 'day') {
    const d = viewMonth.value
    viewMonth.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  } else if (viewMode.value === 'month') {
    viewMonth.value = new Date(viewMonth.value.getFullYear() - 1, 0, 1)
  } else {
    yearPageStart.value -= 12
  }
}

function onNext() {
  if (viewMode.value === 'day') {
    const d = viewMonth.value
    viewMonth.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  } else if (viewMode.value === 'month') {
    viewMonth.value = new Date(viewMonth.value.getFullYear() + 1, 0, 1)
  } else {
    yearPageStart.value += 12
  }
}

function onHeaderClick() {
  if (viewMode.value === 'day') viewMode.value = 'month'
  else if (viewMode.value === 'month') viewMode.value = 'year'
}

function onSelectMonth(monthIndex: number) {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), monthIndex, 1)
  viewMode.value = 'day'
}

function onSelectYear(year: number) {
  viewMonth.value = new Date(year, viewMonth.value.getMonth(), 1)
  yearPageStart.value = Math.floor(year / 12) * 12
  viewMode.value = 'month'
}

function onDayClick(cell: Cell) {
  if (cell.disabled) return
  emit('update:modelValue', cell.date)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative w-full">
    <!-- Trigger -->
    <button
      type="button"
      class="w-full h-[40px] flex items-center justify-between px-3 border border-gray-300 rounded-[8px] bg-white text-[14px] text-gray-900 hover:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
      @click="open = !open"
    >
      <span :class="modelValue ? 'text-gray-900' : 'text-gray-500'">{{ displayValue }}</span>
      <CalendarIcon class="w-4 h-4 text-gray-500 shrink-0" />
    </button>

    <!-- Popover -->
    <div
      v-if="open"
      class="absolute top-[calc(100%+8px)] left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[280px]"
    >
      <!-- Header nav -->
      <div class="flex items-center justify-between mb-3">
        <button
          type="button"
          class="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50"
          @click="onPrev"
        >
          <ChevronLeft class="w-4 h-4 text-gray-600" />
        </button>

        <!-- คลิกเพื่อ drill up -->
        <button
          type="button"
          class="text-[14px] font-semibold text-gray-900 hover:text-orange-500 transition-colors"
          @click="onHeaderClick"
        >
          {{ headerLabel }}
        </button>

        <button
          type="button"
          class="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50"
          @click="onNext"
        >
          <ChevronRight class="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <!-- Day view -->
      <template v-if="viewMode === 'day'">
        <div class="grid grid-cols-7 gap-y-1">
          <div
            v-for="wd in weekdays" :key="wd"
            class="text-center text-[11px] font-medium text-gray-500 pb-1"
          >
            {{ wd }}
          </div>
          <template v-for="(row, ri) in grid" :key="ri">
            <button
              v-for="cell in row" :key="cell.date.toISOString()"
              type="button"
              :disabled="cell.disabled"
              class="h-9 w-full flex items-center justify-center text-[13px] rounded-full transition-colors"
              :class="[
                cell.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                !cell.inMonth ? 'text-gray-400' : 'text-gray-900',
                isSelected(cell.date)
                  ? 'bg-orange-600 text-white font-semibold'
                  : !cell.disabled ? 'hover:bg-orange-50' : '',
              ]"
              @click="onDayClick(cell)"
            >
              {{ cell.dayNum }}
            </button>
          </template>
        </div>
      </template>

      <!-- Month view -->
      <template v-else-if="viewMode === 'month'">
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="(m, i) in monthShort" :key="m"
            type="button"
            class="h-10 rounded-lg text-[13px] font-medium transition-colors hover:bg-orange-50 text-gray-900"
            :class="viewMonth.getMonth() === i ? 'bg-orange-600 text-white hover:bg-orange-600' : ''"
            @click="onSelectMonth(i)"
          >
            {{ m }}
          </button>
        </div>
      </template>

      <!-- Year view -->
      <template v-else>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="year in yearGrid" :key="year"
            type="button"
            class="h-10 rounded-lg text-[13px] font-medium transition-colors hover:bg-orange-50 text-gray-900"
            :class="viewMonth.getFullYear() === year ? 'bg-orange-600 text-white hover:bg-orange-600' : ''"
            @click="onSelectYear(year)"
          >
            {{ year }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>