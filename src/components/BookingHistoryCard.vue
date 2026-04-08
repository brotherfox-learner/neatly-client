<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronUp, ChevronDown } from 'lucide-vue-next'

export interface BookingItem {
  id: number
  roomName: string
  roomImage: string
  bookingDate: string
  bookingDateISO: string
  cancelDate?: string
  checkIn: string
  checkInISO: string
  checkOut: string
  checkOutISO: string
  guests: number
  nights: number
  paymentMethod: string
  paymentLast4: string
  lineItems: { label: string; amount: number }[]
  total: number
  additionalRequest?: string
  status: 'active' | 'cancelled' | 'completed'
}

const props = defineProps<{
  booking: BookingItem
}>()

defineEmits<{
  cancelBooking: [id: number, canRefund: boolean]
  roomDetail: [id: number]
  changeDate: [id: number]
}>()

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

const now = computed(() => Date.now())

const hasCheckedIn = computed(() => {
  return new Date(props.booking.checkInISO).getTime() <= now.value
})

const isWithin24hOfBooking = computed(() => {
  const booked = new Date(props.booking.bookingDateISO).getTime()
  return now.value - booked < TWENTY_FOUR_HOURS
})

const isWithin24hOfCheckIn = computed(() => {
  const checkIn = new Date(props.booking.checkInISO).getTime()
  return checkIn - now.value < TWENTY_FOUR_HOURS && checkIn - now.value >= 0
})

const isActive = computed(() => props.booking.status === 'active')

const canChangeDate = computed(
  () => isActive.value && !hasCheckedIn.value && isWithin24hOfBooking.value,
)

const canCancel = computed(
  () => isActive.value && !hasCheckedIn.value,
)

const canRefund = computed(
  () => canCancel.value && !isWithin24hOfCheckIn.value,
)

const showCTAs = computed(
  () => isActive.value && !hasCheckedIn.value && isExpanded.value,
)

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<template>
  <article class="border-gray-300 flex w-full flex-col items-start border-b pb-6 md:py-10">
    <!-- Card content wrapper: vertical on mobile, horizontal on PC -->
    <div class="flex w-full flex-col items-start md:flex-row md:gap-12">
      <!-- Room Image -->
      <img
        :src="booking.roomImage"
        :alt="booking.roomName"
        class="h-[221px] w-full rounded object-cover md:h-[210px] md:w-[357px] md:shrink-0"
      />

      <!-- Room Wrapper -->
      <div class="flex w-full flex-col gap-6 px-4 pt-4 pb-0 md:flex-1 md:gap-8 md:px-0 md:pt-0 md:pb-6">
        <!-- Main Detail -->
        <div class="flex flex-col gap-6">
          <!-- Room name + booking date row -->
          <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4">
            <h3 class="headline-4 text-black">{{ booking.roomName }}</h3>
            <div class="flex flex-col items-start md:items-end">
              <p class="body-1 text-gray-600">
                Booking date: {{ booking.bookingDate }}
              </p>
              <p v-if="booking.cancelDate" class="body-1 text-gray-600">
                Cancellation date: {{ booking.cancelDate }}
              </p>
            </div>
          </div>

          <!-- Check-in / Check-out -->
          <div class="flex flex-col gap-4 md:flex-row md:gap-10">
            <div class="flex flex-col gap-1">
              <span class="body-1 font-semibold text-[#424C6B]">Check-in</span>
              <span class="body-1 text-[#424C6B]">{{ booking.checkIn }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="body-1 font-semibold text-[#424C6B]">Check-out</span>
              <span class="body-1 text-[#424C6B]">{{ booking.checkOut }}</span>
            </div>
          </div>
        </div>

        <!-- Booking Detail Accordion -->
        <div class="w-full overflow-hidden rounded bg-[#F1F2F6]">
          <!-- Accordion Header -->
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between px-4 py-4 md:px-6"
            @click="toggleExpand"
          >
            <span class="font-open-sans text-[#2A2E3F] text-base font-semibold">
              Booking Detail
            </span>
            <ChevronUp v-if="isExpanded" class="size-6 text-[#2A2E3F]" />
            <ChevronDown v-else class="size-6 text-[#E76B39]" />
          </button>

          <!-- Accordion Content -->
          <div v-if="isExpanded" class="flex flex-col">
            <!-- Detail section -->
            <div class="flex flex-col px-4 pb-4 md:px-6 md:pb-6">
              <!-- Guests & Payment info -->
              <div class="flex flex-col gap-0 border-b border-[#D6D9E4] pb-6 md:flex-row md:items-start md:justify-between">
                <div class="flex items-center gap-2">
                  <span class="body-1 text-[#646D89]">{{ booking.guests }} Guests</span>
                  <span class="body-1 text-[#646D89]">({{ booking.nights }} Night{{ booking.nights > 1 ? 's' : '' }})</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="body-1 text-[#646D89]">Payment success via</span>
                  <span class="body-1 font-semibold text-[#646D89]">{{ booking.paymentMethod }} - *{{ booking.paymentLast4 }}</span>
                </div>
              </div>

              <!-- Line items -->
              <div class="flex flex-col">
                <div
                  v-for="(item, index) in booking.lineItems"
                  :key="index"
                  class="flex items-baseline justify-between gap-3 py-2"
                >
                  <span class="body-1 text-[#646D89]">{{ item.label }}</span>
                  <span class="body-1 text-right font-semibold text-[#2A2E3F]">
                    {{ formatCurrency(item.amount) }}
                  </span>
                </div>
              </div>

              <!-- Total -->
              <div class="flex items-baseline justify-between border-t border-[#D6D9E4] pt-4">
                <span class="body-1 text-[#646D89]">Total</span>
                <span class="headline-5 text-[#2A2E3F]">
                  THB {{ formatCurrency(booking.total) }}
                </span>
              </div>
            </div>

            <!-- Additional Request -->
            <div v-if="booking.additionalRequest" class="flex flex-col gap-2 bg-[#E4E6ED] px-4 py-4 md:px-6">
              <span class="body-1 font-semibold text-[#646D89]">Additional Request</span>
              <span class="body-1 text-[#646D89]">{{ booking.additionalRequest }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons (only visible after expanding Booking Detail) -->
    <div v-if="showCTAs" class="mt-6 flex w-full items-center justify-between px-4 md:mt-0 md:px-0">
      <!-- Cancel Booking (left) -->
      <button
        v-if="canCancel"
        type="button"
        class="font-open-sans cursor-pointer text-base font-semibold text-[#E76B39] transition-colors hover:text-orange-400"
        @click="$emit('cancelBooking', booking.id, canRefund)"
      >
        {{ canRefund ? 'Cancel Booking' : 'Cancel Booking (No Refund)' }}
      </button>
      <span v-else />

      <!-- Right side buttons -->
      <div class="flex items-center gap-6">
        <button
          type="button"
          class="font-open-sans cursor-pointer text-base font-semibold text-[#E76B39] transition-colors hover:text-orange-400"
          @click="$emit('roomDetail', booking.id)"
        >
          Room Detail
        </button>

        <button
          v-if="canChangeDate"
          type="button"
          class="font-open-sans cursor-pointer rounded bg-[#C14817] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-orange-500 active:bg-orange-700"
          @click="$emit('changeDate', booking.id)"
        >
          Change Date
        </button>
      </div>
    </div>
  </article>
</template>
