<script setup lang="ts">
import { useRouter } from 'vue-router'
import { XCircle } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="bg-bg flex min-h-screen flex-col items-center justify-center px-4">
    <div class="flex w-full max-w-[480px] flex-col items-center gap-6 text-center">
      <XCircle class="size-20 text-[#B61515]" />

      <div class="flex flex-col gap-2">
        <h1 class="headline-4 text-[#2A2E3F]">Cancellation Failed</h1>
        <p class="body-1 text-[#646D89]">
          We couldn't cancel your booking. Please try again or contact support.
        </p>
      </div>

      <div class="flex w-full flex-col gap-3">
        <button
          type="button"
          class="font-open-sans w-full cursor-pointer rounded bg-[#C14817] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-orange-500"
          @click="router.back()"
        >
          Try Again
        </button>
        <button
          type="button"
          class="font-open-sans cursor-pointer text-base font-semibold text-[#E76B39] transition-colors hover:text-orange-400"
          @click="router.push({ name: 'booking-history' })"
        >
          Back to My Booking
        </button>
      </div>
    </div>
  </div>
</template>
