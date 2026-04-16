import { z } from 'zod'

/** Matches `UserResponse` from the Spring API (`/api/v1/me`). */
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  active: z.boolean(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
})

export type UserResponse = z.infer<typeof userResponseSchema>
