import { z } from 'zod'

/** Example login form schema — parse before sending to Supabase or the API. */
export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
