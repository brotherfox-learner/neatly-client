<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import LandingDateRangePicker from "@/components/landing/LandingDateRangePicker.vue"
import { addDaysIsoLocal, todayIsoLocal } from "@/lib/dateIsoLocal"

const router = useRouter()
const route = useRoute()

const checkIn = ref(todayIsoLocal())
const checkOut = ref(addDaysIsoLocal(todayIsoLocal(), 1))

const dateRangeRef = ref<InstanceType<typeof LandingDateRangePicker> | null>(null)

const rooms = ref(1)
const adults = ref(2)
const children = ref(0)

const guestPickerOpen = ref(false)
const guestPickerRef = ref<HTMLElement | null>(null)

const guestSummary = computed(() => {
  const r = rooms.value
  const p = adults.value + children.value
  return `${r} room${r > 1 ? "s" : ""}, ${p} guest${p !== 1 ? "s" : ""}`
})

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

function changeRooms(delta: number) {
  rooms.value = clamp(rooms.value + delta, 1, 9)
}
function changeAdults(delta: number) {
  adults.value = clamp(adults.value + delta, 1, 30)
}
function changeChildren(delta: number) {
  children.value = clamp(children.value + delta, 0, 10)
}

function onClickOutside(e: MouseEvent) {
  if (guestPickerRef.value && !guestPickerRef.value.contains(e.target as Node)) {
    guestPickerOpen.value = false
  }
}

function toggleGuestPicker() {
  if (!guestPickerOpen.value) {
    dateRangeRef.value?.closePopover()
  }
  guestPickerOpen.value = !guestPickerOpen.value
}

function onDatePopoverOpen(v: boolean) {
  if (v) guestPickerOpen.value = false
}

function parsePositiveInt(v: unknown, fallback: number): number {
  const n = Number.parseInt(String(v ?? ""), 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

function applySearchQueryFromRoute() {
  const q = route.query
  if (typeof q.checkIn === "string" && q.checkIn) checkIn.value = q.checkIn
  if (typeof q.checkOut === "string" && q.checkOut) checkOut.value = q.checkOut
  const rc = parsePositiveInt(q.rooms, 1)
  rooms.value = rc < 1 ? 1 : Math.min(rc, 9)
  const ad = parsePositiveInt(q.adults, 2)
  adults.value = ad < 1 ? 1 : Math.min(ad, 30)
  const ch = parsePositiveInt(q.children, 0)
  children.value = Math.min(ch, 10)
}

watch(
  () => route.query,
  () => {
    if (route.name === "search") applySearchQueryFromRoute()
  },
  { deep: true },
)

function onSearch() {
  router.push({
    name: "search",
    query: {
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      rooms: String(rooms.value),
      adults: String(adults.value),
      children: String(children.value),
    },
  })
}

onMounted(() => {
  if (route.name === "search") applySearchQueryFromRoute()
  document.addEventListener("mousedown", onClickOutside)
})
onUnmounted(() => document.removeEventListener("mousedown", onClickOutside))
</script>

<template>
  <section
    class="border-border mx-auto w-full max-w-[1440px] border-b bg-white px-4 py-4 md:px-6 md:py-5 lg:px-10 xl:px-[160px]"
    aria-label="Search and filter stays"
  >
    <div
      class="mx-auto flex w-full max-w-[1120px] flex-col gap-4 md:flex-row md:items-end md:gap-6 lg:gap-10"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-end md:gap-6 lg:gap-10">
        <div class="flex min-w-0 flex-1 flex-col gap-1 md:max-w-[min(100%,520px)]">
          <span class="body-1 font-inter text-[16px] font-normal text-[#2A2E3F]">
            Check-in &amp; Check-out
          </span>
          <LandingDateRangePicker
            ref="dateRangeRef"
            v-model:check-in="checkIn"
            v-model:check-out="checkOut"
            @open-change="onDatePopoverOpen"
          />
        </div>

        <div
          ref="guestPickerRef"
          class="relative flex w-full flex-col gap-1 md:w-[240px] md:shrink-0"
        >
          <label class="body-1 font-inter text-[16px] font-normal text-[#2A2E3F]">
            Rooms &amp; Guests
          </label>
          <button
            type="button"
            class="body-1 font-inter flex h-12 w-full items-center justify-between rounded-[4px] border border-[#D6D9E4] bg-white px-3 text-left text-[#2A2E3F]"
            :aria-expanded="guestPickerOpen"
            aria-haspopup="dialog"
            @click="toggleGuestPicker"
          >
            <span>{{ guestSummary }}</span>
            <svg
              class="size-4 shrink-0 text-gray-400 transition-transform"
              :class="guestPickerOpen ? 'rotate-180' : ''"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <div
            v-if="guestPickerOpen"
            class="absolute bottom-[calc(100%+8px)] left-0 z-50 w-full min-w-[280px] rounded-lg border border-[#D6D9E4] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] md:bottom-auto md:top-[calc(100%+8px)]"
            role="dialog"
            aria-label="Select rooms and guests"
          >
            <div class="flex items-center justify-between py-3">
              <p class="font-inter text-[14px] font-medium text-[#2A2E3F]">Rooms</p>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-full border border-[#D6D9E4] text-[#2A2E3F] transition-colors hover:bg-gray-50 disabled:opacity-30"
                  :disabled="rooms <= 1"
                  aria-label="Decrease rooms"
                  @click="changeRooms(-1)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/></svg>
                </button>
                <span class="font-inter w-4 text-center text-[16px] font-bold text-[#2A2E3F]">{{ rooms }}</span>
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-full border border-[#D6D9E4] text-[#2A2E3F] transition-colors hover:bg-gray-50 disabled:opacity-30"
                  :disabled="rooms >= 9"
                  aria-label="Increase rooms"
                  @click="changeRooms(1)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
            </div>
            <div class="border-t border-[#D6D9E4]" />
            <div class="flex items-center justify-between py-3">
              <div>
                <p class="font-inter text-[14px] font-medium text-[#2A2E3F]">Adults</p>
                <p class="font-inter text-[12px] text-[#9AA1B9]">Age 18+</p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-full border border-[#D6D9E4] text-[#2A2E3F] transition-colors hover:bg-gray-50 disabled:opacity-30"
                  :disabled="adults <= 1"
                  aria-label="Decrease adults"
                  @click="changeAdults(-1)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/></svg>
                </button>
                <span class="font-inter w-4 text-center text-[16px] font-bold text-[#2A2E3F]">{{ adults }}</span>
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-full border border-[#D6D9E4] text-[#2A2E3F] transition-colors hover:bg-gray-50 disabled:opacity-30"
                  :disabled="adults >= 30"
                  aria-label="Increase adults"
                  @click="changeAdults(1)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
            </div>
            <div class="border-t border-[#D6D9E4]" />
            <div class="flex items-center justify-between py-3">
              <div>
                <p class="font-inter text-[14px] font-medium text-[#2A2E3F]">Children</p>
                <p class="font-inter text-[12px] text-[#9AA1B9]">Age 0–17</p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-full border border-[#D6D9E4] text-[#2A2E3F] transition-colors hover:bg-gray-50 disabled:opacity-30"
                  :disabled="children <= 0"
                  aria-label="Decrease children"
                  @click="changeChildren(-1)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/></svg>
                </button>
                <span class="font-inter w-4 text-center text-[16px] font-bold text-[#2A2E3F]">{{ children }}</span>
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-full border border-[#D6D9E4] text-[#2A2E3F] transition-colors hover:bg-gray-50 disabled:opacity-30"
                  :disabled="children >= 10"
                  aria-label="Increase children"
                  @click="changeChildren(1)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
            </div>
            <button
              type="button"
              class="font-open-sans mt-2 h-10 w-full rounded-[4px] bg-[#C14817] text-[14px] font-semibold text-white transition-colors hover:bg-[#a83e14]"
              @click="guestPickerOpen = false"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <div class="flex w-full shrink-0 md:w-auto md:justify-end">
        <button
          type="button"
          class="font-open-sans h-12 w-full rounded-[4px] border-2 border-[#C14817] bg-white px-6 text-[16px] font-semibold text-[#C14817] transition-colors hover:bg-[#C14817]/5 md:w-[144px]"
          @click="onSearch"
        >
          Search
        </button>
      </div>
    </div>
  </section>
</template>
