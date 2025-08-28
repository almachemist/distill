import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useAuth, AuthProvider } from '../useAuth'
import { AuthService } from '../../services/auth.service'
import type { LoginCredentials, SignUpData } from '@/modules/shared/types/auth.types'

vi.mock('../../services/auth.service')

describe('useAuth', () => {
  let mockAuthService: any

  beforeEach(() => {
    mockAuthService = {
      getCurrentUser: vi.fn(),
      getUserProfile: vi.fn(),
      getSession: vi.fn(),
      login: vi.fn(),
      signUp: vi.fn(),
      logout: vi.fn(),
      onAuthStateChange: vi.fn(() => vi.fn()),
      resetPassword: vi.fn(),
      refreshSession: vi.fn(),
    }

    vi.mocked(AuthService).mockImplementation(() => mockAuthService)
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      mockAuthService.getCurrentUser.mockResolvedValue(null)
      mockAuthService.getSession.mockResolvedValue(null)
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should load current user on mount', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin',
        organizationId: 'org-123',
      }

      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      }

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser)
      mockAuthService.getUserProfile.mockResolvedValue(mockProfile)
      mockAuthService.getSession.mockResolvedValue(mockSession)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toEqual(mockProfile)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin',
        organizationId: 'org-123',
      }

      mockAuthService.getCurrentUser.mockResolvedValue(null)
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.login.mockResolvedValue({ user: mockUser, session: {} })
      mockAuthService.getUserProfile.mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login(credentials)
      })

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials)
      expect(result.current.user).toEqual(mockProfile)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle login error', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      mockAuthService.getCurrentUser.mockResolvedValue(null)
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(result.current.login(credentials)).rejects.toThrow('Invalid credentials')
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      const signUpData: SignUpData = {
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
        organizationName: 'New Distillery',
      }

      const mockUser = {
        id: 'user-456',
        email: 'new@example.com',
      }

      const mockProfile = {
        id: 'user-456',
        email: 'new@example.com',
        displayName: 'New User',
        role: 'admin',
        organizationId: 'org-456',
      }

      mockAuthService.getCurrentUser.mockResolvedValue(null)
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.signUp.mockResolvedValue({ user: mockUser, session: {} })
      mockAuthService.getUserProfile.mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.signUp(signUpData)
      })

      expect(mockAuthService.signUp).toHaveBeenCalledWith(signUpData)
      expect(result.current.user).toEqual(mockProfile)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin',
        organizationId: 'org-123',
      }

      mockAuthService.getCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockAuthService.getUserProfile.mockResolvedValue(mockProfile)
      mockAuthService.getSession.mockResolvedValue({ access_token: 'token' })
      mockAuthService.logout.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockProfile)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(mockAuthService.logout).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const email = 'test@example.com'

      mockAuthService.getCurrentUser.mockResolvedValue(null)
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.resetPassword.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.resetPassword(email)
      })

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(email)
    })
  })

  describe('auth state subscription', () => {
    it('should subscribe to auth state changes', async () => {
      const mockUnsubscribe = vi.fn()
      const mockCallback = vi.fn()
      
      mockAuthService.getCurrentUser.mockResolvedValue(null)
      mockAuthService.getSession.mockResolvedValue(null)
      mockAuthService.onAuthStateChange.mockImplementation((cb: any) => {
        mockCallback.mockImplementation(cb)
        return mockUnsubscribe
      })

      const { unmount } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(mockAuthService.onAuthStateChange).toHaveBeenCalled()
      })

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})