import { z } from "zod"

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().max(100).nullable(),
  lastName: z.string().trim().max(100).nullable(),
  phone: z.string().trim().max(50).nullable(),
  country: z.string().trim().max(100).nullable(),
  dateOfBirth: z.string().trim().nullable(),
  avatarUrl: z.string().trim().max(500).nullable(),
})

export type ProfileUpdatePayload = z.infer<typeof profileUpdateSchema>

export const avatarUploadResponseSchema = z.object({
  avatarUrl: z.string().url(),
})

export type AvatarUploadResponse = z.infer<typeof avatarUploadResponseSchema>
