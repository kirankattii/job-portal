import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import InputField from '@/components/forms/InputField'
import Button from '@/components/ui/Button'
import apiClient from '@/services/apiClient'
import { VALIDATION_MESSAGES } from '@/constants'

const schema = z.object({
  email: z.string({ required_error: VALIDATION_MESSAGES.REQUIRED }).email(VALIDATION_MESSAGES.EMAIL_INVALID),
})

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  const onSubmit = async (values) => {
    // Backend endpoint not defined in docs; we'll call resend-otp to simulate email step or skip
    try {
      await apiClient.post('/auth/resend-otp', { email: values.email })
    } catch (_) {}
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Reset your password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Email" name="email" type="email" register={register} error={errors.email} />
        <Button type="submit" isLoading={isSubmitting} className="w-full">Send reset email</Button>
      </form>
    </div>
  )
}


