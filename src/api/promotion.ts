import { api } from '@/lib/api'

export type CreatePromotionPayload = {
  code: string
  discountType: 'FIXED' | 'PERCENTAGE'
  discountValue: number
  maxDiscount?: number
  minSpend?: number
  usageLimit?: number
  startDate?: string
  endDate?: string
}

export type PromotionResponse = {
  id: string
  code: string
  discountType: 'FIXED' | 'PERCENTAGE'
  discountValue: number
  maxDiscount: number | null
  minSpend: number
  usageLimit: number | null
  perUserLimit: number | null
  usedCount: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

export async function createPromotion(payload: CreatePromotionPayload) {
  const { data } = await api.post('/api/v1/admin/promotion', payload)
  return data
}

export async function getPromotions(): Promise<PromotionResponse[]> {
  const { data } = await api.get<PromotionResponse[]>('/api/v1/admin/promotion')
  return data
}

export async function togglePromotionActive(id: string): Promise<PromotionResponse> {
  const { data } = await api.patch<PromotionResponse>(`/api/v1/admin/promotion/${id}/toggle-active`)
  return data
}