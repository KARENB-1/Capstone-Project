import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { User, AuthToken } from '@/lib/types'
import { hashPassword, verifyPassword, generateToken, verifyToken, generateId } from '@/lib/auth'

interface StoredUser extends User {
  passwordHash: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useKV<StoredUser[]>('users', [])
  const [authToken, setAuthToken] = useKV<AuthToken | null>('authToken', null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (authToken) {
      const verified = verifyToken(authToken.token)
      if (verified) {
        setUser(authToken.user)
      } else {
        setAuthToken(null)
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [authToken, setAuthToken])

  const register = async (name: string, email: string, password: string) => {
    const currentUsers = users || []
    const existingUser = currentUsers.find(u => u.email === email)
    if (existingUser) {
      return { success: false, error: 'Email already registered' }
    }

    const passwordHash = await hashPassword(password)
    const newUser: StoredUser = {
      id: generateId(),
      name,
      email,
      role: currentUsers.length === 0 ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      isActive: true,
      passwordHash
    }

    setUsers((prev) => [...(prev || []), newUser])

    const { passwordHash: _, ...userWithoutPassword } = newUser
    const token = generateToken(userWithoutPassword)
    setAuthToken(token)

    return { success: true }
  }

  const login = async (email: string, password: string) => {
    const currentUsers = users || []
    const foundUser = currentUsers.find(u => u.email === email)
    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' }
    }

    const isValid = await verifyPassword(password, foundUser.passwordHash)
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (!foundUser.isActive) {
      return { success: false, error: 'Account is inactive' }
    }

    const { passwordHash: _, ...userWithoutPassword } = foundUser
    const token = generateToken(userWithoutPassword)
    setAuthToken(token)

    return { success: true }
  }

  const logout = () => {
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
