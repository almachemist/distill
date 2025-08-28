import { createClient } from '@/lib/supabase/client'
import type { LoginCredentials, SignUpData, User } from '@/modules/shared/types/auth.types'
import type { SupabaseClient, Session } from '@supabase/supabase-js'

export class AuthService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  async login(credentials: LoginCredentials) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async signUp(signUpData: SignUpData) {
    const { email, password, displayName, organizationName } = signUpData

    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayName,
        },
      },
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    try {
      const { data: orgData, error: orgError } = await this.supabase
        .from('organizations')
        .insert({ name: organizationName })
        .select()
        .single()

      if (orgError) {
        throw new Error(`Failed to create organization: ${orgError.message}`)
      }

      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          display_name: displayName,
          organization_id: orgData.id,
          role: 'admin',
        })

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      return authData
    } catch (error) {
      await this.supabase.auth.admin?.deleteUser(authData.user.id)
      throw error
    }
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()

    if (error) {
      console.error('Error getting current user:', error)
      return null
    }

    return user
  }

  async getSession(): Promise<Session | null> {
    const { data: { session }, error } = await this.supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return session
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, organizations(name)')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      role: data.role,
      organizationId: data.organization_id,
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data } = this.supabase.auth.onAuthStateChange(callback)
    return () => data.subscription.unsubscribe()
  }

  async refreshSession() {
    const { data, error } = await this.supabase.auth.refreshSession()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(error.message)
    }
  }
}