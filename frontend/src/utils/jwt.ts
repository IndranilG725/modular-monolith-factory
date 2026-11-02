import type { DecodedToken, AuthUser } from '../types/auth.types'

/**
 * Safely decodes a base64url-encoded string from a JWT part.
 */
function decodeBase64Url(base64Url: string): string {
  // Convert Base64Url to Base64
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) {
    base64 += '='
  }

  // Decode percent-encoded UTF-8 bytes to handle UTF-8 characters safely
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * Parses the payload from a standard JWT string without third-party dependencies.
 */
export function decodeJwt(token: string): DecodedToken | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    const payloadJson = decodeBase64Url(parts[1])
    return JSON.parse(payloadJson) as DecodedToken
  } catch {
    return null
  }
}

/**
 * Checks whether a token has expired or is invalid.
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token)
  if (!decoded || !decoded.exp) {
    return true
  }
  // decoded.exp is in seconds, Date.now() is in milliseconds
  const expirationMs = decoded.exp * 1000
  // Consider token expired slightly before actual expiry (30 second buffer)
  return Date.now() >= expirationMs - 30_000
}

/**
 * Constructs an AuthUser object from the JWT token claims.
 */
export function extractUserFromToken(token: string): AuthUser | null {
  const decoded = decodeJwt(token)
  if (!decoded || !decoded.sub) {
    return null
  }

  const tokenExpiry = decoded.exp ? new Date(decoded.exp * 1000) : null
  const roles = Array.isArray(decoded.roles) ? decoded.roles : []

  return {
    username: decoded.sub,
    roles,
    tokenExpiry,
  }
}

