<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useBookingStore, calcServicePrice } from '@/stores/booking'
import type { ExtraService } from '@/stores/booking'

const router = useRouter()
const bookingStore = useBookingStore()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

const checkIn = bookingStore.checkIn || '2025-10-19'
const checkOut = bookingStore.checkOut || '2025-10-21'
const guestCount = bookingStore.guests || 2
const roomCount = bookingStore.roomCount || 1
const roomTypeName = bookingStore.roomTypeName || 'Superior Garden View'
const paymentMethod = bookingStore.paymentMethod

const serviceTotal = (extra: ExtraService) =>
  calcServicePrice(extra, bookingStore.totalNights, bookingStore.guests, bookingStore.roomCount)

const handleBackToHome = () => {
  bookingStore.reset()
  router.push('/')
}
</script>

<template>
  <div class="max-w-[738px] mx-auto bg-background flex flex-col min-h-screen lg:py-[80px]">
    <!-- ===== TOP (SUCCESS) ===== -->
    <div class="bg-green-800 text-white px-6 py-10 text-center flex flex-col gap-4">
      <h1 class="headline-3">Thank you for booking</h1>
      <p class="text-green-400 body-2 font-medium!">
        We are looking forward to hosting you at our place. We will send you more information about
        check-in and staying at our Neatly closer to your date of reservation
      </p>
      <p v-if="bookingStore.bookingId" class="text-green-300 body-3">
        Booking ID: {{ bookingStore.bookingId }}
      </p>
    </div>

    <!-- ===== CONTENT ===== -->
    <div class="bg-green-700 text-white flex-1 px-4 pt-6 pb-10 flex flex-col gap-6 lg:gap-10">
      <!-- CARD -->
      <div class="bg-green-600 rounded-sm p-4 flex flex-col gap-6 lg:p-6 lg:flex-row lg:gap-10">
        <div class="grow">
          <div class="body-1 py-1 flex flex-row gap-2">
            <span>{{ formatDate(checkIn) }}</span>
            <span>-</span>
            <span>{{ formatDate(checkOut) }}</span>
          </div>
          <div class="body-1 py-1">{{ guestCount }} Guest{{ guestCount > 1 ? 's' : '' }} · {{ roomCount }} Room{{ roomCount > 1 ? 's' : '' }}</div>
        </div>
        <div class="flex flex-row gap-[24px]">
          <div>
            <div class="body-1 font-semibold!">Check-in</div>
            <div class="body-1">After 2:00 PM</div>
          </div>
          <div>
            <div class="body-1 font-semibold!">Check-out</div>
            <div class="body-1">Before 12:00 PM</div>
          </div>
        </div>
      </div>

      <!-- PAYMENT METHOD -->
      <div class="flex gap-4 text-green-300 lg:self-end">
        <span>Payment success via</span>
        <span class="font-semibold">{{ paymentMethod === 'cash' ? 'Cash' : 'Credit Card' }}</span>
      </div>

      <!-- DETAIL -->
      <div class="flex flex-col">
        <div class="flex justify-between py-3">
          <span class="text-green-300">{{ roomTypeName }}</span>
          <span class="body-1 font-semibold!">{{ bookingStore.roomSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
        </div>

        <div v-for="extra in bookingStore.selectedExtras" :key="extra.id" class="flex justify-between py-3">
          <span class="text-green-300">{{ extra.name }}</span>
          <span class="body-1 font-semibold!">
            {{ extra.type?.toUpperCase() === 'FREE' ? '0.00' : serviceTotal(extra).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </span>
        </div>

        <div v-if="bookingStore.discountAmount > 0" class="flex justify-between py-3">
          <span class="text-green-300">Promo ({{ bookingStore.promoCode }})</span>
          <span class="body-1 font-semibold! text-orange-300">-{{ bookingStore.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
        </div>

        <!-- TOTAL -->
        <div class="border-t border-green-600 mt-4 pt-4 flex items-center justify-between lg:pt-[24px]">
          <span class="body-1 text-green-300">Total</span>
          <span class="headline-5">THB {{ bookingStore.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
        </div>
      </div>
    </div>

    <!-- ACTION (MOBILE) -->
    <div class="lg:hidden px-4 py-6 flex flex-col items-center justify-between gap-[24px]">
      <Button variant="primary" class="w-full" @click="handleBackToHome">Back to Home</Button>
      <Button variant="ghost" size="ghost">Check Booking Detail</Button>
    </div>
    <!-- ACTION (DESKTOP) -->
    <div class="hidden lg:flex items-center gap-[40px] mx-auto p-0 mt-[60px]">
      <Button variant="ghost" size="ghost">Check Booking Detail</Button>
      <Button variant="primary" @click="handleBackToHome">Back to Home</Button>
    </div>
  </div>
</template>
