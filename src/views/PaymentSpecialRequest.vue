<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { BriefcaseBusiness, Check } from 'lucide-vue-next'
import { useBookingStore } from '@/stores/booking'
import { getExtraServices } from '@/api/booking'

const router = useRouter()
const bookingStore = useBookingStore()

// ── Dev mock ──────────────────────────────────────────────────────────────────
const roomTypeName = bookingStore.roomTypeName || 'Superior Garden View'
const roomCount = bookingStore.roomCount || 1
const checkIn = bookingStore.checkIn || '2025-10-19'
const checkOut = bookingStore.checkOut || '2025-10-21'
const guestCount = bookingStore.guests || 2

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

// ── Load extra services from API (with mock fallback) ─────────────────────────
onMounted(async () => {
  if (bookingStore.extraServices.length === 0) {
    bookingStore.extraServices = await getExtraServices()
  }
})

// ── Standard requests ─────────────────────────────────────────────────────────
const STANDARD_OPTIONS = [
  { key: 'early-checkin', label: 'Early check-in' },
  { key: 'late-checkout', label: 'Late check-out' },
  { key: 'non-smoking', label: 'Non-smoking room' },
  { key: 'high-floor', label: 'A room on the high floor' },
  { key: 'quiet-room', label: 'A quiet room' },
]

const toggleStandard = (key: string) => {
  const idx = bookingStore.standardRequests.indexOf(key)
  if (idx > -1) bookingStore.standardRequests.splice(idx, 1)
  else bookingStore.standardRequests.push(key)
}

// ── Extra services (special requests with price) ──────────────────────────────
const toggleExtra = (id: string) => {
  const idx = bookingStore.selectedExtraIds.indexOf(id)
  if (idx > -1) bookingStore.selectedExtraIds.splice(idx, 1)
  else bookingStore.selectedExtraIds.push(id)
}

// ── Summary computed ──────────────────────────────────────────────────────────
const selectedExtrasForSummary = computed(() => bookingStore.selectedExtras)

// ── Navigation ────────────────────────────────────────────────────────────────
const handleNext = () => {
  bookingStore.setExtras({
    selectedExtraIds: [...bookingStore.selectedExtraIds],
    standardRequests: [...bookingStore.standardRequests],
    additionalRequest: bookingStore.additionalRequest,
  })
  router.push('/payment-method')
}

const handleBack = () => {
  router.push('/payment-basic')
}
</script>

<template>
  <div class="mx-auto max-w-[1122px] flex flex-col lg:gap-10 lg:py-[80px]">
    <!-- ===== HEADER ===== -->
    <div class="flex flex-col gap-6 py-[24px] px-[16px] bg-[#f7f7fb] lg:gap-10 lg:p-0">
      <h1 class="headline-3 text-green-800 lg:headline-2">Booking Room</h1>

      <!-- STEP -->
      <div class="flex flex-col gap-4 lg:flex-row lg:gap-10 lg:pb-10 lg:border-b lg:border-gray-300">
        <!-- Step 1 (done) -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-orange-100 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-orange-500">1</span>
          </div>
          <span class="headline-5 text-gray-900">Basic Information</span>
        </div>
        <!-- Step 2 (active) -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-orange-500 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-white">2</span>
          </div>
          <span class="headline-5 text-orange-500">Special Request</span>
        </div>
        <!-- Step 3 -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-gray-200 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-gray-600">3</span>
          </div>
          <span class="headline-5 text-gray-600">Payment Method</span>
        </div>
      </div>
    </div>

    <!-- ===== MAIN ===== -->
    <div class="flex flex-col lg:flex-row lg:gap-6">
      <!-- ===== LEFT ===== -->
      <div class="grow bg-white border border-gray-300 rounded-sm py-6 px-4 flex flex-col gap-6 lg:p-10 lg:gap-10">

        <!-- STANDARD REQUEST -->
        <div class="flex flex-col gap-6 lg:gap-10">
          <div class="text-gray-600">
            <h2 class="headline-5 lg:text-gray-800">Standard Request</h2>
            <p class="body-2">These requests are not confirmed (Depend on the available room)</p>
          </div>
          <div class="flex flex-col gap-4 lg:gap-6">
            <label
              v-for="opt in STANDARD_OPTIONS"
              :key="opt.key"
              class="flex items-center gap-3 cursor-pointer group"
            >
              <input type="checkbox" class="sr-only" @change="toggleStandard(opt.key)" :checked="bookingStore.standardRequests.includes(opt.key)" />
              <div
                class="w-6 h-6 border rounded-sm flex items-center justify-center transition-colors"
                :class="bookingStore.standardRequests.includes(opt.key) ? 'bg-orange-500 border-orange-300' : 'bg-white border-gray-400 group-hover:border-orange-500'"
              >
                <Check v-if="bookingStore.standardRequests.includes(opt.key)" :size="16" class="text-white" />
              </div>
              <span
                class="body-1 transition-colors"
                :class="bookingStore.standardRequests.includes(opt.key) ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-orange-500'"
              >
                {{ opt.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- SPECIAL REQUEST (Extra services from API) -->
        <div class="flex flex-col gap-6 lg:gap-10">
          <div class="text-gray-600">
            <h2 class="headline-5 lg:text-gray-800">Special Request</h2>
            <p class="body-2">Additional charge may apply</p>
          </div>
          <div class="flex flex-col gap-4 lg:gap-6">
            <label
              v-for="service in bookingStore.extraServices"
              :key="service.id"
              class="flex items-center gap-3 cursor-pointer group"
            >
              <input type="checkbox" class="sr-only" @change="toggleExtra(service.id)" :checked="bookingStore.selectedExtraIds.includes(service.id)" />
              <div
                class="w-6 h-6 border rounded-sm flex items-center justify-center transition-colors"
                :class="bookingStore.selectedExtraIds.includes(service.id) ? 'bg-orange-500 border-orange-300' : 'bg-white border-gray-400 group-hover:border-orange-500'"
              >
                <Check v-if="bookingStore.selectedExtraIds.includes(service.id)" :size="16" class="text-white" />
              </div>
              <span
                class="body-1 transition-colors"
                :class="bookingStore.selectedExtraIds.includes(service.id) ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-orange-500'"
              >
                {{ service.name }} (+THB {{ service.price.toLocaleString() }})
              </span>
            </label>
          </div>
        </div>

        <!-- TEXTAREA -->
        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Additional Request</label>
          <textarea
            v-model="bookingStore.additionalRequest"
            class="border border-gray-400 rounded-sm p-3 pr-4 h-24 resize-none"
            placeholder="Enter your request"
          />
        </div>

        <!-- ACTION (DESKTOP) -->
        <div class="hidden lg:flex items-center justify-between">
          <Button variant="ghost" size="ghost" @click="handleBack">Back</Button>
          <Button variant="primary" @click="handleNext">Next</Button>
        </div>
      </div>

      <!-- ===== RIGHT: SUMMARY ===== -->
      <div class="flex flex-col gap-4 lg:max-w-[358px]">
        <div class="bg-green-700 text-white">
          <div class="bg-green-800 p-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <BriefcaseBusiness color="#81A08F" />
              <span class="headline-5">Booking Detail</span>
            </div>
          </div>

          <div class="py-[24px] px-[16px] flex flex-col gap-6 lg:p-6 lg:gap-10">
            <div class="flex flex-row items-stretch gap-[24px]">
              <div class="flex-1">
                <div class="body-1 font-semibold!">Check-in</div>
                <div class="body-1">After 2:00 PM</div>
              </div>
              <div class="flex-1">
                <div class="body-1 font-semibold!">Check-out</div>
                <div class="body-1">Before 12:00 PM</div>
              </div>
            </div>

            <div>
              <div class="body-1 py-1 flex flex-row gap-2">
                <span>{{ formatDate(checkIn) }}</span>
                <span>-</span>
                <span>{{ formatDate(checkOut) }}</span>
              </div>
              <div class="body-1 py-1">{{ guestCount }} Guest{{ guestCount > 1 ? 's' : '' }} · {{ roomCount }} Room{{ roomCount > 1 ? 's' : '' }}</div>
            </div>

            <div class="flex flex-col gap-4">
              <div>
                <div class="flex justify-between py-[12px]">
                  <span class="body-1 text-green-300">{{ roomTypeName }}</span>
                  <span class="body-1 font-semibold!">{{ bookingStore.roomSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div
                  v-for="extra in selectedExtrasForSummary"
                  :key="extra.id"
                  class="flex justify-between py-[12px]"
                >
                  <span class="body-1 text-green-300">{{ extra.name }}</span>
                  <span class="body-1 font-semibold!">{{ extra.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                </div>
              </div>

              <div class="border-t border-green-600 pt-6 flex items-center justify-between">
                <span class="body-1 text-green-300">Total</span>
                <span class="headline-5">THB {{ bookingStore.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTE -->
        <ul class="bg-gray-300 p-4 space-y-5">
          <li class="flex gap-2">
            <div class="mt-2 w-1 h-1 bg-green-600 rounded-full shrink-0"></div>
            <p class="body-3 text-green-600">Cancel booking will get full refund if the cancelation occurs before 24 hours of the check-in date.</p>
          </li>
          <li class="flex gap-2">
            <div class="mt-2 w-1 h-1 bg-green-600 rounded-full shrink-0"></div>
            <p class="body-3 text-green-600">Able to change check-in or check-out date booking within 24 hours of the booking date</p>
          </li>
        </ul>
      </div>

      <!-- ACTION (MOBILE) -->
      <div class="lg:hidden px-4 py-6 flex items-center justify-between">
        <Button variant="ghost" size="ghost" @click="handleBack">Back</Button>
        <Button variant="primary" @click="handleNext">Next</Button>
      </div>
    </div>
  </div>
</template>
