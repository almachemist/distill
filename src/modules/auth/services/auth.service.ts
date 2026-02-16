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
      const status = (error as any)?.status || 'ERR'
      const message = error.message || 'Login failed'
      throw new Error(`[${status}] ${message}`)
    }

    return data
  }

  async loginWithOtp(email: string) {
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://distil-app.com')
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: origin,
      },
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

    // After signup, we need to sign in to get a valid session
    const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      await this.supabase.auth.admin?.deleteUser(authData.user.id)
      throw new Error(`Failed to establish session: ${signInError.message}`)
    }

    try {
      // Use the RPC function to complete signup with proper permissions
      const { data, error } = await this.supabase.rpc('complete_signup', {
        p_user_id: authData.user.id,
        p_org_name: organizationName,
        p_display_name: displayName,
      })

      if (error) {
        throw new Error(`Failed to complete signup: ${error.message}`)
      }

      return signInData
    } catch (error) {
      // If anything fails, clean up the user
      await this.supabase.auth.signOut()
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
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) {
        // Silently handle auth errors - they're expected when not logged in
        return null
      }

      return user
    } catch {
      // Silently handle any unexpected errors
      return null
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()

      if (error) {
        // Silently handle session errors
        return null
      }

      return session
    } catch {
      // Silently handle any unexpected errors
      return null
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const [profileResult, authResult] = await Promise.all([
      this.supabase
        .from('profiles')
        .select('id, display_name, role, organization_id')
        .eq('id', userId)
        .single(),
      this.supabase.auth.getUser(),
    ])

    if (profileResult.error) {
      console.warn('Profile query failed:', profileResult.error.message)
      // Fallback: return minimal user from auth data
      const authUser = authResult.data?.user
      if (authUser) {
        return {
          id: authUser.id,
          email: authUser.email ?? '',
          displayName: authUser.user_metadata?.display_name || authUser.email || '',
          role: 'viewer',
          organizationId: '',
        }
      }
      return null
    }

    const data = profileResult.data
    const email = authResult.data?.user?.email ?? ''

    // Get org role from user_organizations (more accurate than profiles.role)
    let orgRole = data.role
    if (data.organization_id) {
      const { data: membership } = await this.supabase
        .from('user_organizations')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', data.organization_id)
        .eq('is_active', true)
        .single()
      if (membership?.role) {
        orgRole = membership.role
      }
    }

    return {
      id: data.id,
      email,
      name: data.display_name,
      displayName: data.display_name,
      role: orgRole as User['role'],
      organizationId: data.organization_id,
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const auth: any = (this.supabase as any).auth
    if (!auth || typeof auth.onAuthStateChange !== 'function') {
      return () => {}
    }
    const { data } = auth.onAuthStateChange(callback)
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
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://distil-app.com')
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async resendConfirmationEmail(email: string) {
    const { error } = await (this.supabase as any).auth.resend({
      type: 'signup',
      email,
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
