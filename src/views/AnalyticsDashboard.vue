<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import DashboardTopCard from '@/components/dashboard/DashboardTopCard.vue'
import RoomAvailabilityCard from '@/components/dashboard/RoomAvailabilityCard.vue'
import BookingTrendsByDayCard from '@/components/dashboard/BookingTrendsByDayCard.vue'
import RevenueTrendCard from '@/components/dashboard/RevenueTrendCard.vue'

import CartIcon from '@/assets/icons/cart.svg?component'
import BookingIcon from '@/assets/icons/booking.svg?component'
import SiteIcon from '@/assets/icons/site.svg?component'
import WalletIcon from '@/assets/icons/wallet.svg?component'

// ── Top Cards ──────────────────────────────────────────────────
const dashboardStats = [
  {
    key: 'totalBooking',
    label: 'Total Booking',
    value: 76,
    percentChange: 52,
    trend: 'up',
    type: 'number',
  },
  {
    key: 'totalSales',
    label: 'Total Sales',
    value: 58829,
    percentChange: 17.7,
    trend: 'up',
    type: 'currency',
    currency: 'THB',
  },
  {
    key: 'totalBookingUsers',
    label: 'Total Booking Users',
    value: 66,
    percentChange: -2.9,
    trend: 'down',
    type: 'number',
  },
  {
    key: 'totalSiteVisitors',
    label: 'Total site visitors',
    value: 459,
    percentChange: 8.5,
    trend: 'up',
    type: 'number',
  },
]

const iconMap = {
  totalBooking: CartIcon,
  totalSales: WalletIcon,
  totalBookingUsers: BookingIcon,
  totalSiteVisitors: SiteIcon,
}

// ── Room Availability ──────────────────────────────────────────
const roomPeriod = ref('month')

const roomMockData = {
  month: [
    {
      id: 'occupied',
      label: 'Occupied',
      count: 12,
      percent: 40,
      color: 'bg-orange-500',
      strokeColor: '#e76b39',
    },
    {
      id: 'booked',
      label: 'Booked',
      count: 8,
      percent: 27,
      color: 'bg-green-700',
      strokeColor: '#465c50',
    },
    {
      id: 'available',
      label: 'Available',
      count: 10,
      percent: 33,
      color: 'bg-gray-500',
      strokeColor: '#c8ccdb',
    },
  ],
  week: [
    {
      id: 'occupied',
      label: 'Occupied',
      count: 15,
      percent: 50,
      color: 'bg-orange-500',
      strokeColor: '#e76b39',
    },
    {
      id: 'booked',
      label: 'Booked',
      count: 6,
      percent: 20,
      color: 'bg-green-700',
      strokeColor: '#465c50',
    },
    {
      id: 'available',
      label: 'Available',
      count: 9,
      percent: 30,
      color: 'bg-gray-500',
      strokeColor: '#c8ccdb',
    },
  ],
  day: [
    {
      id: 'occupied',
      label: 'Occupied',
      count: 20,
      percent: 67,
      color: 'bg-orange-500',
      strokeColor: '#e76b39',
    },
    {
      id: 'booked',
      label: 'Booked',
      count: 4,
      percent: 13,
      color: 'bg-green-700',
      strokeColor: '#465c50',
    },
    {
      id: 'available',
      label: 'Available',
      count: 6,
      percent: 20,
      color: 'bg-gray-500',
      strokeColor: '#c8ccdb',
    },
  ],
}

const roomData = ref(roomMockData['month'])
const roomLoading = ref(false)

function onRoomPeriodChange(val) {
  roomLoading.value = true
  roomPeriod.value = val
  setTimeout(() => {
    roomData.value = roomMockData[val]
    roomLoading.value = false
  }, 500) // simulate loading
}

// ── Booking Trends ─────────────────────────────────────────────
const bookingPeriod = ref('month')
const bookingUseLive = ref(false)

const bookingMockData = {
  month: [
    { day: 'Sun', percent: 45, sampleCount: 4 },
    { day: 'Mon', percent: 60, sampleCount: 4 },
    { day: 'Tue', percent: 55, sampleCount: 4 },
    { day: 'Wed', percent: 70, sampleCount: 4 },
    { day: 'Thu', percent: 65, sampleCount: 4 },
    { day: 'Fri', percent: 85, sampleCount: 4 },
    { day: 'Sat', percent: 90, sampleCount: 4 },
  ],
  last_month: [
    { day: 'Sun', percent: 30, sampleCount: 4 },
    { day: 'Mon', percent: 50, sampleCount: 4 },
    { day: 'Tue', percent: 45, sampleCount: 4 },
    { day: 'Wed', percent: 60, sampleCount: 4 },
    { day: 'Thu', percent: 55, sampleCount: 4 },
    { day: 'Fri', percent: 75, sampleCount: 4 },
    { day: 'Sat', percent: 80, sampleCount: 4 },
  ],
  last_2_month: [
    { day: 'Sun', percent: 20, sampleCount: 8 },
    { day: 'Mon', percent: 40, sampleCount: 8 },
    { day: 'Tue', percent: 35, sampleCount: 8 },
    { day: 'Wed', percent: 50, sampleCount: 8 },
    { day: 'Thu', percent: 45, sampleCount: 8 },
    { day: 'Fri', percent: 65, sampleCount: 8 },
    { day: 'Sat', percent: 70, sampleCount: 8 },
  ],
}

const bookingData = ref(bookingMockData['month'])
const bookingLoading = ref(false)

function onBookingPeriodChange(val) {
  bookingLoading.value = true
  bookingPeriod.value = val
  setTimeout(() => {
    bookingData.value = bookingMockData[val]
    bookingLoading.value = false
  }, 500)
}

// ── Revenue Trend ──────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const revenueDateFrom = ref(new Date(currentYear, 0, 1))
const revenueDateTo = ref(new Date())
const revenueMode = ref('booking_date')
const revenueGranularity = ref('month')
const revenueUseLive = ref(false)

const revenueData = ref([
  { label: `${currentYear}-01-01`, revenue: 38000 },
  { label: `${currentYear}-02-01`, revenue: 52000 },
  { label: `${currentYear}-03-01`, revenue: 47000 },
  { label: `${currentYear}-04-01`, revenue: 61000 },
  { label: `${currentYear}-05-01`, revenue: 55000 },
  { label: `${currentYear}-06-01`, revenue: 72000 },
])
const revenueLoading = ref(false)

// ── CSS scroll class ───────────────────────────────────────────
onMounted(() => {
  document.documentElement.classList.add('allow-x-scroll')
  document.body.classList.add('allow-x-scroll')
})
onUnmounted(() => {
  document.documentElement.classList.remove('allow-x-scroll')
  document.body.classList.remove('allow-x-scroll')
})
</script>

<template>
  <div class="flex flex-col lg:flex-row">
    <div class="lg:flex lg:flex-col lg:w-full">
      <header
        class="flex h-[80px] bg-white border-b border-gray-300 px-[16px] lg:px-[60px] lg:py-[16px] items-center"
      >
        <h5 class="headline-5 text-gray-900">Analytics Dashboard</h5>
      </header>

      <main class="flex flex-col bg-gray-100 gap-[24px] lg:px-[60px] lg:py-[40px] pb-[119px]">
        <!-- Top Cards -->
        <section class="grid grid-cols-1 lg:grid-cols-4 p-[16px] lg:p-0 gap-[16px] lg:gap-[8px]">
          <DashboardTopCard
            v-for="stat in dashboardStats"
            :key="stat.key"
            v-bind="stat"
            :icon="iconMap[stat.key]"
          />
        </section>

        <!-- Room Availability + Booking Trends -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-[24px] lg:gap-[8px]">
          <section
            class="rounded-[8px] border border-gray-300 p-[16px] lg:py-[24px] lg:px-[40px] bg-white"
          >
            <RoomAvailabilityCard
              :period-id="roomPeriod"
              :data="roomData"
              :loading="roomLoading"
              @period-change="onRoomPeriodChange"
            />
          </section>

          <section
            class="rounded-[8px] border border-gray-300 p-[16px] lg:py-[24px] lg:px-[40px] bg-white"
          >
            <BookingTrendsByDayCard
              :period-id="bookingPeriod"
              :data="bookingData"
              :loading="bookingLoading"
              :use-live="bookingUseLive"
              @period-change="onBookingPeriodChange"
              @toggle-live="bookingUseLive = !bookingUseLive"
            />
          </section>
        </div>
        <section class="rounded-[8px] border border-gray-300 p-[16px] bg-white lg:pt-[32px] lg:pb-[50px] lg:px-[40px]">
          <RevenueTrendCard
            :date-from="revenueDateFrom"
            :date-to="revenueDateTo"
            :mode="revenueMode"
            :granularity="revenueGranularity"
            :data="revenueData"
            :loading="revenueLoading"
            :use-live="revenueUseLive"
            @date-from-change="revenueDateFrom = $event"
            @date-to-change="revenueDateTo = $event"
            @mode-change="revenueMode = $event"
            @granularity-change="revenueGranularity = $event"
            @toggle-live="revenueUseLive = !revenueUseLive"
          />
        </section>
      </main>
    </div>
  </div>
</template>
