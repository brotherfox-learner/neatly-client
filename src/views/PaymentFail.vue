<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { CircleAlert } from 'lucide-vue-next'
</script>

<template>
  <div class="max-w-[738px] mx-auto bg-background flex flex-col min-h-screen lg:py-[80px]">
    <!-- ===== CONTENT ===== -->
    <div
      class="flex-1 flex flex-col items-center justify-center text-center px-[24px] py-[88px] gap-6 bg-orange-100 lg:flex-none lg:pt-[64px]"
    >
      <!-- ICON -->
      <CircleAlert :size="64" color="#C14817" />

      <!-- TEXT -->
      <div class="flex flex-col gap-3">
        <h1 class="headline-3 text-orange-600">Payment failed</h1>

        <p class="body-2 text-orange-500">
          There seems to be an issue with your card. Please check your card details and try again
          later, or use a different payment method.
        </p>
      </div>
    </div>

    <!-- ===== ACTION (MOBILE) ===== -->
    <div class="lg:hidden px-4 py-6 flex flex-col items-center justify-between">
      <Button variant="primary" size="xs">Back to Payment details</Button>
      <Button variant="ghost">Retry payment</Button>
    </div>
    <!-- ===== ACTION (DESKTOP) ===== -->
    <div
      class="hidden lg:flex px-4 py-6 items-center justify-between lg:mx-auto lg:p-0 lg:mt-[60px]"
    >
      <Button variant="ghost">Retry payment</Button>
      <Button variant="primary" size="xs">Back to Payment details</Button>
    </div>
  </div>
</template>
