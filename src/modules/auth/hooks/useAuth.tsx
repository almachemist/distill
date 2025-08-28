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
  signUp: (data: SignUpData) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshSession: () => Promise<void>
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
      await loadUser()
      setIsLoading(false)
    }

    initAuth()

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
    const { user: authUser } = await authService.login(credentials)
    if (authUser) {
      await loadUser(authUser.id)
    }
  }, [authService, loadUser])

  const signUp = useCallback(async (data: SignUpData) => {
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
    signUp,
    logout,
    resetPassword,
    refreshSession,
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