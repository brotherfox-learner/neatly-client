<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { BriefcaseBusiness } from 'lucide-vue-next'
</script>

<template>
  <div class="mx-auto max-w-[1122px] flex flex-col lg:gap-10 lg:py-[80px]">
    <!-- ===== HEADER ===== -->
    <div class="flex flex-col gap-6 py-[24px] px-[16px] bg-[#f7f7fb] lg:gap-10 lg:p-0">
      <h1 class="headline-3 text-green-800 lg:headline-2">Booking Room</h1>

      <!-- STEP -->
      <div
        class="flex flex-col gap-4 lg:flex-row lg:gap-10 lg:pb-10 lg:border-b lg:border-gray-300"
      >
        <!-- Step 1 -->
        <div class="flex items-center gap-4">
          <div
            class="w-[66px] h-[50px] lg:h-[66px] bg-orange-500 rounded-sm flex items-center justify-center"
          >
            <span class="headline-4 text-white">1</span>
          </div>
          <span class="headline-5 text-orange-500">Basic Information</span>
        </div>

        <!-- Step 2 -->
        <div class="flex items-center gap-4">
          <div
            class="w-[66px] h-[50px] lg:h-[66px] bg-gray-200 rounded-sm flex items-center justify-center"
          >
            <span class="headline-4 text-gray-600">2</span>
          </div>
          <span class="headline-5 text-gray-600">Payment Method</span>
        </div>

        <!-- Step 3 -->
        <div class="flex items-center gap-4">
          <div
            class="w-[66px] h-[50px] lg:h-[66px] bg-gray-200 rounded-sm flex items-center justify-center"
          >
            <span class="headline-4 text-gray-600">3</span>
          </div>
          <span class="headline-5 text-gray-600">Payment Method</span>
        </div>
      </div>
    </div>

    <!-- ===== MAIN ===== -->
    <div class="flex flex-col lg:flex-row lg:gap-6">
      <!-- ===== LEFT ===== -->
      <!-- ===== FORM ===== -->
      <form
        class="grow bg-white border border-gray-300 rounded-sm py-6 px-4 flex flex-col gap-6 lg:p-10 lg:gap-10"
      >
        <h2 class="headline-5 text-gray-600 lg:text-gray-800">Basic Information</h2>

        <div class="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <div class="flex flex-col gap-1 grow">
            <label class="body-1 text-gray-900">First name</label>
            <input
              class="p-3 border border-gray-400 text-black rounded-sm"
              placeholder="Enter your first name"
            />
          </div>

          <div class="flex flex-col gap-1 grow">
            <label class="body-1 text-gray-900">Last name</label>
            <input
              class="p-3 border border-gray-400 text-black rounded-sm"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Email</label>
          <input
            class="p-3 border border-gray-400 text-black rounded-sm"
            placeholder="Enter your email"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Phone number</label>
          <input
            class="p-3 border border-gray-400 text-black rounded-sm"
            placeholder="Phone number"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Date of Birth</label>
          <input
            class="p-3 border border-gray-400 text-black rounded-sm"
            placeholder="MM/DD/YYYY"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Country</label>
          <input class="p-3 border border-gray-400 text-black rounded-sm" placeholder="Country" />
        </div>

        <!-- ===== ACTION (DESKTOP) ===== -->
        <div class="hidden lg:flex items-center justify-between">
          <Button variant="ghost">Back</Button>
          <Button variant="primary" size="xs">Next</Button>
        </div>
      </form>

      <!-- ===== RIGHT ===== -->
      <div class="flex flex-col gap-4 lg:max-w-[358px]">
        <!-- ===== SUMMARY ===== -->
        <div class="bg-green-700 text-white">
          <!-- HEADER -->
          <div class="bg-green-800 p-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <BriefcaseBusiness color="#81A08F" />
              <span class="headline-5">Booking Detail</span>
            </div>

            <div class="bg-orange-200 text-orange-700 px-2 py-1 rounded-sm body-2">04:55</div>
          </div>

          <div class="py-[24px] px-[16px] flex flex-col gap-6 lg:p-6 lg:gap-10">
            <div class="flex gap-6">
              <div class="flex-1">
                <div class="body-1 font-semibold">Check-in</div>
                <div class="body-1">After 2:00 PM</div>
              </div>

              <div class="flex-1">
                <div class="body-1 font-semibold">Check-out</div>
                <div class="body-1">Before 12:00 PM</div>
              </div>
            </div>

            <div>
              <div class="body-1 py-1 flex flex-row gap-2">
                <span>Th, 19 Oct 2022</span>
                <span>-</span>
                <span>Fr, 20 Oct 2022</span>
              </div>
              <div class="body-1 py-1">2 Guests</div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex justify-between py-[12px]">
                <span class="body-1 text-green-300"> Superior Garden View Room </span>
                <span class="body-1 font-semibold!"> 2,500.00 </span>
              </div>

              <div class="border-t border-green-600 pt-6 flex items-center justify-between">
                <span class="text-green-300">Total</span>
                <span class="headline-5">THB 2,500.00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== NOTE ===== -->
        <ul class="bg-gray-300 p-4 space-y-5">
          <li class="flex gap-2">
            <div class="mt-2 w-2 h-2 bg-green-600 rounded-full shrink-0"></div>
            <p class="text-green-600">
              Cancel booking will get full refund if cancelation occurs before 24 hours.
            </p>
          </li>

          <li class="flex gap-2">
            <div class="mt-2 w-2 h-2 bg-green-600 rounded-full shrink-0"></div>
            <p class="text-green-600">Able to change booking within 24 hours.</p>
          </li>
        </ul>
      </div>

      <!-- ===== ACTION (MOBILE) ===== -->
      <div class="lg:hidden px-4 py-6 flex items-center justify-between">
        <Button variant="ghost">Back</Button>
        <Button variant="primary" size="xs">Next</Button>
      </div>
    </div>
  </div>
</template>
