<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="bg-bg flex min-h-screen flex-col items-center justify-center px-4">
    <div class="flex w-full max-w-[480px] flex-col items-center gap-6 text-center">
      <CheckCircle2 class="size-20 text-[#2F7A4D]" />

      <div class="flex flex-col gap-2">
        <h1 class="headline-4 text-[#2A2E3F]">Date Changed Successfully</h1>
        <p class="body-1 text-[#646D89]">
          Your booking dates have been updated. We look forward to welcoming you.
        </p>
      </div>

      <button
        type="button"
        class="font-open-sans w-full cursor-pointer rounded bg-[#C14817] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-orange-500"
        @click="router.push({ name: 'booking-history' })"
      >
        Back to My Booking
      </button>
    </div>
  </div>
</template>
