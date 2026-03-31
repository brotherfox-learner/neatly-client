<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { CreditCardIcon } from '@heroicons/vue/24/outline'
import { BanknotesIcon } from '@heroicons/vue/24/outline'
import { HandCash } from '@iconoir/vue'
import { BriefcaseBusiness } from 'lucide-vue-next'

type PaymentMethod = 'card' | 'cash'

const paymentMethod = ref<PaymentMethod>('card')
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
            class="w-[66px] h-[50px] lg:h-[66px] bg-orange-100 rounded-sm flex items-center justify-center"
          >
            <span class="headline-4 text-orange-500">1</span>
          </div>
          <span class="headline-5 text-gray-900">Basic Information</span>
        </div>

        <!-- Step 2 -->
        <div class="flex items-center gap-4">
          <div
            class="w-[66px] h-[50px] lg:h-[66px] bg-orange-100 rounded-sm flex items-center justify-center"
          >
            <span class="headline-4 text-orange-500">2</span>
          </div>
          <span class="headline-5 text-gray-900">Payment Method</span>
        </div>

        <!-- Step 3 -->
        <div class="flex items-center gap-4">
          <div
            class="w-[66px] h-[50px] lg:h-[66px] bg-orange-500 rounded-sm flex items-center justify-center"
          >
            <span class="headline-4 text-white">3</span>
          </div>
          <span class="headline-5 text-orange-500">Payment Method</span>
        </div>
      </div>
    </div>

    <!-- ===== MAIN ===== -->
    <div class="flex flex-col lg:flex-row lg:gap-6">
      <!-- ===== LEFT ===== -->
      <!-- ===== PAYMENT ===== -->
      <div
        class="grow bg-white border border-gray-300 rounded-sm px-4 py-6 flex flex-col gap-10 lg:p-10"
      >
        <!-- SELECT PAYMENT -->
        <div class="flex gap-2 lg:gap-4">
          <!-- CARD -->
          <button
            class="flex-1 py-[14px] rounded-sm border shadow-1 flex items-center justify-center gap-2 cursor-pointer lg:py-[24px] lg:headline-5"
            :class="
              paymentMethod === 'card'
                ? 'border-orange-500 text-orange-500'
                : 'border-gray-300 text-gray-500'
            "
            @click="paymentMethod = 'card'"
          >
            <CreditCardIcon class="w-8 h-8" />
            Credit Card
          </button>

          <!-- CASH -->
          <button
            class="flex-1 py-[14px] rounded-sm border shadow-1 flex items-center justify-center gap-2 cursor-pointer lg:py-[24px] lg:headline-5"
            :class="
              paymentMethod === 'cash'
                ? 'border-orange-500 text-orange-500'
                : 'border-gray-300 text-gray-500'
            "
            @click="paymentMethod = 'cash'"
          >
            <BanknotesIcon class="w-8 h-8" />
            Cash
          </button>
        </div>

        <!-- ===== CARD FORM ===== -->
        <div v-if="paymentMethod === 'card'" class="flex flex-col gap-6 lg:gap-10">
          <h2 class="headline-5 text-gray-600 lg:text-gray-800">Credit Card</h2>

          <!-- Card Number -->
          <div class="flex flex-col gap-1">
            <label class="body-1 text-gray-900">Card Number</label>
            <input
              class="border border-gray-400 rounded-sm p-3 pr-4"
              placeholder="xxxx-xxxx-xxxx-xxxx"
            />
          </div>

          <!-- Name -->
          <div class="flex flex-col gap-1">
            <label class="body-1 text-gray-900">Card Owner</label>
            <input class="border border-gray-400 rounded-sm p-3 pr-4" placeholder="Name on card" />
          </div>

          <!-- Expiry + CVV -->
          <div class="flex gap-10">
            <div class="flex flex-col gap-1 flex-1">
              <label class="body-1 text-gray-900">Expiry</label>
              <input
                class="w-full border border-gray-400 rounded-sm p-3 pr-4"
                placeholder="MM/YY"
              />
            </div>

            <div class="flex flex-col gap-1 flex-1">
              <label class="body-1 text-gray-900">CVV</label>
              <input class="w-full border border-gray-400 rounded-sm p-3 pr-4" placeholder="123" />
            </div>
          </div>

          <!-- PROMO -->
          <div class="border-t py-6">
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900">Promotion Code</label>
              <input
                class="border border-gray-400 rounded-sm p-3 pr-4 uppercase"
                placeholder="Enter code"
              />
            </div>
          </div>
        </div>

        <!-- ===== CASH INFO ===== -->
        <div v-else class="flex flex-col gap-6 lg:gap-10">
          <h2 class="headline-5 text-gray-600 lg:text-gray-800">Cash</h2>
          <div class="bg-gray-200 px-6 py-4 rounded-sm flex gap-4 items-center">
            <HandCash class="w-[50px] h-[50px] text-[#E76B39]" />
            <p class="body-1 text-gray-900 flex-1">
              Pay at the hotel with cash or cheque. No payment is required until you check in
            </p>
          </div>

          <!-- PROMO -->
          <div class="border-t py-6">
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900">Promotion Code</label>
              <input
                class="border border-gray-400 rounded-sm p-3 pr-4 uppercase"
                placeholder="Enter code"
              />
            </div>
          </div>
        </div>

        <!-- ===== ACTION (DESKTOP) ===== -->
        <div class="hidden lg:flex items-center justify-between">
          <Button variant="ghost">Back</Button>
          <Button variant="primary" size="xs">Confirm Booking</Button>
        </div>
      </div>

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

            <!-- DATE -->
            <div>
              <div class="body-1 py-1 flex flex-row gap-2">
                <span>Th, 19 Oct 2022</span>
                <span>-</span>
                <span>Fr, 20 Oct 2022</span>
              </div>
              <div class="body-1 py-1">2 Guests</div>
            </div>

            <div class="flex flex-col gap-4">
              <!-- List Service -->
              <div>
                <div class="flex justify-between py-[12px]">
                  <span class="body-1 text-green-300"> Superior Garden View Room </span>
                  <span class="body-1 font-semibold!"> 2,500.00 </span>
                </div>
                <div class="flex justify-between py-[12px]">
                  <span class="body-1 text-green-300"> Airport tranfer </span>
                  <span class="body-1 font-semibold!"> 200.00 </span>
                </div>
              </div>

              <!-- TOTAL -->
              <div class="border-t border-green-600 pt-6 flex items-center justify-between">
                <span class="body-1 text-green-300">Total</span>
                <span class="headline-5">THB 2,500.00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTE -->
        <ul class="bg-gray-300 p-4 space-y-5">
          <li class="flex gap-2">
            <div class="mt-2 w-1 h-1 bg-green-600 rounded-full shrink-0"></div>
            <p class="body-3 text-green-600">
              Cancel booking will get full refund if the cancelation occurs before 24 hours of the
              check-in date.
            </p>
          </li>

          <li class="flex gap-2">
            <div class="mt-2 w-1 h-1 bg-green-600 rounded-full shrink-0"></div>
            <p class="body-3 text-green-600">
              Able to change check-in or check-out date booking within 24 hours of the booking date
            </p>
          </li>
        </ul>
      </div>
      <!-- ACTION -->
      <div class="lg:hidden px-4 py-6 flex items-center justify-between">
        <Button variant="ghost">Back</Button>
        <Button variant="primary" size="xs">Next</Button>
      </div>
    </div>
  </div>
</template>
