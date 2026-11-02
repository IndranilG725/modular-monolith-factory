/**
 * In-Memory Token Storage.
 *
 * Storing access tokens in memory (JavaScript runtime closure) prevents XSS attacks
 * from stealing the token through `localStorage` or `sessionStorage`.
 *
 * The refresh token is maintained exclusively in an HttpOnly, Secure, SameSite cookie
 * managed by the browser and inaccessible to JavaScript.
 */

let inMemoryAccessToken: string | null = null

// Ensure any old legacy tokens in localStorage from prior builds are cleared
try {
  localStorage.removeItem('myapp_access_token')
  localStorage.removeItem('myapp_refresh_token')
} catch {
  // Ignore in environments where localStorage is restricted
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return inMemoryAccessToken
  },

  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token
  },

  clearAccessToken(): void {
    inMemoryAccessToken = null
  },
}

