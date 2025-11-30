import { User, AuthToken } from './types'

const JWT_SECRET = 'water-footprint-secret-key-2025'

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + JWT_SECRET)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password)
  return computed === hash
}

export function generateToken(user: User): AuthToken {
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000)
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: expiresAt
  }
  
  const token = btoa(JSON.stringify(payload))
  
  return {
    token,
    expiresAt,
    user
  }
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const payload = JSON.parse(atob(token))
    
    if (payload.exp < Date.now()) {
      return null
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    }
  } catch {
    return null
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
