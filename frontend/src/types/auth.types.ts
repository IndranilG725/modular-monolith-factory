export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface DecodedToken {
  sub?: string
  iss?: string
  type?: 'ACCESS' | 'REFRESH'
  iat?: number
  exp?: number
  roles?: string[]
  [key: string]: unknown
}

export interface AuthUser {
  username: string
  roles: string[]
  tokenExpiry: Date | null
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
}

export interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

export interface ApiErrorResponse {
  message?: string
  error?: string
  status?: number
  errors?: Record<string, string>
}
