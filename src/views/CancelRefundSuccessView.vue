<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data – replace with actual booking data passed via route state or API
const roomName = ref('Superior Garden View')
const checkIn = ref('Th, 19 Oct 2022')
const checkOut = ref('Fri, 20 Oct 2022')
const guests = ref(2)
const bookingDate = ref('Tue, 16 Oct 2022')
const cancellationDate = ref('Tue, 16 Oct 2022')
const totalRefund = ref(2300.0)

const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="bg-bg flex min-h-screen flex-col items-center gap-10 md:py-20 md:gap-[60px]">
    <!-- Card -->
    <div class="w-full shadow-[4px_4px_16px_rgba(0,0,0,0.08)] md:max-w-[738px] md:rounded">
      <!-- Head: dark green -->
      <div class="flex flex-col items-center gap-3 bg-[#2F3E35] px-4 py-10 text-center md:px-6">
        <h1 class="success-title text-white">Your Request has been Submitted</h1>
        <p class="text-[14px] font-medium leading-[150%] tracking-[-0.02em] text-[#ABC0B4]">
          The cancellation is complete.<br />
          You will recieve an email with a detail and refund within 48 hours.
        </p>
      </div>

      <!-- Body: medium green -->
      <div class="flex flex-col gap-10 bg-[#465C50] px-4 pb-10 pt-6 md:px-10">
        <!-- Booking Detail Card: light green -->
        <div class="flex flex-col gap-10 rounded bg-[#5D7B6A] p-4 md:p-6">
          <!-- Room Info -->
          <div class="flex flex-col gap-4">
            <p class="text-[20px] font-semibold leading-[150%] tracking-[-0.02em] text-white">
              {{ roomName }}
            </p>
            <div class="flex flex-col">
              <div class="flex flex-row items-baseline gap-2 py-1">
                <span class="text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white">{{ checkIn }}</span>
                <span class="text-[16px] leading-[150%] tracking-[-0.02em] text-white"> - </span>
                <span class="text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white">{{ checkOut }}</span>
              </div>
              <div class="py-1">
                <span class="text-[16px] leading-[150%] tracking-[-0.02em] text-white">{{ guests }} Guests</span>
              </div>
            </div>
          </div>

          <!-- Meta: booking & cancellation date -->
          <div class="flex flex-col gap-2">
            <p class="text-[16px] leading-[150%] tracking-[-0.02em] text-[#D5DFDA]">
              Booking date: {{ bookingDate }}
            </p>
            <p class="text-[16px] leading-[150%] tracking-[-0.02em] text-[#D5DFDA]">
              Cancellation date: {{ cancellationDate }}
            </p>
          </div>
        </div>

        <!-- Total Refund Row -->
        <div class="flex flex-row items-baseline justify-between border-t border-[#5D7B6A] pt-6">
          <span class="text-[16px] leading-[150%] tracking-[-0.02em] text-[#D5DFDA]">Total Refund</span>
          <span class="text-[20px] font-semibold leading-[150%] tracking-[-0.02em] text-white">
            THB {{ formatCurrency(totalRefund) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Back to Home Button (outside card) -->
    <button
      type="button"
      class="font-open-sans cursor-pointer rounded bg-[#C14817] px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-500"
      @click="router.push({ name: 'home' })"
    >
      Back to Home
    </button>
  </div>
</template>

<style scoped>
.success-title {
  font-family: var(--font-noto-serif);
  font-weight: 500;
  font-size: 44px;
  line-height: 125%;
  letter-spacing: -0.02em;
}
</style>
