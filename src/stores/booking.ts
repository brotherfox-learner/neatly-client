import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { PricingType, ChargeUnit } from '@/api/booking'

export interface ExtraService {
  id: string
  name: string
  description: string | null
  type: string
  price: number
  pricingType: PricingType
  chargeUnit: ChargeUnit
}

export function calcServicePrice(
  service: ExtraService,
  nights: number,
  guests: number,
  rooms: number,
): number {
  const pricingMultiplier =
    service.pricingType === 'per_day' || service.pricingType === 'per_night' ? nights : 1
  const chargeMultiplier = service.chargeUnit === 'per_person' ? guests : rooms
  return service.price * pricingMultiplier * chargeMultiplier
}

export interface GuestInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  country: string
}

export const useBookingStore = defineStore('booking', () => {
  // ── Room info (set by "Book Now") ──────────────────────────────────────────
  const roomTypeId = ref<string | null>(null)
  const roomTypeName = ref<string>('')
  const pricePerNight = ref<number>(0)
  const roomCount = ref<number>(1)
  const roomImage = ref<string>('')

  // ── Dates & guests ──────────────────────────────────────────────────────────
  const checkIn = ref<string | null>(null)
  const checkOut = ref<string | null>(null)
  const guests = ref<number>(1)

  // ── Step 1: Guest info ──────────────────────────────────────────────────────
  const guestInfo = ref<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    country: '',
  })

  // ── Step 2: Extras & requests ───────────────────────────────────────────────
  const extraServices = ref<ExtraService[]>([])
  const selectedExtraIds = ref<string[]>([])
  const standardRequests = ref<string[]>([])
  const additionalRequest = ref<string>('')

  // ── Step 3: Payment ─────────────────────────────────────────────────────────
  const promoCode = ref<string>('')
  const discountAmount = ref<number>(0)
  const paymentMethod = ref<'card' | 'cash' | null>(null)

  // ── Result ──────────────────────────────────────────────────────────────────
  const bookingId = ref<string | null>(null)
  const isRetrying = ref(false)
  const savedPaymentMethodId = ref<string | null>(null)

  // ── Timer ────────────────────────────────────────────────────────────────────
  const timerStartedAt = ref<number | null>(null)

  // ── Computed ────────────────────────────────────────────────────────────────
  const totalNights = computed(() => {
    if (!checkIn.value || !checkOut.value) return 0
    const diff = new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime()
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
  })

  const roomSubtotal = computed(() => pricePerNight.value * totalNights.value * roomCount.value)

  const selectedExtras = computed(() =>
    extraServices.value.filter((s) => selectedExtraIds.value.includes(s.id)),
  )

  const extrasTotal = computed(() =>
    selectedExtras.value.reduce(
      (sum, s) => sum + calcServicePrice(s, totalNights.value, guests.value, roomCount.value),
      0,
    ),
  )

  const grandTotal = computed(() =>
    Math.max(0, roomSubtotal.value + extrasTotal.value - discountAmount.value),
  )

  // ── Actions ─────────────────────────────────────────────────────────────────
  function setRoom(payload: {
    roomTypeId: string
    roomTypeName: string
    pricePerNight: number
    roomImage: string
    checkIn: string
    checkOut: string
    guests: number
    roomCount: number
  }) {
    roomTypeId.value = payload.roomTypeId
    roomTypeName.value = payload.roomTypeName
    pricePerNight.value = payload.pricePerNight
    roomImage.value = payload.roomImage
    checkIn.value = payload.checkIn
    checkOut.value = payload.checkOut
    guests.value = payload.guests
    roomCount.value = payload.roomCount
  }

  function setGuestInfo(info: GuestInfo) {
    guestInfo.value = { ...info }
  }

  function setExtras(payload: {
    selectedExtraIds: string[]
    standardRequests: string[]
    additionalRequest: string
  }) {
    selectedExtraIds.value = payload.selectedExtraIds
    standardRequests.value = payload.standardRequests
    additionalRequest.value = payload.additionalRequest
  }

  function applyPromo(code: string, discount: number) {
    promoCode.value = code
    discountAmount.value = discount
  }

  function setPaymentMethod(method: 'card' | 'cash') {
    paymentMethod.value = method
  }

  function setBookingId(id: string) {
    bookingId.value = id
  }

  function startTimer() {
    timerStartedAt.value = Date.now()
  }

  function reset() {
    roomTypeId.value = null
    roomTypeName.value = ''
    pricePerNight.value = 0
    roomCount.value = 1
    roomImage.value = ''
    checkIn.value = null
    checkOut.value = null
    guests.value = 1
    guestInfo.value = { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', country: '' }
    extraServices.value = []
    selectedExtraIds.value = []
    standardRequests.value = []
    additionalRequest.value = ''
    promoCode.value = ''
    discountAmount.value = 0
    paymentMethod.value = null
    bookingId.value = null
    isRetrying.value = false
    savedPaymentMethodId.value = null
    timerStartedAt.value = null
  }

  return {
    // state
    roomTypeId,
    roomTypeName,
    pricePerNight,
    roomCount,
    roomImage,
    checkIn,
    checkOut,
    guests,
    guestInfo,
    extraServices,
    selectedExtraIds,
    standardRequests,
    additionalRequest,
    promoCode,
    discountAmount,
    paymentMethod,
    bookingId,
    isRetrying,
    savedPaymentMethodId,
    // computed
    totalNights,
    roomSubtotal,
    selectedExtras,
    extrasTotal,
    grandTotal,
    // timer
    timerStartedAt,
    startTimer,
    // actions
    setRoom,
    setGuestInfo,
    setExtras,
    applyPromo,
    setPaymentMethod,
    setBookingId,
    reset,
  }
})