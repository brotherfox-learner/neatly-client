<script setup lang="ts">
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import LandingFooter from "@/components/landing/LandingFooter.vue"
import SearchResultRoomCard from "@/components/search/SearchResultRoomCard.vue"
import SearchResultsLoading from "@/components/search/SearchResultsLoading.vue"
import SearchResultsToolbar from "@/components/search/SearchResultsToolbar.vue"
import { addDaysIsoLocal, todayIsoLocal } from "@/lib/dateIsoLocal"
import { fetchSearchResultRooms, type SearchResultRoom } from "@/lib/roomCatalog"
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"

const route = useRoute()

const rooms = ref<SearchResultRoom[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

function parseSearchQuery() {
  const q = route.query
  const defIn = todayIsoLocal()
  const defOut = addDaysIsoLocal(defIn, 1)
  const checkIn = typeof q.checkIn === "string" && q.checkIn ? q.checkIn : defIn
  const checkOut = typeof q.checkOut === "string" && q.checkOut ? q.checkOut : defOut
  const roomCount = Math.min(9, Math.max(1, Number.parseInt(String(q.rooms ?? "1"), 10) || 1))
  const adults = Math.min(30, Math.max(1, Number.parseInt(String(q.adults ?? "2"), 10) || 2))
  const children = Math.min(10, Math.max(0, Number.parseInt(String(q.children ?? "0"), 10) || 0))
  return { checkIn, checkOut, roomCount, adults, children }
}

async function loadRooms() {
  errorMessage.value = null
  if (!isSupabaseConfigured()) {
    errorMessage.value =
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to load rooms from Supabase."
    rooms.value = []
    return
  }
  const supabase = getSupabase()
  if (!supabase) {
    rooms.value = []
    return
  }
  const p = parseSearchQuery()
  loading.value = true
  try {
    rooms.value = await fetchSearchResultRooms(supabase, {
      checkIn: p.checkIn,
      checkOut: p.checkOut,
      roomCount: p.roomCount,
      adults: p.adults,
      children: p.children,
    })
  } catch (e) {
    console.error(e)
    errorMessage.value = e instanceof Error ? e.message : "Could not load rooms."
    rooms.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => route.query,
  () => {
    if (route.name === "search") void loadRooms()
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div class="min-h-screen bg-bg">
    <SearchResultsToolbar />

    <section
      class="search-results-section relative mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 md:px-6 md:pb-20 md:pt-12 lg:px-10 xl:px-[160px]"
      aria-label="Available rooms"
      :aria-busy="loading"
    >
      <div class="mx-auto w-full max-w-[1120px]">
        <p
          v-if="errorMessage"
          class="font-inter rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <SearchResultsLoading v-else-if="loading" />

        <p
          v-else-if="rooms.length === 0"
          class="font-inter py-10 text-center text-[15px] text-[#646D89]"
        >
          No rooms match your dates and guest count. Try different dates or fewer rooms.
        </p>

        <ul
          v-else
          class="flex list-none flex-col divide-y divide-[#E4E6ED]"
          role="list"
        >
          <li
            v-for="room in rooms"
            :key="room.id"
            class="py-6 md:py-8 first:pt-0"
          >
            <SearchResultRoomCard :room="room" />
          </li>
        </ul>
      </div>
    </section>

    <LandingFooter />
  </div>
</template>
