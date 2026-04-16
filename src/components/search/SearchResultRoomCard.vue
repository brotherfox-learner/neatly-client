<script setup lang="ts">
import { Images } from "lucide-vue-next"
import { RouterLink, useRouter, useRoute } from "vue-router"
import { formatPrice } from "@/data/rooms"
import type { SearchResultRoom } from "@/lib/roomCatalog"
import { useBookingStore } from "@/stores/booking"

const props = defineProps<{
  room: SearchResultRoom
}>()

const router = useRouter()
const route = useRoute()
const bookingStore = useBookingStore()

const handleBookNow = () => {
  const checkIn = typeof route.query.checkIn === "string" ? route.query.checkIn : ""
  const checkOut = typeof route.query.checkOut === "string" ? route.query.checkOut : ""
  const roomCount = Math.max(1, Number.parseInt(String(route.query.rooms ?? "1"), 10) || 1)
  const adults = Math.max(1, Number.parseInt(String(route.query.adults ?? "2"), 10) || 2)
  const children = Math.max(0, Number.parseInt(String(route.query.children ?? "0"), 10) || 0)

  bookingStore.setRoom({
    roomTypeId: props.room.id,
    roomTypeName: props.room.name,
    pricePerNight: props.room.currentPrice,
    roomImage: props.room.coverImage,
    checkIn,
    checkOut,
    guests: adults + children,
    roomCount,
  })
  bookingStore.startTimer()
  router.push("/payment-basic")
}
</script>

<template>
  <article
    class="search-result-card relative flex flex-col overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] md:min-h-[280px] md:max-w-[1120px] md:flex-row max-h-[320px]"
  >
    <div
      v-if="room.roomsLeft != null"
      class="pointer-events-none absolute top-3 right-3 z-10 max-w-[min(17.5rem,calc(100%-1.5rem))] md:top-4 md:right-4"
    >
      <span
        class="font-inter pointer-events-auto inline-flex w-full items-center justify-center rounded-full border border-[#C14817]/30 bg-white/95 px-3 py-1.5 text-center text-[11px] font-semibold leading-snug text-[#C14817] shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-sm md:px-3.5 md:py-2 md:text-[12px]"
        role="status"
      >
         Only {{ room.roomsLeft }} room remaining!
      </span>
    </div>

    <div
      class="relative h-[320px] w-full shrink-0 overflow-hidden md:min-h-[280px] md:w-[min(40.5%,453px)] md:max-w-[453px] md:self-stretch"
    >
      <img
        :src="room.coverImage"
        :alt="`${room.name} room`"
        class="absolute inset-0 size-full object-cover"
        width="453"
        height="400"
        loading="lazy"
        decoding="async"
      />
      <RouterLink
        :to="{ name: 'room-detail', params: { id: room.id } }"
        class="absolute bottom-4 left-4 flex size-11 items-center justify-center rounded bg-black/45 text-white backdrop-blur-[1px] transition-colors hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="View room photos"
      >
        <Images class="size-6" aria-hidden="true" :stroke-width="1.5" />
      </RouterLink>
    </div>

    <div
      class="flex min-h-0 min-w-0 flex-1 flex-col px-5 pb-6 pt-5 md:min-h-[280px] md:px-10 md:pb-8 md:pt-8 md:pl-10 md:pr-9"
    >
      <div
        class="flex min-w-0 flex-row items-start justify-between gap-4 md:gap-8"
      >
        <div class="min-w-0 flex-1 pr-2">
          <h2
            class="font-inter text-lg font-bold tracking-tight text-[#1a1d26] md:text-[22px] md:leading-snug"
          >
            {{ room.name }}
          </h2>
          <p
            class="font-inter mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#646D89] md:text-[14px]"
          >
            <span>{{ room.guests }} Guests</span>
            <span class="text-[#D6D9E4]" aria-hidden="true">|</span>
            <span>{{ room.bedLabel }}</span>
            <span class="text-[#D6D9E4]" aria-hidden="true">|</span>
            <span>{{ room.sqm }} sqm</span>
          </p>
          <p
            class="font-inter mt-4 max-w-[520px] text-[14px] leading-[1.65] text-[#646D89] md:mt-5 md:text-[15px]"
          >
            {{ room.description }}
          </p>
        </div>

        <div
          class="flex shrink-0 flex-col gap-0.5 self-start md:items-end md:text-right"
        >
          <p class="font-inter text-[14px] text-[#9AA1B9] line-through">
            THB {{ formatPrice(room.originalPrice) }}
          </p>
          <p
            class="font-inter text-[26px] font-bold leading-tight text-[#1a1d26] md:text-[28px]"
          >
            THB {{ formatPrice(room.currentPrice) }}
          </p>
          <p
            class="font-inter max-w-[16rem] text-[12px] leading-snug text-[#646D89] md:text-right md:text-[13px]"
          >
            Per Night<br />
            <span class="whitespace-normal">(Including Taxes &amp; Fees)</span>
          </p>
        </div>
      </div>

      <div
        class="mt-auto flex flex-wrap items-center justify-end gap-4 pt-8 md:gap-6 md:pt-10"
      >
        <RouterLink
          :to="{ name: 'room-detail', params: { id: room.id } }"
          class="font-open-sans text-[15px] font-semibold text-[#C14817] transition-colors hover:text-[#a83e14] md:text-[16px]"
        >
          Room Detail
        </RouterLink>
        <RouterLink
          :to="{ name: 'room-detail', params: { id: room.id } }"
          class="font-open-sans inline-flex h-12 min-w-[140px] items-center justify-center rounded-[4px] bg-[#C14817] px-8 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#a83e14] md:px-10 md:text-[16px]"
        >
          Book Now
        </RouterLink>
      </div>
    </div>
  </article>
</template>
