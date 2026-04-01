<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import { computed, onMounted, onUnmounted, ref, watch } from "vue"

const checkIn = defineModel<string>("checkIn", { required: true })
const checkOut = defineModel<string>("checkOut", { required: true })

const emit = defineEmits<{ openChange: [open: boolean] }>()

function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function addDaysIso(iso: string, days: number): string {
  const parts = iso.split("-").map(Number)
  const y = parts[0] ?? 0
  const mo = parts[1] ?? 1
  const da = parts[2] ?? 1
  const dt = new Date(y, mo - 1, da)
  dt.setDate(dt.getDate() + days)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  return `${yy}-${mm}-${dd}`
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
}

const checkInMin = todayIso()

const open = ref(false)
/** Which date the calendar clicks apply to (also drives tab + accent colours). */
const activeField = ref<"checkin" | "checkout">("checkin")
const rootRef = ref<HTMLElement | null>(null)

/** First month shown (left column on desktop) */
const viewMonth = ref(new Date())

watch(
  () => [open.value, checkIn.value] as const,
  ([isOpen, inVal]) => {
    if (isOpen) {
      const d = parseIso(inVal)
      viewMonth.value = new Date(d.getFullYear(), d.getMonth(), 1)
    }
  },
)

watch(open, (v) => {
  emit("openChange", v)
})

defineExpose({
  closePopover() {
    open.value = false
  },
})

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

const weekdayShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

function formatTriggerLine(iso: string): { date: string; weekday: string } {
  const d = parseIso(iso)
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" })
  return { date, weekday }
}

const checkInDisplay = computed(() => formatTriggerLine(checkIn.value))
const checkOutDisplay = computed(() => formatTriggerLine(checkOut.value))

const leftMonthLabel = computed(() => {
  const d = viewMonth.value
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
})

const rightMonthLabel = computed(() => {
  const d = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 1)
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
})

function prevMonths() {
  const d = viewMonth.value
  viewMonth.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

function nextMonths() {
  const d = viewMonth.value
  viewMonth.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

interface Cell {
  iso: string
  dayNum: number
  inMonth: boolean
  disabled: boolean
}

function isoFromYmd(y: number, m: number, day: number): string {
  const mm = String(m + 1).padStart(2, "0")
  const dd = String(day).padStart(2, "0")
  return `${y}-${mm}-${dd}`
}

/** Monday-first 6-row grid for one month */
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
      const iso = isoFromYmd(y, m, d)
      const inMonth = m === monthIndex
      const disabled = iso < checkInMin
      row.push({ iso, dayNum: d, inMonth, disabled })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(row)
  }
  return weeks
}

const leftGrid = computed(() => {
  const d = viewMonth.value
  return buildMonthGrid(d.getFullYear(), d.getMonth())
})

const rightGrid = computed(() => {
  const d = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 1)
  return buildMonthGrid(d.getFullYear(), d.getMonth())
})

function isRangeStart(iso: string): boolean {
  return iso === checkIn.value
}

function isRangeEnd(iso: string): boolean {
  return iso === checkOut.value
}

function isRangeMiddle(iso: string): boolean {
  return iso > checkIn.value && iso < checkOut.value
}

const minCheckoutIso = computed(() => addDaysIso(checkIn.value, 1))

/** Number of nights between check-in and check-out (checkout day is departure, not counted as a slept night). */
const stayNights = computed(() => {
  const start = parseIso(checkIn.value)
  const end = parseIso(checkOut.value)
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diffDays)
})

const doneButtonLabel = computed(() => {
  const nights = stayNights.value
  const days = nights + 1
  const dayWord = days === 1 ? "day" : "days"
  const nightWord = nights === 1 ? "night" : "nights"
  return `Done · ${days} ${dayWord} / ${nights} ${nightWord}`
})

function isDayDisabled(iso: string, cellBaseDisabled: boolean): boolean {
  if (cellBaseDisabled) return true
  if (
    activeField.value === "checkout" &&
    iso < minCheckoutIso.value &&
    iso !== checkIn.value
  ) {
    return true
  }
  return false
}

function dayCellClass(cell: Cell): string {
  const base =
    "font-inter relative flex h-9 items-center justify-center text-[13px] md:h-10 transition-colors"
  if (isDayDisabled(cell.iso, cell.disabled)) {
    return `${base} cursor-not-allowed opacity-40 ${cell.inMonth ? "text-[#2A2E3F]" : "text-[#C5C9D6]"}`
  }
  const muted = cell.inMonth ? "text-[#2A2E3F]" : "text-[#C5C9D6]"
  if (cell.iso === checkIn.value && activeField.value === "checkout") {
    return `${base} cursor-default rounded-full border border-[#557165]/35 bg-[#557165]/12 font-semibold text-[#557165] hover:bg-[#557165]/16`
  }
  if (cell.iso === checkOut.value && activeField.value === "checkin") {
    return `${base} cursor-pointer rounded-full border border-[#C14817]/35 bg-[#C14817]/12 font-semibold text-[#C14817] hover:bg-[#C14817]/16`
  }
  if (isRangeStart(cell.iso)) {
    return `${base} cursor-pointer rounded-full bg-[#557165] font-semibold text-white hover:bg-[#465c50]`
  }
  if (isRangeEnd(cell.iso)) {
    return `${base} cursor-pointer rounded-full bg-[#C14817] font-semibold text-white hover:bg-[#a83e14]`
  }
  if (isRangeMiddle(cell.iso)) {
    return `${base} cursor-pointer bg-[#e5ecea] ${muted}`
  }
  if (activeField.value === "checkin") {
    return `${base} cursor-pointer hover:bg-[#e5ecea] ${muted}`
  }
  return `${base} cursor-pointer hover:bg-[#f6eae6] ${muted}`
}

function onDayClick(iso: string) {
  if (isDayDisabled(iso, iso < checkInMin)) return

  if (activeField.value === "checkin") {
    checkIn.value = iso
    const minOut = addDaysIso(iso, 1)
    if (checkOut.value <= iso || checkOut.value < minOut) {
      checkOut.value = minOut
    }
    activeField.value = "checkout"
    return
  }

  const minOut = minCheckoutIso.value
  if (iso < minOut) return
  checkOut.value = iso
}

function toggleCheckIn() {
  if (open.value && activeField.value === "checkin") {
    open.value = false
    return
  }
  activeField.value = "checkin"
  open.value = true
}

function toggleCheckOut() {
  if (open.value && activeField.value === "checkout") {
    open.value = false
    return
  }
  activeField.value = "checkout"
  open.value = true
}

function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener("mousedown", onClickOutside))
onUnmounted(() => document.removeEventListener("mousedown", onClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative w-full md:max-w-[520px]">
    <!-- Trigger: Check-in | Check-out (h-12 matches Room & Guests row) -->
    <div
      class="flex h-12 w-full items-stretch overflow-hidden rounded-[4px] border border-[#D6D9E4] bg-white"
    >
      <button
        type="button"
        class="font-inter flex min-h-0 min-w-0 flex-1 items-center gap-2 px-2 text-left transition-colors hover:bg-gray-50 md:px-3"
        :class="open && activeField === 'checkin' ? 'bg-green-100/90' : ''"
        :title="`${checkInDisplay.date} — ${checkInDisplay.weekday}`"
        aria-label="Select check-in date"
        @click="toggleCheckIn"
      >
        <img
          src="/Icon%20figma/Calendar.svg"
          alt=""
          width="24"
          height="24"
          class="size-6 shrink-0"
        />
        <span class="flex min-w-0 flex-col justify-center leading-tight">
          <span class="text-[10px] leading-3 font-medium text-[#646D89]">Check-in</span>
          <span class="truncate text-[13px] font-semibold text-[#2A2E3F] md:text-[14px]">
            {{ checkInDisplay.date }}
          </span>
        </span>
      </button>

      <div class="w-px shrink-0 self-stretch bg-[#D6D9E4]" aria-hidden="true" />

      <button
        type="button"
        class="font-inter flex min-h-0 min-w-0 flex-1 items-center gap-2 px-2 text-left transition-colors hover:bg-gray-50 md:px-3"
        :class="open && activeField === 'checkout' ? 'bg-orange-100/90' : ''"
        :title="`${checkOutDisplay.date} — ${checkOutDisplay.weekday}`"
        aria-label="Select check-out date"
        @click="toggleCheckOut"
      >
        <img
          src="/Icon%20figma/Calendar.svg"
          alt=""
          width="24"
          height="24"
          class="size-6 shrink-0"
        />
        <span class="flex min-w-0 flex-col justify-center leading-tight">
          <span class="text-[10px] leading-3 font-medium text-[#646D89]">Check-out</span>
          <span class="truncate text-[13px] font-semibold text-[#2A2E3F] md:text-[14px]">
            {{ checkOutDisplay.date }}
          </span>
        </span>
      </button>
    </div>

    <!-- Popover -->
    <div
      v-if="open"
      class="absolute left-0 right-0 top-[calc(100%+8px)] z-60 rounded-xl border border-[#D6D9E4] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.15)] md:left-auto md:right-auto md:w-[min(100vw-2rem,640px)]"
      role="dialog"
      aria-label="Select stay dates"
    >
      <!-- Tabs: same modes as trigger halves -->
      <div class="flex border-b border-[#E4E6ED]">
        <button
          type="button"
          class="font-inter flex-1 px-4 py-3 text-[14px] font-medium transition-colors"
          :class="
            activeField === 'checkin'
              ? 'border-b-2 border-[#557165] text-[#557165]'
              : 'text-[#646D89] hover:text-[#2A2E3F]'
          "
          @click="activeField = 'checkin'"
        >
          Check-in
        </button>
        <button
          type="button"
          class="font-inter flex-1 px-4 py-3 text-[14px] font-medium transition-colors"
          :class="
            activeField === 'checkout'
              ? 'border-b-2 border-[#C14817] text-[#C14817]'
              : 'text-[#646D89] hover:text-[#2A2E3F]'
          "
          @click="activeField = 'checkout'"
        >
          Check-out
        </button>
      </div>

      <div class="p-4 md:p-5">
        <!-- Month nav + dual calendars -->
        <div class="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            class="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#D6D9E4] transition-colors hover:bg-gray-50"
            :class="activeField === 'checkin' ? 'text-[#557165]' : 'text-[#C14817]'"
            aria-label="Previous months"
            @click="prevMonths"
          >
            <ChevronLeft class="size-5" aria-hidden="true" />
          </button>
          <div
            class="font-inter hidden flex-1 text-center text-[15px] font-semibold text-[#2A2E3F] md:flex md:justify-center md:gap-16"
          >
            <span class="w-[140px]">{{ leftMonthLabel }}</span>
            <span class="w-[140px]">{{ rightMonthLabel }}</span>
          </div>
          <span class="font-inter text-center text-[15px] font-semibold text-[#2A2E3F] md:hidden">
            {{ leftMonthLabel }}
          </span>
          <button
            type="button"
            class="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#D6D9E4] transition-colors hover:bg-gray-50"
            :class="activeField === 'checkin' ? 'text-[#557165]' : 'text-[#C14817]'"
            aria-label="Next months"
            @click="nextMonths"
          >
            <ChevronRight class="size-5" aria-hidden="true" />
          </button>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Left month -->
          <div>
            <p class="font-inter mb-2 text-center text-[14px] font-semibold text-[#2A2E3F] md:hidden">
              {{ leftMonthLabel }}
            </p>
            <div class="grid grid-cols-7 gap-y-1">
              <div
                v-for="wd in weekdayShort"
                :key="`l-${wd}`"
                class="font-inter pb-1 text-center text-[11px] font-medium text-[#9AA1B9]"
              >
                {{ wd }}
              </div>
              <template v-for="(row, ri) in leftGrid" :key="`lr-${ri}`">
                <button
                  v-for="cell in row"
                  :key="cell.iso"
                  type="button"
                  :disabled="isDayDisabled(cell.iso, cell.disabled)"
                  :class="dayCellClass(cell)"
                  @click="onDayClick(cell.iso)"
                >
                  {{ cell.dayNum }}
                </button>
              </template>
            </div>
          </div>

          <!-- Right month (desktop) -->
          <div class="hidden md:block">
            <p class="font-inter mb-2 text-center text-[14px] font-semibold text-[#2A2E3F] md:hidden">
              {{ rightMonthLabel }}
            </p>
            <div class="grid grid-cols-7 gap-y-1">
              <div
                v-for="wd in weekdayShort"
                :key="`r-${wd}`"
                class="font-inter pb-1 text-center text-[11px] font-medium text-[#9AA1B9]"
              >
                {{ wd }}
              </div>
              <template v-for="(row, ri) in rightGrid" :key="`rr-${ri}`">
                <button
                  v-for="cell in row"
                  :key="cell.iso"
                  type="button"
                  :disabled="isDayDisabled(cell.iso, cell.disabled)"
                  :class="dayCellClass(cell)"
                  @click="onDayClick(cell.iso)"
                >
                  {{ cell.dayNum }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Mobile: second month below -->
        <div class="mt-6 border-t border-[#E4E6ED] pt-6 md:hidden">
          <p class="font-inter mb-2 text-center text-[14px] font-semibold text-[#2A2E3F]">
            {{ rightMonthLabel }}
          </p>
          <div class="grid grid-cols-7 gap-y-1">
            <div
              v-for="wd in weekdayShort"
              :key="`m2-${wd}`"
              class="font-inter pb-1 text-center text-[11px] font-medium text-[#9AA1B9]"
            >
              {{ wd }}
            </div>
            <template v-for="(row, ri) in rightGrid" :key="`m2r-${ri}`">
              <button
                v-for="cell in row"
                :key="'m2-' + cell.iso"
                type="button"
                :disabled="isDayDisabled(cell.iso, cell.disabled)"
                :class="dayCellClass(cell)"
                @click="onDayClick(cell.iso)"
              >
                {{ cell.dayNum }}
              </button>
            </template>
          </div>
        </div>

        <button
          type="button"
          class="font-open-sans mt-4 flex min-h-10 w-full items-center justify-center rounded-[4px] bg-[#C14817] px-3 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#a83e14]"
          @click="open = false"
        >
          {{ doneButtonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
