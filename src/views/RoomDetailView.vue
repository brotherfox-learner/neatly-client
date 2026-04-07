<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import LandingChatFab from "@/components/landing/LandingChatFab.vue"
import LandingFooter from "@/components/landing/LandingFooter.vue"
import OtherRoomsSection from "@/components/room/OtherRoomsSection.vue"
import RoomDetailLoading from "@/components/room/RoomDetailLoading.vue"
import RoomPhotoCarousel from "@/components/room/RoomPhotoCarousel.vue"
import type { Room } from "@/data/rooms"
import { formatPrice } from "@/data/rooms"
import { fetchOtherRoomTypesForCarousel, fetchRoomTypeDetail } from "@/lib/roomCatalog"
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"

const route = useRoute()

const room = ref<Room | null>(null)
const otherRooms = ref<Room[]>([])
const loading = ref(true)
const errorMessage = ref<string | null>(null)

const amenityColumns = computed(() => {
  if (!room.value) return [[], []]
  const list = room.value.amenities
  const mid = Math.ceil(list.length / 2)
  return [list.slice(0, mid), list.slice(mid)]
})

async function loadDetail() {
  errorMessage.value = null
  loading.value = true
  room.value = null
  otherRooms.value = []

  if (!isSupabaseConfigured()) {
    errorMessage.value =
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to load this room from Supabase."
    loading.value = false
    return
  }

  const supabase = getSupabase()
  if (!supabase) {
    loading.value = false
    return
  }

  const param = route.params.id as string
  try {
    const detail = await fetchRoomTypeDetail(supabase, param)
    if (!detail) {
      room.value = null
    } else {
      room.value = detail.room
      otherRooms.value = await fetchOtherRoomTypesForCarousel(supabase, detail.room.id)
    }
  } catch (e) {
    console.error(e)
    errorMessage.value = e instanceof Error ? e.message : "Could not load room."
    room.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    void loadDetail()
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-screen bg-white">
    <RoomDetailLoading v-if="loading" />

    <main v-else-if="errorMessage" class="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <p class="font-inter text-center text-[#646D89]">{{ errorMessage }}</p>
    </main>

    <main v-else-if="!room" class="flex min-h-[60vh] items-center justify-center">
      <p class="text-gray-500">Room not found.</p>
    </main>

    <main v-else>
      <section aria-label="Room photos">
        <RoomPhotoCarousel :images="room.images" />
      </section>

      <section
        class="mx-auto max-w-[1120px] px-4 pb-14 pt-10 md:pb-20 md:pt-14 lg:px-10 xl:px-[160px]"
        aria-labelledby="room-name-heading"
      >
        <div class="md:flex md:items-start md:justify-between md:gap-10">
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

            <div
              class="font-inter mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[#646D89] md:mb-0"
            >
              <span>{{ room.guests }} Person</span>
              <span class="text-[#D6D9E4]" aria-hidden="true">|</span>
              <span>{{ room.bedType }}</span>
              <span class="text-[#D6D9E4]" aria-hidden="true">|</span>
              <span v-if="room.sqm > 0">{{ room.sqm }} sqm</span>
              <span v-else>-</span>
            </div>
          </div>

          <div class="flex flex-col items-start md:items-end">
            <p class="font-inter mb-1 text-[14px] text-[#9AA0B9] line-through md:text-[16px]">
              THB {{ formatPrice(room.originalPrice) }}
            </p>

            <p
              class="font-inter mb-4 text-[24px] leading-tight font-semibold text-[#2f3e35] md:text-[28px]"
            >
              THB {{ formatPrice(room.currentPrice) }}
            </p>

            <button
              type="button"
              class="font-open-sans w-full rounded bg-[#C14817] px-8 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#a83e14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C14817] md:w-auto"
            >
              Book Now
            </button>
          </div>
        </div>

        <div class="mt-12 border-t border-[#E4E6ED] pt-10">
          <h2 class="font-inter mb-6 text-[18px] font-semibold text-[#2f3e35] md:text-[20px]">
            Room Amenities
          </h2>

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

      <OtherRoomsSection v-if="otherRooms.length > 0" :rooms="otherRooms" />
    </main>

    <LandingFooter />
    <LandingChatFab v-if="room && !loading" />
  </div>
</template>
