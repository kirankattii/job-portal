import { z } from 'zod'

export const emailSchema = z.string().email('Please enter a valid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const nonEmptyString = (msg = 'This field is required') => z.string().min(1, msg)
export const optionalString = z.string().optional().nullable()

export const validateWith = (schema, data) => {
  const result = schema.safeParse(data)
  if (result.success) return { valid: true, data: result.data }
  const firstError = result.error.errors?.[0]
  return { valid: false, error: firstError?.message || 'Invalid input', details: result.error.format() }
}


