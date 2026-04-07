<script lang="ts">
export default { name: 'PromoDayPicker' }
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { format } from 'date-fns'

const props = defineProps<{
  modelValue: Date | null
  placeholder?: string
  disableBeforeDate?: Date
}>()

const emit = defineEmits<{
  'update:modelValue': [date: Date | null]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const viewMonth = ref(new Date())

const today = new Date()
today.setHours(0, 0, 0, 0)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const headerLabel = computed(
  () => `${monthNames[viewMonth.value.getMonth()]} ${viewMonth.value.getFullYear()}`
)

const displayValue = computed(() =>
  props.modelValue
    ? format(props.modelValue, 'd MMM yyyy')
    : (props.placeholder ?? 'Select date')
)

interface Cell {
  date: Date
  dayNum: number
  inMonth: boolean
  disabled: boolean
}

const minDate = computed(() => {
  const d = props.disableBeforeDate ?? today
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
})

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
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      row.push({
        date,
        dayNum: date.getDate(),
        inMonth: date.getMonth() === month,
        disabled: d < minDate.value,
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

function isToday(date: Date): boolean {
  return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
}

function onPrev() {
  const d = viewMonth.value
  viewMonth.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

function onNext() {
  const d = viewMonth.value
  viewMonth.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
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
      class="w-full h-[40px] flex items-center justify-between px-3 border border-gray-300 rounded-[4px] bg-white text-[14px] text-gray-900 hover:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors cursor-pointer"
      :class="open ? 'border-orange-500 ring-1 ring-orange-500' : ''"
      @click="open = !open"
    >
      <span :class="modelValue ? 'text-gray-900' : 'text-gray-400'">{{ displayValue }}</span>
      <img src="/Icon%20figma/Calendar.svg" alt="" width="24" height="24" class="size-6 shrink-0" />
    </button>

    <!-- Popover -->
    <div
      v-if="open"
      class="absolute top-[calc(100%+6px)] left-0 z-50 bg-white border border-gray-200 rounded-sm shadow-md p-3 w-[252px]"
    >
      <!-- Nav -->
      <div class="flex items-center justify-between mb-2">
        <button
          type="button"
          class="flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="onPrev"
        >
          <ChevronLeft class="w-3.5 h-3.5 text-gray-500" />
        </button>

        <span class="text-[13px] font-medium text-gray-900">{{ headerLabel }}</span>

        <button
          type="button"
          class="flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="onNext"
        >
          <ChevronRight class="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      <!-- Day grid -->
      <div class="grid grid-cols-7 gap-y-0.5">
        <!-- Weekday headers -->
        <div
          v-for="(wd, i) in weekdays"
          :key="i"
          class="text-center text-[11px] font-medium text-gray-400 pb-1"
        >
          {{ wd }}
        </div>

        <!-- Day cells -->
        <template v-for="(row, ri) in grid" :key="ri">
          <button
            v-for="cell in row"
            :key="cell.date.toISOString()"
            type="button"
            :disabled="cell.disabled"
            class="h-8 w-full flex items-center justify-center text-[12.5px] rounded-full transition-colors"
            :class="[
              cell.disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'cursor-pointer',
              !cell.inMonth && !cell.disabled
                ? 'text-gray-400'
                : '',
              isSelected(cell.date)
                ? 'bg-orange-600 text-white font-semibold'
                : !cell.disabled
                  ? 'hover:bg-orange-50 hover:text-orange-600'
                  : '',
              isToday(cell.date) && !isSelected(cell.date) && !cell.disabled
                ? 'font-semibold text-orange-500'
                : '',
              cell.inMonth && !cell.disabled && !isSelected(cell.date)
                ? 'text-gray-900'
                : '',
            ]"
            @click="onDayClick(cell)"
          >
            {{ cell.dayNum }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>