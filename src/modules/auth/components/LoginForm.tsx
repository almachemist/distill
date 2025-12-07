'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import type { LoginCredentials } from '@/modules/shared/types/auth.types'
import Link from 'next/link'

interface LoginFormData extends LoginCredentials {
  // Extends LoginCredentials with no additional fields
}

export function LoginForm() {
  const router = useRouter()
  const { login, loginWithOtp, resetPassword, resendConfirmationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await login(data)
      router.push('/dashboard')
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      if (errorMessage.startsWith('[400]')) {
        errorMessage = 'Invalid email or password, or email is not confirmed.'
      }
      // Clean up error messages that might contain JSON objects
      if (errorMessage.includes('{') && errorMessage.includes('}')) {
        errorMessage = errorMessage.split(':')[0].trim()
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = getValues('email')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await resetPassword(email)
      setResetEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    const email = getValues('email')
    if (!email) {
      setError('Please enter your email address to resend confirmation')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await resendConfirmationEmail(email)
      setError('Confirmation email sent. Please check your inbox.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend confirmation email')
    } finally {
      setIsLoading(false)
    }
  }

  if (showForgotPassword && !resetEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reset Password</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false)
                setError(null)
              }}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (resetEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Check Your Email</h2>
        <p className="text-gray-600 mb-4">
          Reset email sent! Check your inbox for password reset instructions.
        </p>
        <button
          onClick={() => {
            setShowForgotPassword(false)
            setResetEmailSent(false)
            setError(null)
          }}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="block w-full text-center text-sm text-blue-600 hover:text-blue-800"
        >
          Forgot Password?
        </button>
        <button
          type="button"
          onClick={async () => {
            const email = getValues('email')
            if (!email) {
              setError('Please enter your email address to send a magic link')
              return
            }
            setIsLoading(true)
            setError(null)
            try {
              await loginWithOtp(email)
              setError('Magic link sent. Check your inbox to sign in.')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to send magic link')
            } finally {
              setIsLoading(false)
            }
          }}
          className="block w-full text-center text-sm text-blue-600 hover:text-blue-800"
        >
          Sign In with Magic Link
        </button>
        <button
          type="button"
          onClick={handleResendConfirmation}
          className="block w-full text-center text-sm text-blue-600 hover:text-blue-800"
        >
          Resend Confirmation Email
        </button>
        {process.env.NEXT_PUBLIC_ALLOW_TEST_LOGIN === 'true' && (
          <button
            type="button"
            onClick={async () => {
              const email = getValues('email')
              const password = getValues('password') || '12345678'
              if (!email) {
                setError('Please enter your email address to use test login')
                return
              }
              setIsLoading(true)
              setError(null)
              try {
                const resp = await fetch('/api/auth/test-ensure-user', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password }),
                })
                if (!resp.ok) {
                  const j = await resp.json().catch(() => ({}))
                  throw new Error(j.error || 'Failed to ensure test user')
                }
                await login({ email, password })
                router.push('/dashboard')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to test login')
              } finally {
                setIsLoading(false)
              }
            }}
            className="block w-full text-center text-sm text-blue-600 hover:text-blue-800"
          >
            Use Test Login (Bypass Confirmation)
          </button>
        )}
        
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
