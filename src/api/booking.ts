import { api } from '@/lib/api'
import type { ExtraService } from '@/stores/booking'

export type PricingType = 'per_day' | 'per_night' | 'per_stay' | 'per_trip'
export type ChargeUnit = 'per_person' | 'per_room'

export interface CreateBookingPayload {
  roomTypeId: string
  roomCount: number
  checkInDate: string
  checkOutDate: string
  guests: number
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    country: string
  }
  extraServiceIds?: string[]
  standardRequests?: string[]
  additionalRequest?: string
  promoCode?: string
  paymentMethod: 'CARD' | 'CASH'
}

export interface CreateBookingResponse {
  bookingId: string
}

export interface CreatePaymentIntentPayload {
  bookingId: string
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

// Hardcoded mock สำหรับ fallback เมื่อ API ยังไม่มีข้อมูล
const MOCK_EXTRA_SERVICES: ExtraService[] = [
  { id: 'mock-1', name: 'Baby cot', description: 'Baby cot for infant', type: 'SPECIAL', price: 400, pricingType: 'per_stay', chargeUnit: 'per_room' },
  { id: 'mock-2', name: 'Airport transfer', description: 'Pick-up from airport', type: 'SPECIAL', price: 200, pricingType: 'per_trip', chargeUnit: 'per_room' },
  { id: 'mock-3', name: 'Extra bed', description: 'Additional bed in room', type: 'SPECIAL', price: 500, pricingType: 'per_night', chargeUnit: 'per_room' },
  { id: 'mock-4', name: 'Extra pillows', description: null, type: 'SPECIAL', price: 100, pricingType: 'per_stay', chargeUnit: 'per_room' },
  { id: 'mock-5', name: 'Phone chargers and adapters', description: null, type: 'SPECIAL', price: 100, pricingType: 'per_stay', chargeUnit: 'per_room' },
  { id: 'mock-6', name: 'Breakfast', description: 'Breakfast per person per day', type: 'SPECIAL', price: 150, pricingType: 'per_night', chargeUnit: 'per_person' },
]

export async function createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
  const { data } = await api.post<CreateBookingResponse>('/api/v1/bookings', payload)
  return data
}

export async function getExtraServices(): Promise<ExtraService[]> {
  try {
    const { data } = await api.get<ExtraService[]>('/api/v1/extra-services')
    // ถ้า API ตอบกลับมาแต่ว่าง → ใช้ mock แทน
    if (Array.isArray(data) && data.length > 0) return data
    return MOCK_EXTRA_SERVICES
  } catch {
    // API ยังไม่มีหรือ error → fallback mock
    return MOCK_EXTRA_SERVICES
  }
}

export interface ValidatePromoResponse {
  code: string
  discountAmount: number
  discountType: string
}

export async function validatePromoCode(
  code: string,
  orderTotal: number,
): Promise<ValidatePromoResponse> {
  const { data } = await api.post<ValidatePromoResponse>('/api/v1/promotions/validate', {
    code,
    orderTotal,
  })
  return data
}

export async function createPaymentIntent(
  payload: CreatePaymentIntentPayload,
): Promise<CreatePaymentIntentResponse> {
  const { data } = await api.post<CreatePaymentIntentResponse>(
    '/api/v1/payments/create-intent',
    payload,
  )
  return data
}

export async function updatePaymentStatus(
  bookingId: string,
  status: 'PAID' | 'FAILED',
): Promise<void> {
  await api.patch(`/api/v1/payments/${bookingId}/status`, { status })
}
