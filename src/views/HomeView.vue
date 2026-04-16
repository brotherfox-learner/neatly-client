<script setup lang="ts">
import LandingAboutSlideshow from "@/components/landing/LandingAboutSlideshow.vue"
import LandingFacilities from "@/components/landing/LandingFacilities.vue"
import LandingFooter from "@/components/landing/LandingFooter.vue"
import LandingHero from "@/components/landing/LandingHero.vue"
import LandingRooms from "@/components/landing/LandingRooms.vue"
import LandingTestimonials from "@/components/landing/LandingTestimonials.vue"
</script>

<template>
  <div class="bg-bg min-h-screen">
    <LandingHero />
    <LandingAboutSlideshow />
    <LandingFacilities />
    <LandingRooms />
    <LandingTestimonials />
    <LandingFooter />
  </div>
</template>
