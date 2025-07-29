// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Types based on your backend schemas
export interface LoginRequest {
  username: string
  password: string
}

export interface TokenData {
  access_token: string
  token_type: string
  expires_in: number
  expires_at: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: TokenData
}

export interface HeadhunterResponse {
  headhunter_id: number
  name: string
  phone: string
  email: string
  area_id: number
  role: string
  created_at: string
  updated_at: string
}

export interface HeadhunterDetailResponse {
  success: boolean
  message: string
  data: HeadhunterResponse
}

export interface ErrorResponse {
  detail: string
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// API client class
export class AuthAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  /**
   * Login with username and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Create FormData for OAuth2PasswordRequestForm compatibility
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Login failed',
          response.status,
          errorData.detail
        )
      }

      const data: LoginResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error during login', 0, 'Failed to connect to server')
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(token: string): Promise<HeadhunterDetailResponse> {
    try {
      console.log('Making request to /me endpoint with token:', token.substring(0, 20) + '...')
      
      const response = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        console.error('API error response:', errorData)
        throw new APIError(
          'Failed to get user profile',
          response.status,
          errorData.detail
        )
      }

      const data: HeadhunterDetailResponse = await response.json()
      console.log('Successfully retrieved user profile')
      return data
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      console.error('Network error occurred:', error)
      throw new APIError('Network error fetching user profile', 0, 'Failed to connect to server')
    }
  }
}

// Export singleton instance
export const authAPI = new AuthAPI()

// Token management utilities
export const TokenManager = {
  setToken(token: string): void {
    localStorage.setItem('access_token', token)
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  },

  removeToken(): void {
    localStorage.removeItem('access_token')
  },

  setTokenData(tokenData: TokenData): void {
    localStorage.setItem('access_token', tokenData.access_token)
    localStorage.setItem('token_type', tokenData.token_type)
    localStorage.setItem('expires_at', tokenData.expires_at)
  },

  getTokenData(): TokenData | null {
    if (typeof window === 'undefined') return null
    
    const token = localStorage.getItem('access_token')
    const tokenType = localStorage.getItem('token_type')
    const expiresAt = localStorage.getItem('expires_at')

    if (!token || !tokenType || !expiresAt) return null

    return {
      access_token: token,
      token_type: tokenType,
      expires_in: 0, // Calculate if needed
      expires_at: expiresAt
    }
  },

  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true
    
    const tokenData = this.getTokenData()
    if (!tokenData || !tokenData.expires_at) return true

    try {
      // Parse the UTC timestamp from the backend
      const expiryDate = new Date(tokenData.expires_at + (tokenData.expires_at.endsWith('Z') ? '' : 'Z'))
      const now = new Date()
      
      // Add 5 minute buffer to consider token expired before actual expiry
      const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
      const isExpired = now.getTime() >= (expiryDate.getTime() - bufferTime)
      
      if (isExpired) {
        console.log('Token expired or will expire soon. Expiry:', expiryDate.toISOString(), 'Now:', now.toISOString())
      } else {
        console.log('Token is valid. Expiry:', expiryDate.toISOString(), 'Now:', now.toISOString())
      }
      
      return isExpired
    } catch (error) {
      console.error('Error checking token expiry:', error)
      return true // Consider expired if we can't parse the date
    }
  },

  clearAll(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('expires_at')
  }
}
