<script setup lang="ts">
import { computed } from "vue"
import { useAutoplayCarousel } from "@/composables/useAutoplayCarousel"

const slides = [
  {
    quote:
      "“lorem ipsum dolor sit amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint, velit official consequat duis enim velit mollit, exercitation minim amet consequat sunt.”",
    name: "Katherine",
    company: "Company®",
    image: "/LandingPagePic/SlidePic1.jpg",
  },
  {
    quote:
      "“Neatly Hotel exceeded our expectations—the staff, the rooms, and the facilities made our stay unforgettable.”",
    name: "Jane Cooper",
    company: "Travel Weekly",
    image: "/LandingPagePic/SlidePic2.jpg",
  },
  {
    quote:
      "“A peaceful retreat in the heart of the city. We will definitely return for our next anniversary.”",
    name: "Robert Fox",
    company: "Studio North",
    image: "/LandingPagePic/SlidePic3.jpg",
  },
  {
    quote:
      "“Impeccable service and stunning views. The spa and pool were highlights of our family vacation.”",
    name: "Kristin Watson",
    company: "Bright Co.",
    image: "/LandingPagePic/SlidePic4.jpg",
  },
  {
    quote:
      "“From check-in to checkout, everything felt effortless. Highly recommend for business and leisure.”",
    name: "Cody Fisher",
    company: "Loom Agency",
    image: "/LandingPagePic/SlidePic5.jpg",
  },
] as const

const { index, next, prev, pause, resume } = useAutoplayCarousel(slides.length, 8000)

const active = computed(() => slides[index.value] ?? slides[0])
</script>

<template>
  <section
    class="min-h-[602px] w-full bg-[#E6EBE9] px-4 py-12 md:min-h-[752px] md:px-6 md:py-20 lg:px-10 xl:px-[160px]"
    aria-labelledby="testimonials-heading"
  >
    <div class="mx-auto max-w-[1120px]">
      <h2
        id="testimonials-heading"
        class="landing-serif-h2 mb-8 text-center text-[#2f3e35] md:mb-12 md:min-h-[85px] md:leading-tight"
      >
        Our Customer Says
      </h2>

      <div
        class="flex flex-col items-stretch gap-6 md:flex-row md:items-center md:gap-8"
        @mouseenter="pause"
        @mouseleave="resume"
      >
        <button
          type="button"
          class="border-border order-2 hidden size-14 shrink-0 items-center justify-center rounded-full border border-[#E76B39] bg-white shadow-sm transition-colors hover:bg-orange-50 md:order-1 md:flex"
          aria-label="Previous testimonial"
          @click="prev"
        >
          <img
            src="/Icon%20figma/arrow-left.svg"
            alt=""
            class="landing-arrow-orange size-6"
            width="24"
            height="24"
          />
        </button>

        <div class="order-1 flex min-w-0 flex-1 flex-col items-center text-center md:order-2">
          <div class="relative mb-6 aspect-[16/10] w-full max-w-[720px] overflow-hidden rounded-lg md:mb-10">
            <img
              v-for="(s, i) in slides"
              :key="s.image"
              :src="s.image"
              alt=""
              width="720"
              height="450"
              class="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-in-out"
              :class="i === index ? 'z-1 opacity-100' : 'z-0 opacity-0'"
            />
          </div>

          <blockquote
            class="font-inter mb-6 max-w-[52rem] text-pretty text-[1.25rem] font-semibold leading-normal text-[#465c50] md:mb-8 md:text-[20px]"
          >
            {{ active.quote }}
          </blockquote>

          <div class="flex items-center gap-3">
            <img
              :src="active.image"
              alt=""
              width="32"
              height="32"
              class="size-8 rounded-full object-cover"
            />
            <div class="text-left">
              <p class="body-1 font-inter text-[16px] text-[#9aa1b9]">
                {{ active.name }}, {{ active.company }}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="border-border order-3 hidden size-14 shrink-0 items-center justify-center rounded-full border border-[#E76B39] bg-white shadow-sm transition-colors hover:bg-orange-50 md:flex"
          aria-label="Next testimonial"
          @click="next"
        >
          <img
            src="/Icon%20figma/arrow-right.svg"
            alt=""
            class="landing-arrow-orange size-6"
            width="24"
            height="24"
          />
        </button>
      </div>

      <div class="mt-8 flex justify-center gap-4 md:hidden">
        <button
          type="button"
          class="border-border flex size-14 items-center justify-center rounded-full border border-[#E76B39] bg-white shadow-sm"
          aria-label="Previous testimonial"
          @click="prev"
        >
          <img
            src="/Icon%20figma/arrow-left.svg"
            alt=""
            class="landing-arrow-orange size-6"
            width="24"
            height="24"
          />
        </button>
        <button
          type="button"
          class="border-border flex size-14 items-center justify-center rounded-full border border-[#E76B39] bg-white shadow-sm"
          aria-label="Next testimonial"
          @click="next"
        >
          <img
            src="/Icon%20figma/arrow-right.svg"
            alt=""
            class="landing-arrow-orange size-6"
            width="24"
            height="24"
          />
        </button>
      </div>
    </div>
  </section>
</template>
