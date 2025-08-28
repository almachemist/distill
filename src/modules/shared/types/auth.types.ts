export interface User {
  id: string
  email: string
  displayName?: string
  role: 'admin' | 'manager' | 'operator' | 'viewer'
  organizationId: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData extends LoginCredentials {
  displayName: string
  organizationName: string
}

export interface AuthError {
  message: string
  code?: string
}