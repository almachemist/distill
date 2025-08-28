import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../services/auth.service'
import { createClient } from '@/lib/supabase/client'
import type { LoginCredentials, SignUpData } from '@/modules/shared/types/auth.types'

vi.mock('@/lib/supabase/client')

describe('AuthService', () => {
  let authService: AuthService
  let mockSupabaseClient: any

  beforeEach(() => {
    mockSupabaseClient = {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      })),
    }

    vi.mocked(createClient).mockReturnValue(mockSupabaseClient)
    authService = new AuthService()
  })

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        app_metadata: { organizationId: 'org-123' },
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      })

      const result = await authService.login(credentials)

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(credentials)
      expect(result).toEqual({ user: mockUser, session: {} })
    })

    it('should throw error on invalid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', code: 'invalid_credentials' },
      })

      await expect(authService.login(credentials)).rejects.toThrow('Invalid login credentials')
    })
  })

  describe('signUp', () => {
    it('should create new user and organization', async () => {
      const signUpData: SignUpData = {
        email: 'new@example.com',
        password: 'password123',
        displayName: 'Test User',
        organizationName: 'Test Distillery',
      }

      const mockUser = {
        id: 'user-123',
        email: 'new@example.com',
      }

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      })

      // Mock for organizations insert
      const orgMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'org-123', name: 'Test Distillery' },
          error: null,
        }),
      }

      // Mock for profiles insert
      const profileMock = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'organizations') {
          return orgMock
        }
        if (table === 'profiles') {
          return profileMock
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const result = await authService.signUp(signUpData)

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            displayName: signUpData.displayName,
          },
        },
      })
      expect(result).toEqual({ user: mockUser, session: {} })
    })

    it('should throw error if email already exists', async () => {
      const signUpData: SignUpData = {
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Test User',
        organizationName: 'Test Distillery',
      }

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', code: 'user_already_exists' },
      })

      await expect(authService.signUp(signUpData)).rejects.toThrow('User already registered')
    })
  })

  describe('logout', () => {
    it('should sign out user', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

      await authService.logout()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })

    it('should throw error if signout fails', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Failed to sign out' },
      })

      await expect(authService.logout()).rejects.toThrow('Failed to sign out')
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await authService.getCurrentUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null if no user is logged in', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('getSession', () => {
    it('should return current session', async () => {
      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await authService.getSession()

      expect(result).toEqual(mockSession)
    })

    it('should return null if no session exists', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await authService.getSession()

      expect(result).toBeNull()
    })
  })

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const callback = vi.fn()
      const mockUnsubscribe = vi.fn()

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      })

      const unsubscribe = authService.onAuthStateChange(callback)

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(callback)
      expect(typeof unsubscribe).toBe('function')
    })
  })
})