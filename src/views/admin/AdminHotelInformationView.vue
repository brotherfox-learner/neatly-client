<script setup lang="ts">
import { ref } from "vue"
import { X } from "lucide-vue-next"

const hotelName = ref("Neatly Hotel")
const hotelDescription = ref(
  "Set in Bangkok, Thailand. Neatly Hotel offers 5-star accommodation with an outdoor pool, kids' club, sports facilities and a fitness centre. There is also a spa, an indoor pool and saunas.\n\nAll units at the hotel are equipped with a seating area, a flat-screen TV with satellite channels, a dining area and a private bathroom with free toiletries, a bathtub and a hairdryer. Every room in Neatly Hotel features a furnished balcony. Some rooms are equipped with a coffee machine.\n\nFree WiFi and entertainment facilities are available at property and also rentals are provided to explore the area.",
)

const hotelLogoPreviewUrl = ref("/logo.svg")
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col bg-[#F6F7FC]">
    <header
      class="box-border flex h-20 w-full shrink-0 flex-row items-center gap-4 border-b border-[#E4E6ED] bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="min-w-0 flex-1 text-[#2A2E3F] font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em]">
        Hotel Information
      </h1>

      <button
        type="submit"
        form="hotel-information-form"
        class="h-12 w-[121px] rounded-[4px] bg-[#C14817] font-[Open Sans] text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-[#8B3210]"
        aria-label="Update hotel information"
      >
        Update
      </button>
    </header>

    <main class="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
      <article class="w-full rounded-[4px] border border-[#E4E6ED] bg-white p-8">
        <form id="hotel-information-form" class="flex w-full flex-col gap-8" @submit.prevent>
          <section class="flex w-full flex-col gap-2.5">
            <label class="text-sm font-medium text-[#424C6B]" for="hotel-name">
              Hotel name *
            </label>
            <input
              id="hotel-name"
              v-model="hotelName"
              type="text"
              class="h-12 w-full rounded-[4px] border border-[#D6D9E4] bg-white px-4 text-sm outline-none focus:border-[#9AA1B9]"
            />
          </section>

          <section class="flex w-full flex-col gap-2.5">
            <label class="text-sm font-medium text-[#424C6B]" for="hotel-description">
              Hotel description *
            </label>
            <textarea
              id="hotel-description"
              v-model="hotelDescription"
              class="min-h-[160px] w-full resize-none rounded-[4px] border border-[#D6D9E4] bg-white px-4 py-3 text-sm outline-none focus:border-[#9AA1B9]"
            />
          </section>

          <section class="flex w-full flex-col gap-3">
            <label class="text-sm font-medium text-[#424C6B]" for="hotel-logo">
              Hotel logo *
            </label>

            <div class="flex items-center">
              <div class="relative inline-flex">
                <img
                  :src="hotelLogoPreviewUrl"
                  alt="Hotel logo preview"
                  class="h-[120px] w-[120px] rounded-[4px] border border-[#E4E6ED] bg-white object-contain p-3"
                />
                <button
                  type="button"
                  class="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-[#B61515] text-white"
                  aria-label="Remove hotel logo"
                  @click="hotelLogoPreviewUrl = '/logo.svg'"
                >
                  <X class="size-[14px]" aria-hidden="true" />
                </button>
              </div>
              <input id="hotel-logo" type="file" class="sr-only" aria-label="Upload hotel logo" />
            </div>
          </section>
        </form>
      </article>
    </main>
  </section>
</template>

