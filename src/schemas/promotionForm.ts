import { z } from 'zod'

export const promotionFormSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Please enter promo code')
      .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, - or _ only'),

    discountType: z.enum(['FIXED', 'PERCENTAGE']),

    discountValue: z.number({ message: 'Please enter discount value' }),

    maxDiscount: z
      .number({ message: 'Must be greater than 0' })
      .positive('Must be greater than 0')
      .optional()
      .nullable()
      .transform((v) => v ?? undefined),
    minSpend: z
      .number({ message: 'Must be 0 or more' })
      .min(0, 'Must be 0 or more')
      .optional()
      .nullable()
      .transform((v) => v ?? undefined),
    usageLimit: z
      .number({ message: 'Must be at least 1' })
      .int()
      .positive('Must be at least 1')
      .optional()
      .nullable()
      .transform((v) => v ?? undefined),
    startDate: z.string().min(1, 'Please select valid from date'),
    endDate: z.string().min(1, 'Please select valid to date'),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'PERCENTAGE') {
      if (data.discountValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Discount percentage must be greater than 0%',
        })
      }
      if (data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Discount percentage cannot exceed 100%',
        })
      }
    }
    if (data.discountType === 'FIXED' && data.discountValue <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'Fixed amount must be greater than 0',
      })
    }
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'Valid To must be after Valid From',
    path: ['endDate'],
  })

export type PromotionFormValues = z.infer<typeof promotionFormSchema>
