<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const bookingId = ref(Number(route.params.id) || 1)

// Mock data – replace with API call using bookingId
const roomName = ref('Superior Garden View')
const roomImage = ref(
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
)
const bookingDate = ref('Tue, 16 Oct 2022')
const checkIn = ref('Th, 19 Oct 2022')
const checkOut = ref('Fri, 20 Oct 2022')
const guests = ref(2)
const totalRefund = ref(2300.0)

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const handleConfirmRefund = () => {
  console.log('Cancel and refund booking:', bookingId.value)
  // TODO: Call API to cancel & refund, then navigate back
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="bg-bg min-h-screen">
    <!-- Title Section -->
    <div class="mx-auto w-full max-w-[1120px] px-4 pt-10 pb-6 md:px-0 md:pt-20 md:pb-0">
      <h1 class="refund-title text-[#2F3E35] md:text-[#465C50]">
        Request a Refund
      </h1>
    </div>

    <!-- Room History Card -->
    <div
      class="mx-auto flex w-full max-w-[1120px] flex-col items-start"
    >
      <!-- Card content: vertical on mobile, horizontal on PC -->
      <div
        class="flex w-full flex-col items-start md:flex-row md:gap-12 md:py-10"
      >
        <!-- Room Image -->
        <img
          :src="roomImage"
          :alt="roomName"
          class="h-[221px] w-full rounded object-cover md:h-[210px] md:w-[357px] md:shrink-0"
        />

        <!-- Room Wrapper -->
        <div
          class="flex w-full flex-col gap-8 px-4 pt-4 pb-6 md:flex-1 md:px-0 md:pt-0 md:pb-6"
        >
          <!-- Room Name + Booking Date -->
          <div
            class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4"
          >
            <h3 class="headline-4 text-black">{{ roomName }}</h3>
            <p class="body-1 text-[#9AA1B9]">
              Booking date: {{ bookingDate }}
            </p>
          </div>

          <!-- Check-in/out + Guests  &  Total Refund -->
          <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-6">
            <!-- Left: dates & guests -->
            <div class="flex flex-col">
              <!-- Date row -->
              <div class="flex flex-row items-baseline gap-2 py-1">
                <span class="body-1 text-[#646D89]">{{ checkIn }}</span>
                <span class="body-1 text-[#646D89]">-</span>
                <span class="body-1 text-[#646D89]">{{ checkOut }}</span>
              </div>
              <!-- Guests -->
              <div class="flex flex-row items-baseline py-1">
                <span class="body-1 text-[#646D89]">{{ guests }} Guests</span>
              </div>
            </div>

            <!-- Right: Total Refund -->
            <div class="flex flex-col gap-1 md:items-end">
              <span class="body-1 text-[#2A2E3F]">Total Refund</span>
              <span class="headline-5 text-[#2A2E3F]">
                THB {{ formatCurrency(totalRefund) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Button Wrapper -->
      <!-- Mobile: stacked (confirm button full-width + cancel below), border-bottom on card area -->
      <!-- PC: row with cancel left, confirm right, separated by border-top -->
      <div
        class="flex w-full flex-col items-center gap-6 border-t border-[#E4E6ED] px-4 pt-6 pb-6 md:flex-row md:justify-between md:px-0 md:py-10"
      >
        <!-- Cancel (mobile: order-2 below, PC: order-1 left) -->
        <button
          type="button"
          class="font-open-sans order-2 cursor-pointer text-base font-semibold text-[#E76B39] transition-colors hover:text-orange-400 md:order-1"
          @click="handleCancel"
        >
          Cancel
        </button>

        <!-- Cancel and Refund this Booking (mobile: order-1 full-width, PC: order-2 right) -->
        <button
          type="button"
          class="font-open-sans order-1 w-full cursor-pointer rounded bg-[#C14817] px-8 py-4 text-center text-base font-semibold text-white transition-colors hover:bg-orange-500 active:bg-orange-700 md:order-2 md:w-auto"
          @click="handleConfirmRefund"
        >
          Cancel and Refund this Booking
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.refund-title {
  font-family: var(--font-noto-serif);
  font-weight: 500;
  letter-spacing: -0.02em;
  font-size: 44px;
  line-height: 125%;
}

@media (min-width: 768px) {
  .refund-title {
    font-size: 68px;
    line-height: 125%;
  }
}
</style>
