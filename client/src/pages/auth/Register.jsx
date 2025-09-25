import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import InputField from '@/components/forms/InputField'
import Button from '@/components/ui/Button'
import useAuthStore from '@/stores/authStore'
import { VALIDATION_MESSAGES } from '@/constants'

const step1Schema = z.object({
  email: z.string({ required_error: VALIDATION_MESSAGES.REQUIRED }).email(VALIDATION_MESSAGES.EMAIL_INVALID),
  name: z.string({ required_error: VALIDATION_MESSAGES.REQUIRED }).min(2, 'Name must be at least 2 characters'),
})

const step2Schema = z.object({
  otp: z.string({ required_error: VALIDATION_MESSAGES.REQUIRED }).min(4, 'Enter the 6-digit OTP').max(6),
})

const step3Schema = z
  .object({
    password: z.string({ required_error: VALIDATION_MESSAGES.REQUIRED }).min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string({ required_error: VALIDATION_MESSAGES.REQUIRED }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    path: ['confirmPassword'],
  })

export default function Register() {
  const navigate = useNavigate()
  const { registerRequest, verifyOtp, resendOtp, isLoading } = useAuthStore()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const form1 = useForm({ resolver: zodResolver(step1Schema), defaultValues: { email: '', name: '' } })
  const form2 = useForm({ resolver: zodResolver(step2Schema), defaultValues: { otp: '' } })
  const form3 = useForm({ resolver: zodResolver(step3Schema), defaultValues: { password: '', confirmPassword: '' } })

  const submitStep1 = async (values) => {
    const res = await registerRequest(values)
    if (res.success) {
      setEmail(values.email)
      setName(values.name)
      setStep(2)
    }
  }

  const submitStep2 = async (values) => {
    // Move to password setup; verification occurs with password in step 3
    setStep(3)
  }

  const submitStep3 = async (values) => {
    const res = await verifyOtp({ email, otp: form2.getValues('otp'), password: values.password, name })
    if (res.success) {
      navigate('/user/dashboard', { replace: true })
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold">Create your account</h1>
      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className={step >= 1 ? 'font-semibold' : ''}>1. Details</span>
        <span>›</span>
        <span className={step >= 2 ? 'font-semibold' : ''}>2. Verify</span>
        <span>›</span>
        <span className={step >= 3 ? 'font-semibold' : ''}>3. Password</span>
      </div>

      {step === 1 && (
        <form onSubmit={form1.handleSubmit(submitStep1)} className="space-y-4">
          <InputField label="Email" name="email" type="email" register={form1.register} error={form1.formState.errors.email} />
          <InputField label="Full name" name="name" register={form1.register} error={form1.formState.errors.name} />
          <Button type="submit" isLoading={isLoading} className="w-full">Continue</Button>
          <p className="text-sm text-gray-600">Already have an account? <Link to="/auth/login" className="text-blue-600 hover:underline">Login</Link></p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={form2.handleSubmit(submitStep2)} className="space-y-4">
          <p className="text-sm text-gray-600">We sent an OTP to <span className="font-medium">{email}</span></p>
          <InputField label="OTP" name="otp" register={form2.register} error={form2.formState.errors.otp} />
          <div className="flex items-center justify-between">
            <Button type="button" onClick={async () => email && (await resendOtp({ email }))} className="" disabled={!email}>
              Resend OTP
            </Button>
            <Button type="submit" isLoading={isLoading}>Next</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={form3.handleSubmit(submitStep3)} className="space-y-4">
          <InputField label="Password" name="password" type="password" register={form3.register} error={form3.formState.errors.password} />
          <InputField label="Confirm password" name="confirmPassword" type="password" register={form3.register} error={form3.formState.errors.confirmPassword} />
          <Button type="submit" isLoading={isLoading} className="w-full">Create account</Button>
        </form>
      )}
    </div>
  )
}


