<script setup lang="ts">
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-vue-next"
import { RouterLink } from "vue-router"

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
] as const
</script>

<template>
  <footer
    class="bg-[#2d3a33] px-4 py-12 text-white md:px-6 md:py-16 lg:px-10 xl:px-[160px]"
    aria-labelledby="footer-brand"
  >
    <div
      class="mx-auto flex max-w-[1120px] flex-col gap-12 md:min-h-[320px] md:flex-row md:justify-between md:gap-16"
    >
      <div class="flex max-w-md flex-col gap-10">
        <RouterLink to="/" class="inline-block w-fit" aria-label="Neatly home">
          <img
            src="/logo-white.svg"
            alt="Neatly"
            class="h-[49px] w-[180px] object-contain"
            width="180"
            height="49"
          />
        </RouterLink>
        <div>
          <p id="footer-brand" class="headline-5 font-inter mb-2 font-semibold text-white">
            Neatly Hotel
          </p>
          <p class="body-1 font-inter text-white/90">
            The best hotel for rising your experience
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-12 md:max-w-md">
        <h2 class="font-inter text-base font-bold uppercase tracking-[0.12em] text-white">
          Contact
        </h2>
        <ul class="flex flex-col gap-7">
          <li class="flex items-start gap-3">
            <Phone
              class="mt-0.5 size-6 shrink-0 text-white"
              aria-hidden="true"
              :stroke-width="1.5"
            />
            <a
              href="tel:+66999999999"
              class="font-inter text-[16px] font-medium leading-snug text-white hover:underline"
            >
              +66 99 999 9999
            </a>
          </li>
          <li class="flex items-start gap-3">
            <Mail
              class="mt-0.5 size-6 shrink-0 text-white"
              aria-hidden="true"
              :stroke-width="1.5"
            />
            <a
              href="mailto:contact@neatlyhotel.com"
              class="font-inter text-[16px] font-medium leading-snug text-white hover:underline"
            >
              contact@neatlyhotel.com
            </a>
          </li>
          <li class="flex items-start gap-3">
            <MapPin
              class="mt-0.5 size-6 shrink-0 text-white"
              aria-hidden="true"
              :stroke-width="1.5"
            />
            <address class="font-inter not-italic text-[16px] font-medium leading-snug text-white">
              188 Phaya Thai Rd, Thung Phaya Thai, Ratchathewi, Bangkok 10400
            </address>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="mx-auto mt-10 flex max-w-[1120px] flex-col gap-6 border-t border-white/20 pt-8 md:mt-14 md:flex-row md:items-center md:justify-between"
    >
      <ul class="flex items-center gap-5" aria-label="Social media">
        <li v-for="item in socialLinks" :key="item.name">
          <a
            :href="item.href"
            class="text-white opacity-90 transition-opacity hover:opacity-100"
            rel="noopener noreferrer"
            target="_blank"
            :aria-label="item.name"
          >
            <component
              :is="item.icon"
              class="size-6"
              aria-hidden="true"
              :stroke-width="1.5"
            />
          </a>
        </li>
      </ul>
      <p class="font-inter text-[14px] font-normal text-white/80">
        Copyright ©2022 Neatly Hotel
      </p>
    </div>
  </footer>
</template>
