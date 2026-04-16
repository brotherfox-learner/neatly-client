import { computed, onUnmounted, ref } from 'vue'
import { useBookingStore } from '@/stores/booking'

const TIMER_DURATION_MS = 5 * 60 * 1000 // 5 นาที
const EXTEND_DURATION_MS = 5 * 60 * 1000 // ต่อเวลา +5 นาที

export function useBookingTimer() {
  const bookingStore = useBookingStore()

  const now = ref(Date.now())
  const isExpiredModalOpen = ref(false)

  const interval = setInterval(() => {
    now.value = Date.now()

    if (
      bookingStore.timerStartedAt !== null &&
      !isExpiredModalOpen.value &&
      now.value - bookingStore.timerStartedAt >= TIMER_DURATION_MS
    ) {
      isExpiredModalOpen.value = true
    }
  }, 1000)

  onUnmounted(() => clearInterval(interval))

  // mm:ss ที่เหลืออยู่
  const timeLeft = computed(() => {
    if (bookingStore.timerStartedAt === null) return '05:00'
    const elapsed = now.value - bookingStore.timerStartedAt
    const remaining = Math.max(0, TIMER_DURATION_MS - elapsed)
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const isExpired = computed(() => {
    if (bookingStore.timerStartedAt === null) return false
    return Date.now() - bookingStore.timerStartedAt >= TIMER_DURATION_MS
  })

  // กด "ดำเนินการต่อ" — reset timer +5 นาที
  const extendTimer = () => {
    bookingStore.timerStartedAt = Date.now()
    isExpiredModalOpen.value = false
  }

  return {
    timeLeft,
    isExpired,
    isExpiredModalOpen,
    extendTimer,
  }
}
