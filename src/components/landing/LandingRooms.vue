<script setup lang="ts">
import { RouterLink } from "vue-router"

const arrowSrc = "/Icon%20figma/arrow-right.svg"
</script>

<template>
  <section
    id="rooms-suits"
    class="bg-bg min-h-[1755px] w-full scroll-mt-24 px-4 py-12 md:min-h-[2138px] md:px-6 md:py-20 lg:px-10 xl:px-[160px]"
    aria-labelledby="rooms-heading"
  >
    <div class="mx-auto max-w-[1120px]">
      <h2
        id="rooms-heading"
        class="landing-serif-h2 mb-10 text-center text-[#2f3e35] md:mb-16 md:min-h-[85px] md:leading-tight"
      >
        Rooms &amp; Suits
      </h2>

      <div class="flex flex-col gap-4 md:gap-[20px]">
        <!-- Superior Garden View — full-width banner card -->
        <article class="group relative w-full overflow-hidden rounded-lg md:rounded-md">
          <div class="relative h-[250px] md:aspect-[1120/540] md:h-auto md:w-full">
            <img
              src="/LandingPagePic/SuperiorGardenView.jpg"
              alt="Superior garden view room with natural light and balcony"
              class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              width="1120"
              height="540"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
              aria-hidden="true"
            />
            <div class="absolute inset-x-0 bottom-0 p-5 md:p-8">
              <h3 class="landing-room-title mb-2">Superior Garden View</h3>
              <RouterLink
                to="/rooms/superior-garden-view"
                class="font-open-sans inline-flex items-center gap-2 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Explore Room
                <img :src="arrowSrc" alt="" class="size-4 brightness-0 invert" width="16" height="16" />
              </RouterLink>
            </div>
          </div>
        </article>

        <!-- Deluxe + Superior side-by-side -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,643fr)_minmax(0,453fr)] md:gap-[20px]">
          <article class="group relative w-full overflow-hidden rounded-lg md:rounded-md">
            <div class="relative h-[250px] md:aspect-[643/400] md:h-auto">
              <img
                src="/LandingPagePic/Deluxe.jpg"
                alt="Deluxe room interior with modern furnishings"
                class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                width="643"
                height="400"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                aria-hidden="true"
              />
              <div class="absolute inset-x-0 bottom-0 p-5 md:p-8">
                <h3 class="landing-room-title mb-2">Deluxe</h3>
                <RouterLink
                  to="/rooms/deluxe"
                  class="font-open-sans inline-flex items-center gap-2 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Explore Room
                  <img :src="arrowSrc" alt="" class="size-4 brightness-0 invert" width="16" height="16" />
                </RouterLink>
              </div>
            </div>
          </article>

          <article class="group relative w-full overflow-hidden rounded-lg md:rounded-md">
            <div class="relative h-[250px] md:aspect-[453/400] md:h-auto">
              <img
                src="/LandingPagePic/Superior.jpg"
                alt="Superior room with comfortable bed and warm lighting"
                class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                width="453"
                height="400"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                aria-hidden="true"
              />
              <div class="absolute inset-x-0 bottom-0 p-5 md:p-8">
                <h3 class="landing-room-title mb-2">Superior</h3>
                <RouterLink
                  to="/rooms/superior"
                  class="font-open-sans inline-flex items-center gap-2 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Explore Room
                  <img :src="arrowSrc" alt="" class="size-4 brightness-0 invert" width="16" height="16" />
                </RouterLink>
              </div>
            </div>
          </article>
        </div>

        <!-- Premier Sea View + (Supreme + Suite stacked) -->
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,453fr)_minmax(0,643fr)] md:items-start md:gap-[20px]"
        >
          <article class="group relative w-full overflow-hidden rounded-lg md:rounded-md">
            <div class="relative h-[250px] md:aspect-[453/700] md:h-[700px]">
              <img
                src="/LandingPagePic/PremierSeaView.jpg"
                alt="Premier sea view room overlooking the ocean"
                class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                width="453"
                height="700"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                aria-hidden="true"
              />
              <div class="absolute inset-x-0 bottom-0 p-5 md:p-8">
                <h3 class="landing-room-title mb-2">Premier Sea View</h3>
                <RouterLink
                  to="/rooms/premier-sea-view"
                  class="font-open-sans inline-flex items-center gap-2 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Explore Room
                  <img :src="arrowSrc" alt="" class="size-4 brightness-0 invert" width="16" height="16" />
                </RouterLink>
              </div>
            </div>
          </article>

          <div class="flex flex-col gap-4 md:gap-[20px]">
            <article class="group relative w-full overflow-hidden rounded-lg md:rounded-md">
              <div class="relative h-[250px] md:aspect-[643/340] md:h-[340px]">
                <img
                  src="/LandingPagePic/SupremeRoom.jpg"
                  alt="Supreme room with premium amenities"
                  class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  width="643"
                  height="340"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                  aria-hidden="true"
                />
                <div class="absolute inset-x-0 bottom-0 p-5 md:p-8">
                  <h3 class="landing-room-title mb-2">Supreme</h3>
                  <RouterLink
                    to="/rooms/supreme"
                    class="font-open-sans inline-flex items-center gap-2 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Explore Room
                    <img :src="arrowSrc" alt="" class="size-4 brightness-0 invert" width="16" height="16" />
                  </RouterLink>
                </div>
              </div>
            </article>

            <article class="group relative w-full overflow-hidden rounded-lg md:rounded-md">
              <div class="relative h-[250px] md:aspect-[643/340] md:h-[340px]">
                <img
                  src="/LandingPagePic/Suite.jpg"
                  alt="Spacious hotel suite with separate living area"
                  class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  width="643"
                  height="340"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                  aria-hidden="true"
                />
                <div class="absolute inset-x-0 bottom-0 p-5 md:p-8">
                  <h3 class="landing-room-title mb-2">Suite</h3>
                  <RouterLink
                    to="/rooms/suite"
                    class="font-open-sans inline-flex items-center gap-2 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Explore Room
                    <img :src="arrowSrc" alt="" class="size-4 brightness-0 invert" width="16" height="16" />
                  </RouterLink>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
