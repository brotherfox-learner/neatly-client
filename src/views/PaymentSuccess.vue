<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div
    class="max-w-[738px] mx-auto bg-background flex flex-col min-h-screen lg:pt-[80px]"
  >
    <!-- ===== TOP (SUCCESS) ===== -->
    <div class="bg-green-800 text-white px-6 py-10 text-center flex flex-col gap-4">
      <h1 class="headline-3">Thank you for booking</h1>

      <p class="text-green-400 body-2 font-medium!">
        We are looking forward to hosting you at our place. We will send you more information about
        check-in and staying at our Neatly closer to your date of reservation
      </p>
    </div>

    <!-- ===== CONTENT ===== -->
    <div class="bg-green-700 text-white flex-1 px-4 pt-6 pb-10 flex flex-col gap-6">
      <!-- CARD -->
      <div class="bg-green-600 rounded-sm p-4 flex flex-col gap-6">
        <!-- DATE -->
        <div>
          <div class="body-1 py-1 flex flex-row gap-2">
            <span>Th, 19 Oct 2022</span>
            <span>-</span>
            <span>Fr, 20 Oct 2022</span>
          </div>
          <div class="body-1 py-1">2 Guests</div>
        </div>

        <!-- CHECK IN / OUT -->
        <div class="flex flex-row items-stretch gap-[24px]">
          <div class="flex-1">
            <div class="body-1 font-semibold!">Check-in</div>
            <div class="body-1">After 2:00 PM</div>
          </div>

          <div class="flex-1">
            <div class="body-1 font-semibold!">Check-out</div>
            <div class="body-1">Before 12:00 PM</div>
          </div>
        </div>
      </div>

      <!-- PAYMENT -->
      <div class="flex gap-4 text-green-300">
        <span>Payment success via</span>
        <span class="font-semibold"> Credit Card - *888 </span>
      </div>

      <!-- ===== DETAIL ===== -->
      <div class="flex flex-col">
        <div class="flex justify-between py-3">
          <span class="text-green-300">Superior Garden View Room</span>
          <span class="body-1 font-semibold!">2,500.00</span>
        </div>

        <div class="flex justify-between py-3">
          <span class="text-green-300">Airport transfer</span>
          <span class="body-1 font-semibold!">200.00</span>
        </div>

        <div class="flex justify-between py-3">
          <span class="text-green-300">Promotion Code</span>
          <span class="body-1 font-semibold!">-400.00</span>
        </div>

        <!-- TOTAL -->
        <div class="border-t border-green-600 mt-4 pt-4 flex items-center justify-between">
          <span class="body-1 text-green-300">Total</span>
          <span class="headline-5">THB 2,300.00</span>
        </div>
      </div>
    </div>

    <!-- ===== ACTION (MOBILE) ===== -->
    <div class="lg:hidden px-4 py-6 flex items-center justify-between">
      <Button variant="ghost">Back</Button>
      <Button variant="primary" size="xs">Confirm</Button>
    </div>
    <!-- ===== ACTION (DESKTOP) ===== -->
    <div class="hidden lg:flex px-4 py-6 items-center justify-between">
      <Button variant="ghost">Back</Button>
      <Button variant="primary" size="xs">Confirm</Button>
    </div>
  </div>
</template>
