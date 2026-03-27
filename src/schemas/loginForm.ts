import { z } from 'zod'

/** ตัวอย่าง schema ฟอร์ม login — ใช้ parse ก่อนส่งไป Supabase หรือ API */
export const loginFormSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านอย่างน้อย 8 ตัวอักษร'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
