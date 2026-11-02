import { useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthContextType, AuthState, LoginRequest, RegisterRequest } from '../types/auth.types'
import { AuthContext } from './authContextBase'
import { authApi } from '../api/authApi'
import { tokenStorage } from '../utils/tokenStorage'
import { extractUserFromToken, isTokenExpired } from '../utils/jwt'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // On app mount, silently restore the session via HttpOnly refresh cookie
  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const response = await authApi.refresh()
        if (!isMounted) return

        tokenStorage.setAccessToken(response.accessToken)
        const extractedUser = extractUserFromToken(response.accessToken)

        setAuthState({
          user: extractedUser,
          accessToken: response.accessToken,
        })
      } catch {
        // No valid refresh cookie present (user is not logged in)
        if (!isMounted) return
        tokenStorage.clearAccessToken()
        setAuthState({
          user: null,
          accessToken: null,
        })
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials)
    tokenStorage.setAccessToken(response.accessToken)

    const extractedUser = extractUserFromToken(response.accessToken)
    setAuthState({
      user: extractedUser,
      accessToken: response.accessToken,
    })
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    tokenStorage.setAccessToken(response.accessToken)

    const extractedUser = extractUserFromToken(response.accessToken)
    setAuthState({
      user: extractedUser,
      accessToken: response.accessToken,
    })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.warn('Backend logout encountered an error:', err)
    } finally {
      tokenStorage.clearAccessToken()
      setAuthState({
        user: null,
        accessToken: null,
      })
    }
  }, [])

  const value: AuthContextType = {
    user: authState.user,
    accessToken: authState.accessToken,
    isAuthenticated:
      !!authState.user &&
      !!authState.accessToken &&
      !isTokenExpired(authState.accessToken),
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
