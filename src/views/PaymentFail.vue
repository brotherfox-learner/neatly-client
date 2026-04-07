<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { CircleAlert } from 'lucide-vue-next'
const router = useRouter()

const handleRetry = () => {
  // bookingId อาจมีอยู่แล้วถ้า booking สร้างสำเร็จแต่ payment fail
  // PaymentMethod.vue จะ skip createBooking() ถ้า bookingId มีอยู่แล้ว
  router.push('/payment-method')
}

const handleBack = () => {
  router.push('/payment-method')
}
</script>

<template>
  <div class="max-w-[738px] mx-auto bg-background flex flex-col min-h-screen lg:py-[80px]">
    <!-- ===== CONTENT ===== -->
    <div class="flex-1 flex flex-col items-center justify-center text-center px-[24px] py-[88px] gap-6 bg-orange-100 lg:flex-none lg:pt-[64px]">
      <CircleAlert :size="64" color="#C14817" />
      <div class="flex flex-col gap-3">
        <h1 class="headline-3 text-orange-600">Payment failed</h1>
        <p class="body-2 text-orange-500">
          There seems to be an issue with your card. Please check your card details and try again
          later, or use a different payment method.
        </p>
      </div>
    </div>

    <!-- ACTION (MOBILE) -->
    <div class="lg:hidden px-4 py-6 flex flex-col items-center justify-between gap-[24px]">
      <Button variant="primary" class="w-full" @click="handleBack">Back to Payment details</Button>
      <Button variant="ghost" size="ghost" @click="handleRetry">Retry payment</Button>
    </div>
    <!-- ACTION (DESKTOP) -->
    <div class="hidden lg:flex items-center gap-[40px] mx-auto p-0 mt-[60px]">
      <Button variant="ghost" size="ghost" @click="handleRetry">Retry payment</Button>
      <Button variant="primary" @click="handleBack">Back to Payment details</Button>
    </div>
  </div>
</template>
