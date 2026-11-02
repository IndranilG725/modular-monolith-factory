import { apiClient } from './client'
import type { LoginRequest, RegisterRequest, LoginResponse } from '../types/auth.types'

//const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL;
const API_BASE_URL = "/api/v1";

export const authApi = {
  /**
   * Authenticates user against backend /api/v1/auth/login.
   * Returns short-lived access token in body and sets HttpOnly refresh cookie.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient<LoginResponse>(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      requiresAuth: false,
    })
  },

  /**
   * Registers a new user at backend /api/v1/auth/register.
   * Returns short-lived access token in body and sets HttpOnly refresh cookie.
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    return apiClient<LoginResponse>(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    })
  },

  /**
   * Silently exchanges the HttpOnly refresh token cookie for a new in-memory access token.
   */
  async refresh(): Promise<LoginResponse> {
    return apiClient<LoginResponse>(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      requiresAuth: false,
    })
  },

  /**
   * Logs out user on backend: clears the HttpOnly refresh token cookie.
   */
  async logout(): Promise<void> {
    await apiClient<void>(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      requiresAuth: false,
    })
  },

  /**
   * Test a protected endpoint with the in-memory JWT access token.
   */
  async testProtectedEndpoint(): Promise<unknown> {
    return apiClient<unknown>('/actuator/health', {
      method: 'GET',
      requiresAuth: true,
    })
  },
}
