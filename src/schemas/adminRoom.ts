import { z } from "zod"

export const roomImageUploadResponseSchema = z.object({
  imageUrl: z.string().url(),
})

export type RoomImageUploadResponse = z.infer<typeof roomImageUploadResponseSchema>

/** Matches Spring JSON for `AdminRoomListItemResponse` (null fields may be omitted; Instant is ISO-8601, often with nanoseconds). */
export const adminRoomListItemSchema = z.object({
  roomId: z.string().uuid(),
  roomNumber: z.string().nullable().optional().transform((v) => (typeof v === "string" ? v.trim() : "")),
  status: z.string().nullable().optional().transform((v) => (typeof v === "string" && v.trim() ? v.trim() : "Vacant Clean")),
  imageUrl: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === "string" ? v : "")),
  roomType: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === "string" ? v.trim() : "")),
  price: z.coerce.number().optional().default(0),
  promotionPrice: z.coerce.number().nullable().optional(),
  guests: z.coerce.number().int().optional().default(0),
  bedType: z.string().nullable().optional(),
  roomSizeSqm: z.coerce.number().nullable().optional(),
  /** Spring/Jackson may serialize Instant as string, array, or omit. */
  updatedAt: z.unknown().optional(),
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
  bedType: z.string().nullable().optional(),
  roomSizeSqm: z.coerce.number().nullable().optional(),
  amenities: z.array(z.string()).default([]),
  mainImageUrl: z.string().default(""),
  galleryImageUrls: z.array(z.string()).default([]),
})

export type AdminRoomDetail = z.infer<typeof adminRoomDetailSchema>
