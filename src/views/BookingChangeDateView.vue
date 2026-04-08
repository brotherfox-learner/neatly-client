<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, X } from 'lucide-vue-next'

const router = useRouter()

// TODO: const bookingId = useRoute().params.id  (use when API is ready)

// Mock data – replace with API call using bookingId
const roomName = ref('Superior Garden View')
const roomImage = ref(
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
)
const bookingDate = ref('Tue, 16 Oct 2022')

// ISO dates for computation
const originalCheckInISO = ref('2026-04-07T07:00:00.000Z')
const originalCheckOutISO = ref('2026-04-08T07:00:00.000Z')

// Compute original number of nights (locked – cannot exceed)
const originalNights = computed(() => {
  const diffMs =
    new Date(originalCheckOutISO.value).getTime() -
    new Date(originalCheckInISO.value).getTime()
  return Math.round(diffMs / (24 * 60 * 60 * 1000))
})

// Display strings for original dates
const originalCheckIn = computed(() => formatDisplayDate(originalCheckInISO.value))
const originalCheckOut = computed(() => formatDisplayDate(originalCheckOutISO.value))

// New dates (ISO) – default to original
const newCheckInISO = ref(originalCheckInISO.value)
const newCheckOutISO = ref(originalCheckOutISO.value)

// Format ISO → date input value (YYYY-MM-DD)
const toInputDate = (iso: string): string => {
  return iso.slice(0, 10)
}

// Format ISO → display string
const formatDisplayDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Bind to <input type="date">
const checkInInputValue = ref(toInputDate(newCheckInISO.value))
const checkOutDisplay = computed(() => formatDisplayDate(newCheckOutISO.value))

// When user changes Check In → auto-adjust Check Out to keep same number of nights
watch(checkInInputValue, (val) => {
  const newIn = new Date(val)
  if (isNaN(newIn.getTime())) return
  newCheckInISO.value = newIn.toISOString()

  const newOut = new Date(newIn.getTime() + originalNights.value * 24 * 60 * 60 * 1000)
  newCheckOutISO.value = newOut.toISOString()
})

// Minimum check-in date = tomorrow
const minCheckInDate = computed(() => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return toInputDate(tomorrow.toISOString())
})

const showModal = ref(false)

const handleConfirm = () => {
  showModal.value = true
}

const handleModalConfirm = () => {
  showModal.value = false
  // TODO: Call API to update dates before navigating
  router.push({ name: 'change-date-success' })
}

const handleModalClose = () => {
  showModal.value = false
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="bg-bg min-h-screen">
    <!-- Title Section -->
    <div class="mx-auto w-full max-w-[1120px] px-4 pt-10 pb-6 md:px-0 md:pt-20 md:pb-0">
      <h1 class="change-date-title text-[#2F3E35] md:text-[#465C50]">
        Change Check-in and Check-out Date
      </h1>
    </div>

    <!-- Room History Card -->
    <div
      class="mx-auto flex w-full max-w-[1120px] flex-col items-start border-b border-[#E4E6ED] pb-6 md:py-10"
    >
      <!-- Card content: vertical on mobile, horizontal on PC -->
      <div class="flex w-full flex-col items-start gap-4 md:flex-row md:gap-12">
        <!-- Room Image -->
        <img
          :src="roomImage"
          :alt="roomName"
          class="h-[221px] w-full rounded object-cover md:h-[210px] md:w-[357px] md:shrink-0"
        />

        <!-- Room Wrapper -->
        <div
          class="flex w-full flex-col gap-8 px-4 pb-6 md:flex-1 md:px-0"
        >
          <!-- Room Name + Booking Date -->
          <div class="flex flex-col gap-1">
            <div
              class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4"
            >
              <h3 class="headline-4 text-black">{{ roomName }}</h3>
              <p class="body-1 text-[#9AA1B9]">
                Booking date: {{ bookingDate }}
              </p>
            </div>
          </div>

          <!-- Original Date -->
          <div class="flex flex-col">
            <span class="body-1 font-semibold text-[#424C6B]">Original Date</span>
            <div class="flex flex-row items-baseline gap-2 py-1">
              <span class="body-1 text-[#646D89]">{{ originalCheckIn }}</span>
              <span class="body-1 text-[#646D89]">-</span>
              <span class="body-1 text-[#646D89]">{{ originalCheckOut }}</span>
            </div>
          </div>

          <!-- Change Date Section -->
          <div class="flex flex-col gap-4 rounded bg-white p-4">
            <span class="body-1 font-semibold text-[#424C6B]">Change Date</span>

            <p class="body-1 text-[#646D89]">
              {{ originalNights }} Night{{ originalNights > 1 ? 's' : '' }} (cannot be changed)
            </p>

            <!-- Check-in / Check-out inputs -->
            <div
              class="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-6"
            >
              <!-- Check In (editable date picker) -->
              <div class="flex w-full flex-col gap-1 md:flex-1">
                <label class="body-1 text-[#2A2E3F]">Check In</label>
                <div
                  class="flex items-center gap-2 rounded border border-[#D6D9E4] bg-white px-3 py-3"
                >
                  <input
                    v-model="checkInInputValue"
                    type="date"
                    :min="minCheckInDate"
                    class="body-1 w-full flex-1 border-none bg-transparent text-[#2A2E3F] outline-none"
                  />
                </div>
              </div>

              <!-- Separator (PC only) -->
              <span class="body-1 hidden text-black md:block md:pt-6">-</span>

              <!-- Check Out (read-only, auto-adjusted) -->
              <div class="flex w-full flex-col gap-1 md:flex-1">
                <label class="body-1 text-[#2A2E3F]">Check Out</label>
                <div
                  class="flex items-center gap-2 rounded border border-[#D6D9E4] bg-[#F1F2F6] px-3 py-3"
                >
                  <span class="body-1 flex-1 text-[#2A2E3F]">
                    {{ checkOutDisplay }}
                  </span>
                  <Calendar class="size-6 shrink-0 text-[#9AA1B9]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Button Wrapper -->
      <!-- Mobile: stacked (confirm button full-width + cancel below) -->
      <!-- PC: row with cancel left, confirm right -->
      <div
        class="mt-6 flex w-full flex-col items-center gap-6 px-4 md:flex-row md:justify-between md:px-0"
      >
        <!-- Cancel (mobile: order-2 below, PC: order-1 left) -->
        <button
          type="button"
          class="font-open-sans order-2 cursor-pointer text-base font-semibold text-[#E76B39] transition-colors hover:text-orange-400 md:order-1"
          @click="handleCancel"
        >
          Cancel
        </button>

        <!-- Confirm Change Date (mobile: order-1 full-width, PC: order-2 right) -->
        <button
          type="button"
          class="font-open-sans order-1 w-full cursor-pointer rounded bg-[#C14817] px-8 py-4 text-center text-base font-semibold text-white transition-colors hover:bg-orange-500 active:bg-orange-700 md:order-2 md:w-auto"
          @click="handleConfirm"
        >
          Confirm Change Date
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        @click.self="handleModalClose"
      >
        <div class="w-full max-w-[440px] rounded-lg bg-white p-6 shadow-xl">
          <!-- Header -->
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-[#2A2E3F]">Change Date</h2>
            <button
              type="button"
              class="cursor-pointer text-[#9AA1B9] hover:text-[#2A2E3F]"
              @click="handleModalClose"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- Body -->
          <p class="body-1 mb-6 text-[#646D89]">
            Are you sure you want to change your check-in and check-out date?
          </p>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              class="font-open-sans cursor-pointer rounded border border-[#D6D9E4] px-5 py-2.5 text-sm font-semibold text-[#2A2E3F] transition-colors hover:bg-gray-50"
              @click="handleModalClose"
            >
              No, I don't
            </button>
            <button
              type="button"
              class="font-open-sans cursor-pointer rounded bg-[#C14817] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 active:bg-orange-700"
              @click="handleModalConfirm"
            >
              Yes, I want to change
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.change-date-title {
  font-family: var(--font-noto-serif);
  font-weight: 500;
  letter-spacing: -0.02em;
  font-size: 44px;
  line-height: 125%;
}

@media (min-width: 768px) {
  .change-date-title {
    font-size: 68px;
    line-height: 125%;
  }
}
</style>
