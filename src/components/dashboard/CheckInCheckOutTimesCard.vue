<script setup lang="ts">
import HotelIcon from '@/assets/icons/hotel.svg'
import CheckIcon from '@/assets/icons/check.svg'
import RightDirectionIcon from '@/assets/icons/direction-right.svg'

defineProps<{
  data: {
    checkIn: { label: string; time: string; description: string }
    checkOut: { label: string; time: string; description: string }
  } | null
  loading: boolean
}>()
</script>

<template>
  <article class="flex flex-col gap-[24px]" aria-labelledby="checkin-checkout-averages-title">
    <h5 class="headline-5 text-gray-600">Check-in and Check-out Times Averages</h5>

    <!-- Skeleton -->
    <div v-if="loading" class="grid gap-3" aria-busy="true" aria-label="Loading check-in and check-out averages">
      <section
        v-for="i in 2" :key="i"
        class="flex items-center justify-between rounded-[16px] px-4 py-3 bg-gray-50"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200" />
          <div class="flex flex-col gap-1">
            <div class="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div class="h-3 w-40 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div class="h-6 w-16 rounded bg-gray-200 animate-pulse" />
      </section>
    </div>

    <!-- Real data -->
    <div v-else class="grid gap-[16px] lg:grid-cols-2">

      <!-- Check-in -->
      <section class="flex items-center justify-between rounded-[16px] px-[12px] lg:px-[24px] py-[16px] bg-green-100">
        <div class="flex items-center w-full gap-3">
          <div class="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-green-300 text-green-600 shrink-0 relative">
            <HotelIcon />
            <div class="flex h-[19px] w-[19px] absolute justify-center items-center rounded-full bg-green-600 text-white shrink-0 right-[8px] bottom-[8px]">
              <CheckIcon :width="10" :height="7" />
            </div>
          </div>
          <div class="flex flex-col w-full gap-0.5">
            <div class="flex flex-row justify-between">
              <p class="headline-5 text-green-600">Check-in</p>
              <p class="headline-5 text-green-600">{{ data?.checkIn?.time ?? '--:--' }}</p>
            </div>
            <p class="body-3 text-green-500">Check-in time from 2:00 PM onwards</p>
          </div>
        </div>
      </section>

      <!-- Check-out -->
      <section class="flex items-center justify-between rounded-[16px] px-[12px] lg:px-[24px] py-[16px] bg-orange-100">
        <div class="flex items-center w-full gap-3">
          <div class="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-orange-200 text-orange-500 shrink-0 relative">
            <HotelIcon/>
            <div class="flex h-[19px] w-[19px] absolute justify-center items-center rounded-full bg-orange-500 text-white shrink-0 right-[8px] bottom-[8px]">
              <RightDirectionIcon :width="11" :height="10" />
            </div>
          </div>
          <div class="flex flex-col w-full gap-0.5">
            <div class="flex flex-row justify-between">
              <p class="headline-5 text-orange-500">Check-out</p>
              <p class="headline-5 text-orange-500">{{ data?.checkOut?.time ?? '--:--' }}</p>
            </div>
            <p class="body-3 text-orange-400">Check-out time by 12:00 PM</p>
          </div>
        </div>
      </section>

    </div>
  </article>
</template>