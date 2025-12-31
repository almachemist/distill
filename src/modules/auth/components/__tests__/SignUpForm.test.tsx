import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '../SignUpForm'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'

vi.mock('../../hooks/useAuth')
vi.mock('next/navigation')

describe('SignUpForm', () => {
  const mockSignUp = vi.fn()
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      loginWithOtp: vi.fn(),
      signUp: mockSignUp,
      logout: vi.fn(),
      resetPassword: vi.fn(),
      refreshSession: vi.fn(),
      resendConfirmationEmail: vi.fn(),
    })

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as any)
  })

  it('should render signup form with all required fields', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/^password is required/i)).toBeInTheDocument()
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument()
      expect(screen.getByText(/display name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/organization name is required/i)).toBeInTheDocument()
    })
  })

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'differentpassword')

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('should show error for password less than 6 characters', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^password/i)
    await user.type(passwordInput, '12345')

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('should call signUp with form data on valid submission', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(undefined)
    
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const displayNameInput = screen.getByLabelText(/display name/i)
    const organizationNameInput = screen.getByLabelText(/organization name/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.type(displayNameInput, 'Test User')
    await user.type(organizationNameInput, 'Test Distillery')

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        organizationName: 'Test Distillery',
      })
    })
  })

  it('should redirect to dashboard after successful signup', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(undefined)
    
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const displayNameInput = screen.getByLabelText(/display name/i)
    const organizationNameInput = screen.getByLabelText(/organization name/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.type(displayNameInput, 'Test User')
    await user.type(organizationNameInput, 'Test Distillery')

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should display error message on signup failure', async () => {
    const user = userEvent.setup()
    mockSignUp.mockRejectedValue(new Error('Email already in use'))
    
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const displayNameInput = screen.getByLabelText(/display name/i)
    const organizationNameInput = screen.getByLabelText(/organization name/i)

    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.type(displayNameInput, 'Test User')
    await user.type(organizationNameInput, 'Test Distillery')

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup()
    mockSignUp.mockImplementation(() => new Promise(() => {}))
    
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const displayNameInput = screen.getByLabelText(/display name/i)
    const organizationNameInput = screen.getByLabelText(/organization name/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.type(displayNameInput, 'Test User')
    await user.type(organizationNameInput, 'Test Distillery')

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    })
  })

  it('should navigate to login page when login link is clicked', () => {
    render(<SignUpForm />)

    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toHaveAttribute('href', '/auth/login')
  })
})
