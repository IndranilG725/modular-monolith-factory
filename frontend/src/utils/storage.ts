import { tokenStorage } from './tokenStorage'

/**
 * Storage adapter redirecting to in-memory token storage.
 * LocalStorage is intentionally avoided to eliminate XSS token exfiltration vulnerabilities.
 */
export const storage = {
  getAccessToken(): string | null {
    return tokenStorage.getAccessToken()
  },

  setAccessToken(accessToken: string): void {
    tokenStorage.setAccessToken(accessToken)
  },

  clearTokens(): void {
    tokenStorage.clearAccessToken()
  },
}
