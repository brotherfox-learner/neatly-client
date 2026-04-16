import { z } from "zod"

/** Matches `AdminCustomerBookingListItemResponse` (list ordered by `updatedAt` desc on server). */
export const adminCustomerBookingListItemSchema = z.object({
  bookingId: z.string().uuid(),
  customerName: z.string(),
  guestNumbers: z.string().nullable().optional(),
  roomTypeName: z.string().nullable().optional(),
  amountLabel: z.string().nullable().optional(),
  subtotal: z.coerce.number().nullable().optional(),
  discountAmount: z.coerce.number().nullable().optional(),
  totalAmount: z.coerce.number().nullable().optional(),
  bedType: z.string().nullable().optional(),
  checkInDate: z.string().nullable().optional(),
  checkOutDate: z.string().nullable().optional(),
  totalNights: z.coerce.number().int().nullable().optional(),
  stayTotalLabel: z.string().nullable().optional(),
  bookingCreatedAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
})

export type AdminCustomerBookingListItem = z.infer<typeof adminCustomerBookingListItemSchema>
