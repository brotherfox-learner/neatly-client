import { z } from "zod"

export const roomImageUploadResponseSchema = z.object({
  imageUrl: z.string().url(),
})

export type RoomImageUploadResponse = z.infer<typeof roomImageUploadResponseSchema>

/** Matches Spring JSON for `AdminRoomListItemResponse` (null fields may be omitted; Instant is ISO-8601, often with nanoseconds). */
export const adminRoomListItemSchema = z.object({
  roomId: z.string().uuid(),
  imageUrl: z.string(),
  roomType: z.string(),
  price: z.coerce.number(),
  promotionPrice: z.coerce.number().nullable().optional(),
  guests: z.coerce.number().int(),
  bedType: z.string().nullable().optional(),
  roomSizeSqm: z.coerce.number().nullable().optional(),
  updatedAt: z.union([z.string(), z.null()]).optional(),
})

export const adminRoomListSchema = z.array(adminRoomListItemSchema)

export type AdminRoomListItem = z.infer<typeof adminRoomListItemSchema>

export const adminRoomDetailSchema = z.object({
  roomId: z.string().uuid(),
  roomTypeName: z.string(),
  description: z.string().nullable().optional(),
  maxOccupancy: z.coerce.number().int(),
  basePrice: z.coerce.number(),
  discountedPrice: z.coerce.number().nullable().optional(),
  bedType: z.string(),
  roomSizeSqm: z.coerce.number(),
  amenities: z.array(z.string()).default([]),
  mainImageUrl: z.string().default(""),
  galleryImageUrls: z.array(z.string()).default([]),
})

export type AdminRoomDetail = z.infer<typeof adminRoomDetailSchema>
