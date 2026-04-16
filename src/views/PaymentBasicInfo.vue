<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { BriefcaseBusiness } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/booking'
import { useBookingTimer } from '@/composables/useBookingTimer'
import BookingTimerModal from '@/components/BookingTimerModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const bookingStore = useBookingStore()
const { timeLeft, isExpiredModalOpen, extendTimer } = useBookingTimer()

// ── Form state ────────────────────────────────────────────────────────────────
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const dateOfBirth = ref('')
const country = ref('')
const errors = ref<Record<string, string>>({})

// ── Dev mock: ถ้าไม่มีข้อมูลห้องใน store (navigate ตรงมา) ─────────────────────
const DEV_MOCK = {
  roomTypeName: 'Superior Garden View',
  pricePerNight: 2500,
  roomCount: 1,
  checkIn: '2025-10-19',
  checkOut: '2025-10-21',
  guests: 2,
}

const roomTypeName = bookingStore.roomTypeName || DEV_MOCK.roomTypeName
const pricePerNight = bookingStore.pricePerNight || DEV_MOCK.pricePerNight
const roomCount = bookingStore.roomCount || DEV_MOCK.roomCount
const checkIn = bookingStore.checkIn || DEV_MOCK.checkIn
const checkOut = bookingStore.checkOut || DEV_MOCK.checkOut
const guestCount = bookingStore.guests || DEV_MOCK.guests

// ── Formatted dates ───────────────────────────────────────────────────────────
const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const roomSubtotal = bookingStore.roomSubtotal || pricePerNight * bookingStore.totalNights || pricePerNight * 2

// ── Pre-fill from auth store ──────────────────────────────────────────────────
onMounted(() => {
  if (authStore.user) {
    firstName.value = authStore.user.firstName ?? ''
    lastName.value = authStore.user.lastName ?? ''
    email.value = authStore.user.email ?? ''
    phone.value = authStore.user.phone ?? ''
    dateOfBirth.value = authStore.user.dateOfBirth ?? ''
    country.value = authStore.user.country ?? ''
  }
  // ถ้า step เคยกรอกแล้ว ให้เติมกลับมา
  if (bookingStore.guestInfo.firstName) {
    firstName.value = bookingStore.guestInfo.firstName
    lastName.value = bookingStore.guestInfo.lastName
    email.value = bookingStore.guestInfo.email
    phone.value = bookingStore.guestInfo.phone
    dateOfBirth.value = bookingStore.guestInfo.dateOfBirth
    country.value = bookingStore.guestInfo.country
  }
})

// ── Validation ────────────────────────────────────────────────────────────────
const validate = () => {
  errors.value = {}
  if (!firstName.value.trim()) errors.value.firstName = 'Required'
  if (!lastName.value.trim()) errors.value.lastName = 'Required'
  if (!email.value.trim()) errors.value.email = 'Required'
  if (!phone.value.trim()) errors.value.phone = 'Required'
  if (!dateOfBirth.value.trim()) errors.value.dateOfBirth = 'Required'
  if (!country.value.trim()) errors.value.country = 'Required'
  return Object.keys(errors.value).length === 0
}

// ── Navigation ────────────────────────────────────────────────────────────────
const handleNext = () => {
  if (!validate()) return
  bookingStore.setGuestInfo({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    phone: phone.value,
    dateOfBirth: dateOfBirth.value,
    country: country.value,
  })
  router.push('/payment-request')
}

const handleBack = () => {
  router.push('/')
}
</script>

<template>
  <BookingTimerModal :open="isExpiredModalOpen" @extend="extendTimer" />
  <div class="mx-auto max-w-[1122px] flex flex-col lg:gap-10 lg:py-[80px]">
    <!-- ===== HEADER ===== -->
    <div class="flex flex-col gap-6 py-[24px] px-[16px] bg-[#f7f7fb] lg:gap-10 lg:p-0">
      <h1 class="headline-3 text-green-800 lg:headline-2">Booking Room</h1>

      <!-- STEP -->
      <div class="flex flex-col gap-4 lg:flex-row lg:gap-10 lg:pb-10 lg:border-b lg:border-gray-300">
        <!-- Step 1 (active) -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-orange-500 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-white">1</span>
          </div>
          <span class="headline-5 text-orange-500">Basic Information</span>
        </div>
        <!-- Step 2 -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-gray-200 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-gray-600">2</span>
          </div>
          <span class="headline-5 text-gray-600">Special Request</span>
        </div>
        <!-- Step 3 -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-gray-200 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-gray-600">3</span>
          </div>
          <span class="headline-5 text-gray-600">Payment Method</span>
        </div>
      </div>
    </div>

    <!-- ===== MAIN ===== -->
    <div class="flex flex-col lg:flex-row lg:gap-6">
      <!-- ===== FORM ===== -->
      <form
        class="grow bg-white border border-gray-300 rounded-sm py-6 px-4 flex flex-col gap-6 lg:p-10 lg:gap-10"
        @submit.prevent="handleNext"
      >
        <h2 class="headline-5 text-gray-600 lg:text-gray-800">Basic Information</h2>

        <div class="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <div class="flex flex-col gap-1 grow">
            <label class="body-1 text-gray-900">First name</label>
            <input
              v-model="firstName"
              class="p-3 border rounded-sm text-black"
              :class="errors.firstName ? 'border-red-400' : 'border-gray-400'"
              placeholder="Enter your first name"
            />
            <span v-if="errors.firstName" class="text-red-500 text-sm">{{ errors.firstName }}</span>
          </div>
          <div class="flex flex-col gap-1 grow">
            <label class="body-1 text-gray-900">Last name</label>
            <input
              v-model="lastName"
              class="p-3 border rounded-sm text-black"
              :class="errors.lastName ? 'border-red-400' : 'border-gray-400'"
              placeholder="Enter your last name"
            />
            <span v-if="errors.lastName" class="text-red-500 text-sm">{{ errors.lastName }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Email</label>
          <input
            v-model="email"
            type="email"
            class="p-3 border rounded-sm text-black"
            :class="errors.email ? 'border-red-400' : 'border-gray-400'"
            placeholder="Enter your email"
          />
          <span v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</span>
        </div>

        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Phone number</label>
          <input
            v-model="phone"
            class="p-3 border rounded-sm text-black"
            :class="errors.phone ? 'border-red-400' : 'border-gray-400'"
            placeholder="Phone number"
          />
          <span v-if="errors.phone" class="text-red-500 text-sm">{{ errors.phone }}</span>
        </div>

        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Date of Birth</label>
          <input
            v-model="dateOfBirth"
            type="date"
            class="p-3 border rounded-sm text-black"
            :class="errors.dateOfBirth ? 'border-red-400' : 'border-gray-400'"
          />
          <span v-if="errors.dateOfBirth" class="text-red-500 text-sm">{{ errors.dateOfBirth }}</span>
        </div>

        <div class="flex flex-col gap-1">
          <label class="body-1 text-gray-900">Country</label>
          <input
            v-model="country"
            class="p-3 border rounded-sm text-black"
            :class="errors.country ? 'border-red-400' : 'border-gray-400'"
            placeholder="Country"
          />
          <span v-if="errors.country" class="text-red-500 text-sm">{{ errors.country }}</span>
        </div>

        <!-- ACTION (DESKTOP) -->
        <div class="hidden lg:flex items-center justify-between">
          <Button type="button" variant="ghost" size="ghost" @click="handleBack">Back</Button>
          <Button type="submit" variant="primary">Next</Button>
        </div>
      </form>

      <!-- ===== RIGHT: SUMMARY ===== -->
      <div class="flex flex-col gap-4 lg:max-w-[358px]">
        <div class="bg-green-700 text-white">
          <div class="bg-green-800 p-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <BriefcaseBusiness color="#81A08F" />
              <span class="headline-5">Booking Detail</span>
            </div>
            <div class="bg-orange-800/60 text-orange-200 px-2 py-1 rounded-sm body-2">{{ timeLeft }}</div>
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
                <span>{{ formatDate(checkIn) }}</span>
                <span>-</span>
                <span>{{ formatDate(checkOut) }}</span>
              </div>
              <div class="body-1 py-1">{{ guestCount }} Guest{{ guestCount > 1 ? 's' : '' }} · {{ roomCount }} Room{{ roomCount > 1 ? 's' : '' }}</div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex justify-between py-[12px]">
                <span class="body-1 text-green-300">{{ roomTypeName }}</span>
                <span class="body-1 font-semibold!">{{ roomSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <div class="border-t border-green-600 pt-6 flex items-center justify-between">
                <span class="text-green-300">Total</span>
                <span class="headline-5">THB {{ bookingStore.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTE -->
        <ul class="bg-gray-300 p-4 space-y-5">
          <li class="flex gap-2">
            <div class="mt-2 w-2 h-2 bg-green-600 rounded-full shrink-0"></div>
            <p class="text-green-600">Cancel booking will get full refund if cancelation occurs before 24 hours.</p>
          </li>
          <li class="flex gap-2">
            <div class="mt-2 w-2 h-2 bg-green-600 rounded-full shrink-0"></div>
            <p class="text-green-600">Able to change booking within 24 hours.</p>
          </li>
        </ul>
      </div>

      <!-- ACTION (MOBILE) -->
      <div class="lg:hidden px-4 py-6 flex items-center justify-between">
        <Button variant="ghost" size="ghost" @click="handleBack">Back</Button>
        <Button variant="primary" @click="handleNext">Next</Button>
      </div>
    </div>
  </div>
</template>