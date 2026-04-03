<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BookingHistoryCard from '@/components/BookingHistoryCard.vue'
import type { BookingItem } from '@/components/BookingHistoryCard.vue'

const router = useRouter()

// Helper: create ISO date string offset from now (in hours)
const offsetDate = (hours: number): string => {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000)
  return d.toISOString()
}

const formatDisplayDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Demo bookings covering all 4 annotation states:
//  #1 – booked just now, check-in in 7 days → within 24h of booking → CAN change date + cancel with refund
//  #2 – booked 2 days ago, check-in in 10 hours → after 24h of booking, within 24h of check-in → NO change date, cancel WITHOUT refund
//  #3 – booked 3 days ago, check-in in 5 days → after 24h of booking, NOT within 24h of check-in → NO change date, cancel WITH refund
//  #4 – cancelled booking (past)
//  #5 – completed booking (past, already checked-in) → all CTAs hidden
//  #6 – completed booking (past)
const bookings = ref<BookingItem[]>([
  {
    id: 1,
    roomName: 'Superior Garden View',
    roomImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
    bookingDate: formatDisplayDate(offsetDate(-2)),
    bookingDateISO: offsetDate(-2),
    checkIn: formatDisplayDate(offsetDate(7 * 24)) + '  |  After 2:00 PM',
    checkInISO: offsetDate(7 * 24),
    checkOut: formatDisplayDate(offsetDate(8 * 24)) + '  |  Before 12:00 PM',
    checkOutISO: offsetDate(8 * 24),
    guests: 2,
    nights: 1,
    paymentMethod: 'Credit Card',
    paymentLast4: '888',
    lineItems: [
      { label: 'Superior Garden View Room', amount: 2500.0 },
      { label: 'Airport transfer', amount: 200.0 },
      { label: 'Promotion Code', amount: -400.0 },
    ],
    total: 2300.0,
    additionalRequest: 'Can i have some chocolate?',
    status: 'active',
  },
  {
    id: 2,
    roomName: 'Superior Garden View',
    roomImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
    bookingDate: formatDisplayDate(offsetDate(-48)),
    bookingDateISO: offsetDate(-48),
    checkIn: formatDisplayDate(offsetDate(10)) + '  |  After 2:00 PM',
    checkInISO: offsetDate(10),
    checkOut: formatDisplayDate(offsetDate(34)) + '  |  Before 12:00 PM',
    checkOutISO: offsetDate(34),
    guests: 2,
    nights: 1,
    paymentMethod: 'Credit Card',
    paymentLast4: '888',
    lineItems: [
      { label: 'Superior Garden View Room', amount: 2500.0 },
      { label: 'Airport transfer', amount: 200.0 },
      { label: 'Promotion Code', amount: -400.0 },
    ],
    total: 2300.0,
    additionalRequest: 'Can i have some chocolate?',
    status: 'active',
  },
  {
    id: 3,
    roomName: 'Superior Garden View',
    roomImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
    bookingDate: formatDisplayDate(offsetDate(-72)),
    bookingDateISO: offsetDate(-72),
    checkIn: formatDisplayDate(offsetDate(5 * 24)) + '  |  After 2:00 PM',
    checkInISO: offsetDate(5 * 24),
    checkOut: formatDisplayDate(offsetDate(6 * 24)) + '  |  Before 12:00 PM',
    checkOutISO: offsetDate(6 * 24),
    guests: 2,
    nights: 1,
    paymentMethod: 'Credit Card',
    paymentLast4: '888',
    lineItems: [
      { label: 'Superior Garden View Room', amount: 2500.0 },
      { label: 'Airport transfer', amount: 200.0 },
      { label: 'Promotion Code', amount: -400.0 },
    ],
    total: 2300.0,
    status: 'active',
  },
  {
    id: 4,
    roomName: 'Deluxe',
    roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    bookingDate: 'Mon, 1 Aug 2022',
    bookingDateISO: '2022-08-01T10:00:00.000Z',
    checkIn: 'Sat, 6 Aug 2022  |  After 2:00 PM',
    checkInISO: '2022-08-06T07:00:00.000Z',
    checkOut: 'Mon, 8 Aug 2022  |  Before 12:00 PM',
    checkOutISO: '2022-08-08T05:00:00.000Z',
    guests: 2,
    nights: 2,
    paymentMethod: 'Credit Card',
    paymentLast4: '888',
    lineItems: [
      { label: 'Deluxe Room', amount: 3200.0 },
    ],
    total: 3200.0,
    status: 'cancelled',
    cancelDate: 'Tue, 2 Aug 2022',
  },
  {
    id: 5,
    roomName: 'Premier Sea View',
    roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    bookingDate: 'Mon, 1 Aug 2022',
    bookingDateISO: '2022-08-01T10:00:00.000Z',
    checkIn: 'Sat, 6 Aug 2022  |  After 2:00 PM',
    checkInISO: '2022-08-06T07:00:00.000Z',
    checkOut: 'Mon, 8 Aug 2022  |  Before 12:00 PM',
    checkOutISO: '2022-08-08T05:00:00.000Z',
    guests: 2,
    nights: 2,
    paymentMethod: 'Credit Card',
    paymentLast4: '888',
    lineItems: [
      { label: 'Premier Sea View Room', amount: 4500.0 },
    ],
    total: 4500.0,
    status: 'completed',
  },
  {
    id: 6,
    roomName: 'Deluxe',
    roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    bookingDate: 'Mon, 1 Aug 2022',
    bookingDateISO: '2022-08-01T10:00:00.000Z',
    cancelDate: 'Tue, 2 Aug 2022',
    checkIn: 'Sat, 6 Aug 2022  |  After 2:00 PM',
    checkInISO: '2022-08-06T07:00:00.000Z',
    checkOut: 'Mon, 8 Aug 2022  |  Before 12:00 PM',
    checkOutISO: '2022-08-08T05:00:00.000Z',
    guests: 2,
    nights: 2,
    paymentMethod: 'Credit Card',
    paymentLast4: '888',
    lineItems: [
      { label: 'Deluxe Room', amount: 3200.0 },
    ],
    total: 3200.0,
    status: 'completed',
  },
])

const handleCancelBooking = (id: number) => {
  router.push({ name: 'cancel-refund', params: { id } })
}

const handleRoomDetail = (id: number) => {
  console.log('View room detail:', id)
}

const handleChangeDate = (id: number) => {
  router.push({ name: 'booking-change-date', params: { id } })
}
</script>

<template>
  <div class="bg-bg min-h-screen">
    <!-- Title Section -->
    <div class="mx-auto w-full max-w-[1120px] px-4 pt-10 pb-6 md:px-0 md:pt-20 md:pb-0">
      <h1 class="booking-history-title text-[#2F3E35] md:text-[#465C50]">
        Booking History
      </h1>
    </div>

    <!-- Booking Cards -->
    <div class="mx-auto flex w-full max-w-[1120px] flex-col items-center px-0 md:px-0">
      <BookingHistoryCard
        v-for="booking in bookings"
        :key="booking.id"
        :booking="booking"
        @cancel-booking="handleCancelBooking"
        @room-detail="handleRoomDetail"
        @change-date="handleChangeDate"
      />
    </div>

    <!-- Pagination (PC only) -->
    <div class="mx-auto hidden w-full max-w-[1120px] items-center justify-center gap-2 py-10 md:flex">
      <button
        v-for="page in 6"
        :key="page"
        type="button"
        class="font-inter flex size-8 cursor-pointer items-center justify-center rounded text-sm transition-colors"
        :class="page === 1 ? 'bg-orange-600 font-semibold text-white' : 'text-gray-700 hover:bg-gray-200'"
      >
        {{ page }}
      </button>
      <button
        type="button"
        class="font-inter text-gray-700 hover:bg-gray-200 flex size-8 cursor-pointer items-center justify-center rounded text-sm transition-colors"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<style scoped>
.booking-history-title {
  font-family: var(--font-noto-serif);
  font-weight: 500;
  letter-spacing: -0.02em;
  font-size: 44px;
  line-height: 125%;
}

@media (min-width: 768px) {
  .booking-history-title {
    font-size: 68px;
    line-height: 125%;
  }
}
</style>
