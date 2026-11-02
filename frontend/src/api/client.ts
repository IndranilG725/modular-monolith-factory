import { tokenStorage } from '../utils/tokenStorage'
import type { ApiErrorResponse } from '../types/auth.types'

export class ApiError extends Error {
  status: number
  data?: ApiErrorResponse

  constructor(message: string, status: number, data?: ApiErrorResponse) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
  _isRetry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

/**
 * Silently requests a new access token using the browser's HttpOnly refresh cookie.
 * Ensures concurrent requests share a single refresh request.
 */
async function silentRefreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        tokenStorage.clearAccessToken()
        return null
      }

      const data = await response.json()
      const newAccessToken = data.accessToken as string
      tokenStorage.setAccessToken(newAccessToken)
      return newAccessToken
    } catch {
      tokenStorage.clearAccessToken()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Standard HTTP client that:
 * 1. Attaches short-lived in-memory Bearer token
 * 2. Transmits credentials/cookies (HttpOnly refresh token)
 * 3. Automatically performs silent token refresh on 401 and retries once
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers: customHeaders, _isRetry = false, ...restOptions } = options

  const headers = new Headers(customHeaders)

  // Ensure JSON content-type if not already specified
  if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Attach in-memory access token if required
  if (requiresAuth) {
    const token = tokenStorage.getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(endpoint, {
    ...restOptions,
    headers,
    // Always include credentials to enable HttpOnly refresh cookies
    credentials: 'include',
  })

  // Handle 401 Unauthorized by attempting a silent token refresh using the HttpOnly cookie
  const isAuthEndpoint = endpoint.includes('/api/v1/auth/')
  if (response.status === 401 && requiresAuth && !isAuthEndpoint && !_isRetry) {
    const newToken = await silentRefreshAccessToken()
    if (newToken) {
      return apiClient<T>(endpoint, {
        ...options,
        _isRetry: true,
      })
    }
  }

  // Parse response body
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`

    if (isJson && typeof data === 'object' && data !== null) {
      const errObj = data as ApiErrorResponse
      if (errObj.message) {
        errorMessage = errObj.message
      } else if (errObj.error) {
        errorMessage = errObj.error
      } else if (errObj.errors && typeof errObj.errors === 'object') {
        errorMessage = Object.values(errObj.errors).join(', ')
      }
    } else if (typeof data === 'string' && data.trim()) {
      errorMessage = data
    } else if (response.status === 401) {
      errorMessage = 'Invalid username or password.'
    } else if (response.status === 403) {
      errorMessage = 'Access denied. You do not have permission to perform this action.'
    }

    throw new ApiError(errorMessage, response.status, isJson ? (data as ApiErrorResponse) : undefined)
  }

  return data as T
}
