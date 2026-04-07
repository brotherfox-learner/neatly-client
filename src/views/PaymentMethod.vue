<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { CreditCardIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { HandCash } from '@iconoir/vue'
import { BriefcaseBusiness } from 'lucide-vue-next'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeCardElement } from '@stripe/stripe-js'
import { useBookingStore } from '@/stores/booking'
import { createBooking, createPaymentIntent, validatePromoCode, updatePaymentStatus } from '@/api/booking'
import { useBookingTimer } from '@/composables/useBookingTimer'
import BookingTimerModal from '@/components/BookingTimerModal.vue'

const router = useRouter()
const bookingStore = useBookingStore()
const { timeLeft, isExpiredModalOpen, extendTimer } = useBookingTimer()

// ── Dev mock ──────────────────────────────────────────────────────────────────
const roomTypeName = bookingStore.roomTypeName || 'Superior Garden View'
const roomCount = bookingStore.roomCount || 1
const checkIn = bookingStore.checkIn || '2025-10-19'
const checkOut = bookingStore.checkOut || '2025-10-21'
const guestCount = bookingStore.guests || 2

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

// ── Payment method selection ──────────────────────────────────────────────────
type PaymentMethod = 'card' | 'cash'
const selectedMethod = ref<PaymentMethod>('card')

// ── Stripe Elements ───────────────────────────────────────────────────────────
let stripeInstance: Stripe | null = null
let cardElement: StripeCardElement | null = null
const stripeError = ref('')

onMounted(async () => {
  stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  if (!stripeInstance) return
  const elements = stripeInstance.elements()
  cardElement = elements.create('card', {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        color: '#1a1d26',
        '::placeholder': { color: '#9AA1B9' },
      },
    },
  })
  cardElement.mount('#stripe-card-element')
  cardElement.on('change', (event) => {
    stripeError.value = event.error ? event.error.message : ''
  })
})

onUnmounted(() => {
  cardElement?.destroy()
})

// ── Promo code ────────────────────────────────────────────────────────────────
const promoInput = ref(bookingStore.promoCode)
const promoError = ref('')
const promoSuccess = ref('')
const isApplyingPromo = ref(false)

const applyPromo = async () => {
  if (!promoInput.value.trim()) return
  isApplyingPromo.value = true
  promoError.value = ''
  promoSuccess.value = ''
  try {
    const result = await validatePromoCode(promoInput.value.trim(), bookingStore.grandTotal)
    bookingStore.applyPromo(result.code, result.discountAmount)
    promoInput.value = result.code
    promoSuccess.value = `Promo applied! You save THB ${result.discountAmount.toLocaleString()}`
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Invalid promo code'
    promoError.value = msg
  } finally {
    isApplyingPromo.value = false
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
const selectedExtras = computed(() => bookingStore.selectedExtras)

// ── Loading state ─────────────────────────────────────────────────────────────
const isSubmitting = ref(false)

// ── Confirm booking ───────────────────────────────────────────────────────────
const handleConfirm = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  stripeError.value = ''

  bookingStore.setPaymentMethod(selectedMethod.value)

  try {
    // ถ้ามี bookingId อยู่แล้ว (กรณี Retry) → ข้าม createBooking
    if (!bookingStore.bookingId) {
      const res = await createBooking({
        roomTypeId: bookingStore.roomTypeId ?? 'mock-room-type-id',
        roomCount: bookingStore.roomCount,
        checkInDate: bookingStore.checkIn ?? checkIn,
        checkOutDate: bookingStore.checkOut ?? checkOut,
        guests: bookingStore.guests,
        guestInfo: bookingStore.guestInfo,
        extraServiceIds: bookingStore.selectedExtraIds,
        standardRequests: bookingStore.standardRequests,
        additionalRequest: bookingStore.additionalRequest,
        promoCode: bookingStore.promoCode || undefined,
        paymentMethod: selectedMethod.value === 'card' ? 'CARD' : 'CASH',
      })
      bookingStore.setBookingId(res.bookingId)
    }

    if (selectedMethod.value === 'cash') {
      router.push('/payment-success')
      return
    }

    // ── Card flow via Stripe ───────────────────────────────────────────────
    if (!stripeInstance || !cardElement) {
      stripeError.value = 'Stripe is not ready. Please refresh and try again.'
      return
    }

    const { clientSecret } = await createPaymentIntent({ bookingId: bookingStore.bookingId! })

    const { error: stripeConfirmError } = await stripeInstance.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (stripeConfirmError) {
      stripeError.value = stripeConfirmError.message ?? 'Payment failed'
      await updatePaymentStatus(bookingStore.bookingId!, 'FAILED').catch(() => {})
      router.push('/payment-fail')
      return
    }

    await updatePaymentStatus(bookingStore.bookingId!, 'PAID').catch(() => {})
    router.push('/payment-success')
  } catch (err) {
    console.error('[BOOKING] handleConfirm failed', err)
    router.push('/payment-fail')
  } finally {
    isSubmitting.value = false
  }
}

const handleBack = () => {
  router.push('/payment-request')
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
        <!-- Step 1 (done) -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-orange-100 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-orange-500">1</span>
          </div>
          <span class="headline-5 text-gray-900">Basic Information</span>
        </div>
        <!-- Step 2 (done) -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-orange-100 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-orange-500">2</span>
          </div>
          <span class="headline-5 text-gray-900">Special Request</span>
        </div>
        <!-- Step 3 (active) -->
        <div class="flex items-center gap-4">
          <div class="w-[66px] h-[50px] lg:h-[66px] bg-orange-500 rounded-sm flex items-center justify-center">
            <span class="headline-4 text-white">3</span>
          </div>
          <span class="headline-5 text-orange-500">Payment Method</span>
        </div>
      </div>
    </div>

    <!-- ===== MAIN ===== -->
    <div class="flex flex-col lg:flex-row lg:gap-6">
      <!-- ===== LEFT ===== -->
      <div class="grow bg-white border border-gray-300 rounded-sm px-4 py-6 flex flex-col gap-10 lg:p-10">

        <!-- SELECT PAYMENT METHOD -->
        <div class="flex gap-2 lg:gap-4">
          <button
            class="flex-1 py-[14px] rounded-sm border shadow-1 flex items-center justify-center gap-2 cursor-pointer lg:py-[24px] lg:headline-5 transition-colors"
            :class="selectedMethod === 'card' ? 'border-orange-500 text-orange-500' : 'border-gray-300 text-gray-600 hover:border-orange-500'"
            @click="selectedMethod = 'card'"
          >
            <CreditCardIcon class="w-8 h-8" />
            Credit Card
          </button>
          <button
            class="flex-1 py-[14px] rounded-sm border shadow-1 flex items-center justify-center gap-2 cursor-pointer lg:py-[24px] lg:headline-5 transition-colors"
            :class="selectedMethod === 'cash' ? 'border-orange-500 text-orange-500' : 'border-gray-300 text-gray-600 hover:border-orange-500'"
            @click="selectedMethod = 'cash'"
          >
            <BanknotesIcon class="w-8 h-8" />
            Cash
          </button>
        </div>

        <!-- CARD FORM -->
        <div v-show="selectedMethod === 'card'" class="flex flex-col gap-6 lg:gap-10">
          <h2 class="headline-5 text-gray-600 lg:text-gray-800">Credit Card</h2>

          <div class="flex flex-col gap-1">
            <label class="body-1 text-gray-900">Card Details</label>
            <div
              id="stripe-card-element"
              class="border border-gray-400 rounded-sm p-3 bg-white"
            />
            <span v-if="stripeError" class="text-red-500 text-sm">{{ stripeError }}</span>
          </div>

          <!-- PROMO -->
          <div class="border-t py-6">
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900">Promotion Code</label>
              <div class="flex gap-2">
                <input v-model="promoInput" class="border border-gray-400 rounded-sm p-3 pr-4 uppercase flex-1" placeholder="Enter code" />
                <Button variant="secondary" size="ghost" class="px-4 py-3" :disabled="isApplyingPromo" @click="applyPromo">Apply</Button>
              </div>
              <span v-if="promoError" class="text-red-500 text-sm">{{ promoError }}</span>
              <span v-if="promoSuccess" class="text-green-600 text-sm">{{ promoSuccess }}</span>
            </div>
          </div>
        </div>

        <!-- CASH INFO -->
        <div v-show="selectedMethod === 'cash'" class="flex flex-col gap-6 lg:gap-10">
          <h2 class="headline-5 text-gray-600 lg:text-gray-800">Cash</h2>
          <div class="bg-gray-200 px-6 py-4 rounded-sm flex gap-4 items-center">
            <HandCash class="w-[50px] h-[50px] text-[#E76B39]" />
            <p class="body-1 text-gray-900 flex-1">Pay at the hotel with cash or cheque. No payment is required until you check in</p>
          </div>

          <!-- PROMO -->
          <div class="border-t py-6">
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900">Promotion Code</label>
              <div class="flex gap-2">
                <input v-model="promoInput" class="border border-gray-400 rounded-sm p-3 pr-4 uppercase flex-1" placeholder="Enter code" />
                <Button variant="secondary" size="ghost" class="px-4 py-3" :disabled="isApplyingPromo" @click="applyPromo">Apply</Button>
              </div>
              <span v-if="promoError" class="text-red-500 text-sm">{{ promoError }}</span>
              <span v-if="promoSuccess" class="text-green-600 text-sm">{{ promoSuccess }}</span>
            </div>
          </div>
        </div>

        <!-- ACTION (DESKTOP) -->
        <div class="hidden lg:flex items-center justify-between">
          <Button variant="ghost" size="ghost" @click="handleBack">Back</Button>
          <Button variant="primary" :disabled="isSubmitting" @click="handleConfirm">
            {{ isSubmitting ? 'Processing...' : 'Confirm Booking' }}
          </Button>
        </div>
      </div>

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

            <div>
              <div class="body-1 py-1 flex flex-row gap-2">
                <span>{{ formatDate(checkIn) }}</span>
                <span>-</span>
                <span>{{ formatDate(checkOut) }}</span>
              </div>
              <div class="body-1 py-1">{{ guestCount }} Guest{{ guestCount > 1 ? 's' : '' }} · {{ roomCount }} Room{{ roomCount > 1 ? 's' : '' }}</div>
            </div>

            <div class="flex flex-col gap-4">
              <div>
                <div class="flex justify-between py-[12px]">
                  <span class="body-1 text-green-300">{{ roomTypeName }}</span>
                  <span class="body-1 font-semibold!">{{ bookingStore.roomSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div v-for="extra in selectedExtras" :key="extra.id" class="flex justify-between py-[12px]">
                  <span class="body-1 text-green-300">{{ extra.name }}</span>
                  <span class="body-1 font-semibold!">{{ extra.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div v-if="bookingStore.discountAmount > 0" class="flex justify-between py-[12px]">
                  <span class="body-1 text-green-300">Promo ({{ bookingStore.promoCode }})</span>
                  <span class="body-1 font-semibold! text-orange-300">-{{ bookingStore.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                </div>
              </div>

              <div class="border-t border-green-600 pt-6 flex items-center justify-between">
                <span class="body-1 text-green-300">Total</span>
                <span class="headline-5">THB {{ bookingStore.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTE -->
        <ul class="bg-gray-300 p-4 space-y-5">
          <li class="flex gap-2">
            <div class="mt-2 w-1 h-1 bg-green-600 rounded-full shrink-0"></div>
            <p class="body-3 text-green-600">Cancel booking will get full refund if the cancelation occurs before 24 hours of the check-in date.</p>
          </li>
          <li class="flex gap-2">
            <div class="mt-2 w-1 h-1 bg-green-600 rounded-full shrink-0"></div>
            <p class="body-3 text-green-600">Able to change check-in or check-out date booking within 24 hours of the booking date</p>
          </li>
        </ul>
      </div>

      <!-- ACTION (MOBILE) -->
      <div class="lg:hidden px-4 py-6 flex items-center justify-between">
        <Button variant="ghost" size="ghost" @click="handleBack">Back</Button>
        <Button variant="primary" :disabled="isSubmitting" @click="handleConfirm">
          {{ isSubmitting ? 'Processing...' : 'Confirm Booking' }}
        </Button>
      </div>
    </div>
  </div>
</template>
