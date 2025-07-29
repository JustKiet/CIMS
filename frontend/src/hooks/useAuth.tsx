"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, TokenManager, HeadhunterResponse, APIError } from '@/lib/api'

interface AuthContextType {
  user: HeadhunterResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HeadhunterResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = TokenManager.getToken()
        if (!token || TokenManager.isTokenExpired()) {
          console.log('No valid token found, clearing auth state')
          TokenManager.clearAll()
          setUser(null)
          setError(null)
          setIsLoading(false)
          return
        }

        // Verify token with backend
        console.log('Verifying token with backend...')
        const response = await authAPI.getCurrentUser(token)
        setUser(response.data)
        setError(null)
        console.log('Token verification successful:', response.data)
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear all auth data when token verification fails
        TokenManager.clearAll()
        setUser(null)
        setError('Session expired. Please login again.')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Attempting login for username:', username)
      const response = await authAPI.login({ username, password })
      
      // Store token data
      TokenManager.setTokenData(response.data)
      console.log('Token stored successfully')

      // Get user profile
      const userResponse = await authAPI.getCurrentUser(response.data.access_token)
      setUser(userResponse.data)
      console.log('User profile retrieved:', userResponse.data)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
      
      if (err instanceof APIError) {
        switch (err.status) {
          case 401:
            setError('Invalid username or password')
            break
          case 404:
            setError('User not found')
            break
          case 500:
            setError('Server error. Please try again later.')
            break
          default:
            setError(err.detail || 'Login failed. Please try again.')
        }
      } else {
        setError('Network error. Please check your connection.')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('Logging out user')
    TokenManager.clearAll()
    setUser(null)
    setError(null)
    router.push('/login')
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
