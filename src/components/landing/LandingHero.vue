<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useRouter } from "vue-router"
import LandingDateRangePicker from "@/components/landing/LandingDateRangePicker.vue"
import { addDaysIsoLocal, todayIsoLocal } from "@/lib/dateIsoLocal"

const router = useRouter()

const checkIn = ref(todayIsoLocal())
const checkOut = ref(addDaysIsoLocal(todayIsoLocal(), 1))

const dateRangeRef = ref<InstanceType<typeof LandingDateRangePicker> | null>(null)

/* ── Guest picker ── */
const rooms = ref(1)
const adults = ref(2)
const children = ref(0)

const guestPickerOpen = ref(false)
const guestPickerRef = ref<HTMLElement | null>(null)

const guestSummary = computed(() => {
  const r = rooms.value
  const p = adults.value + children.value
  return `${r} Room${r > 1 ? "s" : ""}, ${p} Guest${p !== 1 ? "s" : ""}`
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

onMounted(() => document.addEventListener("mousedown", onClickOutside))
onUnmounted(() => document.removeEventListener("mousedown", onClickOutside))
</script>

<template>
  <section
    class="relative flex min-h-[754px] w-full flex-col md:min-h-[900px]"
    aria-labelledby="landing-hero-heading"
  >
    <div class="absolute inset-0 overflow-hidden">
      <img
        src="/LandingPagePic/MainHeroPic.jpg"
        alt="Neatly Hotel resort pool and traditional architecture at twilight"
        class="size-full object-cover"
        width="1920"
        height="1080"
        decoding="async"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_19.66%,rgba(0,0,0,0)_100%)]"
        aria-hidden="true"
      />
    </div>

    <div class="relative z-1 flex flex-1 flex-col px-4 pb-8 pt-16 md:px-6 md:pb-12 md:pt-24">
      <div class="flex flex-1 flex-col items-center justify-end px-2 pb-8 text-center md:px-8 md:pb-14">
        <h1
          id="landing-hero-heading"
          class="landing-hero-title font-noto-serif max-w-[20ch] text-balance text-white md:max-w-[22ch]"
        >
          A Best Place for Your Neatly Experience
        </h1>
      </div>

      <!-- Search card -->
      <div
        class="mx-auto mb-10 flex w-full max-w-[1120px] flex-col gap-4 overflow-visible rounded-[4px] bg-white p-4 shadow-[4px_4px_16px_rgba(0,0,0,0.08)] md:mb-20 md:min-h-[196px] md:flex-row md:items-end md:gap-0 md:p-6 lg:px-12 lg:py-12 xl:px-[60px] xl:py-[60px]"
      >
        <div class="flex min-h-[396px] flex-col gap-4 md:min-h-0 md:flex-1 md:flex-row md:items-end md:gap-10">
          <!-- Check-in / Check-out (Agoda-style range calendar) -->
          <div class="flex min-w-0 flex-1 flex-col gap-1 md:h-[76px] md:max-w-[min(100%,520px)] md:justify-between">
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

          <!-- Room & Guests picker -->
          <div
            ref="guestPickerRef"
            class="relative flex flex-1 flex-col gap-1 md:h-[76px] md:max-w-[240px] md:justify-between"
          >
            <label class="body-1 font-inter text-[16px] font-normal text-[#2A2E3F]">
              Room &amp; Guests
            </label>

            <!-- Trigger button -->
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

            <!-- Dropdown panel -->
            <div
              v-if="guestPickerOpen"
              class="absolute bottom-[calc(100%+8px)] left-0 z-50 w-full min-w-[280px] rounded-lg border border-[#D6D9E4] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] md:bottom-auto md:top-[calc(100%+8px)]"
              role="dialog"
              aria-label="Select rooms and guests"
            >
              <!-- Rooms -->
              <div class="flex items-center justify-between py-3">
                <div>
                  <p class="font-inter text-[14px] font-medium text-[#2A2E3F]">Rooms</p>
                </div>
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

              <!-- Adults -->
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

              <!-- Children -->
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

              <!-- Done button -->
              <button
                type="button"
                class="font-open-sans mt-2 h-10 w-full rounded-[4px] bg-orange-600 text-[14px] font-semibold text-white transition-colors hover:bg-orange-500"
                @click="guestPickerOpen = false"
              >
                Done
              </button>
            </div>
          </div>
        </div>

        <!-- Search button -->
        <div class="flex items-end justify-stretch md:ml-10 md:w-[144px] md:shrink-0">
          <button
            type="button"
            class="font-open-sans h-12 w-full rounded-[4px] bg-orange-600 text-[16px] font-semibold text-white transition-colors hover:bg-orange-500 active:bg-orange-700 md:h-12 md:w-[144px]"
            @click="
              router.push({
                name: 'search',
                query: {
                  checkIn: checkIn,
                  checkOut: checkOut,
                  rooms: String(rooms),
                  adults: String(adults),
                  children: String(children),
                },
              })
            "
          >
            Search
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
