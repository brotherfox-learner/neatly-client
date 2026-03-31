<script setup lang="ts">
import LandingChatFab from "@/components/landing/LandingChatFab.vue"
import LandingFooter from "@/components/landing/LandingFooter.vue"
import SearchResultRoomCard from "@/components/search/SearchResultRoomCard.vue"
import SearchResultsToolbar from "@/components/search/SearchResultsToolbar.vue"
import { searchResultMockRooms } from "@/data/searchResultMock"
</script>

<template>
  <div class="min-h-screen bg-bg">
    <SearchResultsToolbar />

    <!--
      Figma frame: 1440×1895 @ top 256 — mapped to fluid layout:
      max-width 1440px centered, content column 1120px; no position:absolute so the page scrolls.
    -->
    <section
      class="search-results-section relative mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 md:px-6 md:pb-20 md:pt-12 lg:px-10 xl:px-[160px]"
      aria-label="Available rooms"
    >
      <div class="mx-auto w-full max-w-[1120px]">
        <ul
          class="flex list-none flex-col divide-y divide-[#E4E6ED]"
          role="list"
        >
          <li
            v-for="room in searchResultMockRooms"
            :key="room.id"
            class="py-6 md:py-8 first:pt-0"
          >
            <SearchResultRoomCard :room="room" />
          </li>
        </ul>
      </div>
    </section>

    <LandingFooter />
    <LandingChatFab />
  </div>
</template>
