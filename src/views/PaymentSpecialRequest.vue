<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { BriefcaseBusiness } from 'lucide-vue-next'

const standardRequests = ref<string[]>([])
const specialRequests = ref<string[]>([])

const toggle = (list: any, value: string) => {
  const index = list.value.indexOf(value)
  if (index > -1) list.value.splice(index, 1)
  else list.value.push(value)
}
</script>

<template>
  <div class="mx-auto max-w-[1122px] flex flex-col lg:gap-10 lg:pt-[80px]">
    <!-- ===== HEADER ===== -->
    <div class="flex flex-col gap-6 py-[24px] px-[16px] bg-[#f7f7fb] lg:gap-10 lg:p-0">
      <h1 class="headline-3 text-green-800">Booking Room</h1>

      <!-- STEP -->
      <div
        class="flex flex-col gap-4 lg:flex-row lg:gap-10 lg:pb-10 lg:border-b lg:border-gray-300"
      >
        <!-- Step 1 -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] bg-orange-100 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-orange-500">1</span>
          </div>
          <span class="headline-5 text-gray-900">Basic Information</span>
        </div>

        <!-- Step 2 -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] bg-orange-500 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-white">2</span>
          </div>
          <span class="headline-5 text-orange-500">Payment Method</span>
        </div>

        <!-- Step 3 -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] bg-gray-200 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-gray-600">3</span>
          </div>
          <span class="headline-5 text-gray-600">Confirm</span>
        </div>
      </div>
    </div>

    <!-- ===== MAIN ===== -->
    <div class="flex flex-col lg:flex-row lg:gap-6">
      <!-- ===== LEFT ===== -->
      <div class="flex flex-col gap-6 grow">
        <!-- ===== FORM ===== -->
        <div class="bg-white border border-gray-300 rounded py-6 px-4 flex flex-col gap-10">
          <!-- STANDARD REQUEST -->
          <div class="flex flex-col gap-6">
            <div class="text-gray-600">
              <h2 class="headline-5">Standard Request</h2>
              <p class="body-2">These requests are not confirmed (Depend on the available room)</p>
            </div>
            <div class="flex flex-col gap-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(standardRequests, 'early-checkin')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    standardRequests.includes('early-checkin') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="standardRequests.includes('early-checkin')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">Early check-in</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(standardRequests, 'late-checkout')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    standardRequests.includes('late-checkout') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="standardRequests.includes('late-checkout')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">Late check-out</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(standardRequests, 'non-smoking')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    standardRequests.includes('non-smoking') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="standardRequests.includes('non-smoking')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">Non-smoking room</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(standardRequests, 'high-floor')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    standardRequests.includes('high-floor') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="standardRequests.includes('high-floor')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">A room on the high floor</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(standardRequests, 'quiet-room')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    standardRequests.includes('quiet-room') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="standardRequests.includes('quiet-room')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">A quiet room</span>
              </label>
            </div>
          </div>

          <!-- SPECIAL REQUEST -->
          <div class="flex flex-col gap-6">
            <div class="text-gray-600">
              <h2 class="headline-5">Special Request</h2>
              <p class="body-2">Additional charge may apply</p>
            </div>

            <div class="flex flex-col gap-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" class="hidden" @change="toggle(specialRequests, 'cot')" />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="specialRequests.includes('cot') && 'bg-orange-500 border-orange-300'"
                >
                  <span v-if="specialRequests.includes('cot')" class="text-white text-sm">✓</span>
                </div>
                <span class="body-1 text-gray-700">Baby cot (+THB 400)</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(specialRequests, 'airport')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="specialRequests.includes('airport') && 'bg-orange-500 border-orange-300'"
                >
                  <span v-if="specialRequests.includes('airport')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">Airport transfer (+THB 200)</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(specialRequests, 'extra-bed')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    specialRequests.includes('extra-bed') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="specialRequests.includes('extra-bed')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">Extra bed (+THB 500)</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(specialRequests, 'extra-pillow')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    specialRequests.includes('extra-pillow') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="specialRequests.includes('extra-pillow')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">Extra pillows (+THB 100)</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(specialRequests, 'phone-charger')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    specialRequests.includes('phone-charger') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="specialRequests.includes('phone-charger')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">Phone chargers and adapters (+THB 100)</span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="hidden"
                  @change="toggle(specialRequests, 'breakfast')"
                />
                <div
                  class="w-6 h-6 border rounded-sm border-gray-400 flex items-center justify-center"
                  :class="
                    specialRequests.includes('breakfast') && 'bg-orange-500 border-orange-300'
                  "
                >
                  <span v-if="specialRequests.includes('breakfast')" class="text-white text-sm"
                    >✓</span
                  >
                </div>
                <span class="body-1 text-gray-700">Breakfast (+150)</span>
              </label>
            </div>
          </div>

          <!-- TEXTAREA -->
          <div class="flex flex-col gap-1">
            <label class="body-1 text-gray-900">Additional Note</label>
            <textarea
              class="border border-gray-400 rounded-sm p-3 pr-4 h-24 resize-none"
              placeholder="Enter your request"
            />
          </div>
        </div>

        <!-- ===== ACTION (DESKTOP) ===== -->
        <div class="hidden lg:flex px-4 py-6 items-center justify-between">
          <Button variant="ghost">Back</Button>
          <Button variant="primary" size="xs">Confirm</Button>
        </div>
      </div>

      <!-- ===== RIGHT ===== -->
      <div class="flex flex-col gap-6 lg:max-w-[358px]">
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
        <ul class="mt-4 bg-gray-300 p-4 space-y-5">
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
        <Button variant="primary" size="xs">Confirm</Button>
      </div>
    </div>
  </div>
</template>
