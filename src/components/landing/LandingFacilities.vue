<script setup lang="ts">
const facilities = [
  { label: "Spa", icon: "/Icon%20figma/bx_spa.svg" },
  { label: "Sauna", icon: "/Icon%20figma/ep_hot-water.svg" },
  { label: "Fitness", icon: "/Icon%20figma/healthicons_exercise-outline.svg" },
  { label: "Arrival Lounge", icon: "/Icon%20figma/iconoir_two-seater-sofa.svg" },
  { label: "Free Wifi", icon: "/Icon%20figma/ant-design_wifi-outlined.svg" },
  { label: "Parking", icon: "/Icon%20figma/carbon_car.svg" },
  { label: "24-hour operation", icon: "/Icon%20figma/bx_phone-call.svg" },
] as const
</script>

<template>
  <section
    id="service-facilities"
    class="min-h-[690px] w-full scroll-mt-24 bg-[#2f3e35] px-4 py-12 md:min-h-[480px] md:px-6 md:py-16 lg:px-10 xl:px-[160px]"
    aria-labelledby="facilities-heading"
  >
    <div class="mx-auto max-w-[1120px]">
      <h2
        id="facilities-heading"
        class="landing-serif-h2 mb-10 text-center text-white md:mb-14 md:min-h-[85px] md:leading-tight"
      >
        Service &amp; Facilities
      </h2>

      <ul
        class="mx-auto grid max-w-[1100px] grid-cols-2 justify-items-center gap-x-[19px] gap-y-8 md:flex md:max-w-none md:flex-nowrap md:items-start md:gap-x-2 md:gap-y-0 lg:gap-x-4 xl:gap-x-5"
      >
        <li
          v-for="(item, idx) in facilities"
          :key="item.label"
          class="flex w-[144px] max-w-full flex-col items-center gap-3 text-center md:w-0 md:min-w-0 md:flex-1 md:max-w-none"
          :class="idx === facilities.length - 1 ? 'col-span-2 justify-self-center' : ''"
        >
          <div class="flex size-[60px] items-center justify-center">
            <img
              :src="item.icon"
              alt=""
              width="60"
              height="60"
              class="size-[60px] brightness-0 invert"
            />
          </div>
          <p class="body-1 font-inter text-center text-[16px] font-normal text-white">
            {{ item.label }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
