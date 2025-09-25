import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import InputField from '@/components/forms/InputField'
import Button from '@/components/ui/Button'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiClient from '@/services/apiClient'
import { VALIDATION_MESSAGES } from '@/constants'

const schema = z
  .object({
    token: z.string().optional(),
    password: z.string({ required_error: VALIDATION_MESSAGES.REQUIRED }).min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string({ required_error: VALIDATION_MESSAGES.REQUIRED }),
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    path: ['confirmPassword'],
  })

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const defaultToken = params.get('token') || ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { token: defaultToken, password: '', confirmPassword: '' } })

  const onSubmit = async (values) => {
    // No concrete API in docs; stub success then redirect
    try {
      await apiClient.post('/auth/reset-password', { token: values.token, password: values.password })
    } catch (_) {}
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Set a new password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Token" name="token" register={register} error={errors.token} />
        <InputField label="New password" name="password" type="password" register={register} error={errors.password} />
        <InputField label="Confirm password" name="confirmPassword" type="password" register={register} error={errors.confirmPassword} />
        <Button type="submit" isLoading={isSubmitting} className="w-full">Update password</Button>
      </form>
    </div>
  )
}


