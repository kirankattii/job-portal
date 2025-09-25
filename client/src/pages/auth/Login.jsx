import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import InputField from '@/components/forms/InputField'
import Button from '@/components/ui/Button'
import { VALIDATION_MESSAGES } from '@/constants'

const loginSchema = z.object({
  email: z
    .string({ required_error: VALIDATION_MESSAGES.REQUIRED })
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z
    .string({ required_error: VALIDATION_MESSAGES.REQUIRED })
    .min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional().default(false),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const { login, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = async (values) => {
    const { email, password, remember } = values
    const res = await login({ email, password })
    if (res.success) {
      if (!remember) {
        // If not remembering, sessionStorage can be used in future; for now do nothing special
      }
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Email" name="email" type="email" register={register} error={errors.email} />
        <InputField label="Password" name="password" type="password" register={register} error={errors.password} />
        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('remember')} className="rounded border-gray-300" />
            Remember me
          </label>
          <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full">Sign in</Button>
        <p className="text-sm text-gray-600">
          Dont have an account?{' '}
          <Link to="/auth/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}


