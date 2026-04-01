<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import LandingChatFab from "@/components/landing/LandingChatFab.vue"
import LandingFooter from "@/components/landing/LandingFooter.vue"
import RoomPhotoCarousel from "@/components/room/RoomPhotoCarousel.vue"
import OtherRoomsSection from "@/components/room/OtherRoomsSection.vue"
import { formatPrice, getOtherRooms, getRoomById } from "@/data/rooms"

const route = useRoute()
const room = computed(() => getRoomById(route.params.id as string))
const otherRooms = computed(() =>
  room.value ? getOtherRooms(room.value.id) : [],
)

/**
 * Split amenities into two roughly equal columns for the desktop grid.
 */
const amenityColumns = computed(() => {
  if (!room.value) return [[], []]
  const list = room.value.amenities
  const mid = Math.ceil(list.length / 2)
  return [list.slice(0, mid), list.slice(mid)]
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- ── 404 fallback ── -->
    <main v-if="!room" class="flex min-h-[60vh] items-center justify-center">
      <p class="text-gray-500">Room not found.</p>
    </main>

    <main v-else>
      <!-- ── Photo carousel ── -->
      <section aria-label="Room photos">
        <RoomPhotoCarousel :images="room.images" />
      </section>

      <!-- ── Room info ── -->
      <section
        class="mx-auto max-w-[1120px] px-4 pt-10 pb-14 md:pt-14 md:pb-20 lg:px-10 xl:px-[160px]"
        aria-labelledby="room-name-heading"
      >
        <div class="md:flex md:items-start md:justify-between md:gap-10">
          <!-- Left: title + description + specs -->
          <div class="md:max-w-[55%] lg:max-w-[60%]">
            <h1
              id="room-name-heading"
              class="landing-serif-h2 mb-4 text-[#2f3e35] md:text-[3rem] md:leading-[1.1]"
            >
              {{ room.name }}
            </h1>

            <p class="font-inter mb-6 text-[14px] leading-relaxed text-[#646D89] md:text-[16px]">
              {{ room.shortDescription }}
            </p>

            <!-- Specs bar -->
            <div
              class="font-inter mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[#646D89] md:mb-0"
            >
              <span>{{ room.guests }} Person</span>
              <span class="text-[#D6D9E4]" aria-hidden="true">|</span>
              <span>{{ room.bedType }}</span>
              <span class="text-[#D6D9E4]" aria-hidden="true">|</span>
              <span>{{ room.sqm }} sqm</span>
            </div>
          </div>

          <!-- Right: price + book now -->
          <div class="flex flex-col items-start md:items-end">
            <!-- Original price -->
            <p class="font-inter mb-1 text-[14px] text-[#9AA0B9] line-through md:text-[16px]">
              THB {{ formatPrice(room.originalPrice) }}
            </p>

            <!-- Current price -->
            <p
              class="font-inter mb-4 text-[24px] leading-tight font-semibold text-[#2f3e35] md:text-[28px]"
            >
              THB {{ formatPrice(room.currentPrice) }}
            </p>

            <!-- Book Now -->
            <button
              type="button"
              class="font-open-sans w-full rounded bg-[#C14817] px-8 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#a83e14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C14817] md:w-auto"
            >
              Book Now
            </button>
          </div>
        </div>

        <!-- ── Room Amenities ── -->
        <div class="mt-12 border-t border-[#E4E6ED] pt-10">
          <h2 class="font-inter mb-6 text-[18px] font-semibold text-[#2f3e35] md:text-[20px]">
            Room Amenities
          </h2>

          <!-- Mobile: single column -->
          <ul class="font-inter space-y-3 text-[14px] text-[#2f3e35] md:hidden">
            <li
              v-for="amenity in room.amenities"
              :key="amenity"
              class="flex items-start gap-2"
            >
              <span
                class="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#C14817]"
                aria-hidden="true"
              />
              {{ amenity }}
            </li>
          </ul>

          <!-- Desktop: two columns -->
          <div class="hidden md:grid md:grid-cols-2 md:gap-x-16 md:gap-y-3">
            <ul
              v-for="(col, ci) in amenityColumns"
              :key="ci"
              class="font-inter space-y-3 text-[14px] text-[#2f3e35]"
            >
              <li
                v-for="amenity in col"
                :key="amenity"
                class="flex items-start gap-2"
              >
                <span
                  class="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#C14817]"
                  aria-hidden="true"
                />
                {{ amenity }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ── Other Rooms ── -->
      <OtherRoomsSection :rooms="otherRooms" />
    </main>

    <LandingFooter />
    <LandingChatFab v-if="room" />
  </div>
</template>
