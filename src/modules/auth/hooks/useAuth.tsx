'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { AuthService } from '../services/auth.service'
import type { User, LoginCredentials, SignUpData } from '@/modules/shared/types/auth.types'
import type { Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  loginWithOtp: (email: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshSession: () => Promise<void>
  resendConfirmationEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authService] = useState(() => new AuthService())

  const loadUser = useCallback(async (userId?: string) => {
    try {
      const currentUserId = userId || (await authService.getCurrentUser())?.id
      
      if (!currentUserId) {
        setUser(null)
        setSession(null)
        return
      }

      const [profile, currentSession] = await Promise.all([
        authService.getUserProfile(currentUserId),
        authService.getSession(),
      ])

      setUser(profile)
      setSession(currentSession)
    } catch {
      // Silently handle errors - user is simply not logged in
      setUser(null)
      setSession(null)
    }
  }, [authService])

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      
      // In development mode, provide a mock user for easy testing
      if (process.env.NODE_ENV === 'development') {
                const mockUser: User = {
           id: '00000000-0000-0000-0000-000000000001',
          email: 'dev@example.com',
          name: 'Development User',
            organizationId: '00000000-0000-0000-0000-000000000001',
           role: 'admin'
         }
        setUser(mockUser)
        setSession(null) // No real session in dev mode
        setIsLoading(false)
        return
      }
      
      await loadUser()
      setIsLoading(false)
    }

    initAuth()

    // Skip auth state change listener in development
    if (process.env.NODE_ENV === 'development') {
      return () => {}
    }

    const unsubscribe = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUser(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session)
      }
    })

    return unsubscribe
  }, [authService, loadUser])

  const login = useCallback(async (credentials: LoginCredentials) => {
    // In development mode, skip actual login and just use mock user
    if (process.env.NODE_ENV === 'development') {
      const mockUser: User = {
        id: '00000000-0000-0000-0000-000000000001',
        email: credentials.email,
        name: 'Development User',
            organizationId: '00000000-0000-0000-0000-000000000001',
        role: 'admin'
      }
      setUser(mockUser)
      setSession(null)
      return
    }
    
    const { user: authUser } = await authService.login(credentials)
    if (authUser) {
      await loadUser(authUser.id)
    }
  }, [authService, loadUser])

  const loginWithOtp = useCallback(async (email: string) => {
    await (authService as any).loginWithOtp(email)
  }, [authService])

  const signUp = useCallback(async (data: SignUpData) => {
    // In development mode, skip actual signup and just use mock user
    if (process.env.NODE_ENV === 'development') {
      const mockUser: User = {
        id: '00000000-0000-0000-0000-000000000001',
        email: data.email,
        name: data.displayName,
            organizationId: '00000000-0000-0000-0000-000000000001',
        role: 'admin'
      }
      setUser(mockUser)
      setSession(null)
      return
    }
    
    const { user: authUser } = await authService.signUp(data)
    if (authUser) {
      await loadUser(authUser.id)
    }
  }, [authService, loadUser])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setSession(null)
  }, [authService])

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email)
  }, [authService])

  const resendConfirmationEmail = useCallback(async (email: string) => {
    await authService.resendConfirmationEmail(email)
  }, [authService])

  const refreshSession = useCallback(async () => {
    const { session: newSession } = await authService.refreshSession()
    setSession(newSession)
  }, [authService])

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithOtp,
    signUp,
    logout,
    resetPassword,
    refreshSession,
    resendConfirmationEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
