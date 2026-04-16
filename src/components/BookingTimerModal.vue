<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useBookingStore } from '@/stores/booking'
import { Clock } from 'lucide-vue-next'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ extend: [] }>()

const router = useRouter()
const bookingStore = useBookingStore()

const handleSearchAgain = () => {
  bookingStore.reset()
  router.push('/search')
}

const handleExtend = () => {
  emit('extend')
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-[343px] flex flex-col overflow-hidden">
        <!-- HEADER -->
        <div class="bg-orange-500 px-4 py-3 flex items-center gap-3">
          <Clock class="w-6 h-6 text-white shrink-0" />
          <h2 class="headline-5 text-white">Session timed out</h2>
        </div>

        <!-- BODY -->
        <div class="px-4 py-3 flex flex-col gap-1.5">
          <p class="body-1 text-gray-900 leading-relaxed">Your booking session has expired.</p>
          <p class="body-1 text-gray-600 leading-relaxed">Continue where you left off, or start a new search.</p>
        </div>

        <!-- ACTIONS -->
        <div class="px-4 py-3 flex items-center justify-between gap-4">
          <Button variant="ghost" size="ghost" @click="handleSearchAgain" class="text-gray-500 underline underline-offset-2">
            Search again
          </Button>
          <Button variant="primary" size="ghost" @click="handleExtend" class="rounded-xl">
            Continue booking
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
