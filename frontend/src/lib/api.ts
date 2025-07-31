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

// Project types
export type ProjectStatus = 
  | "TIMKIEMUNGVIEN" 
  | "UNGVIENPHONGVAN" 
  | "UNGVIENTHUVIEC"
  | "TAMNGUNG" 
  | "HUY"
  | "HOANTHANH"

export type ProjectType = "CODINH" | "THOIVU"

export interface ProjectCreate {
  start_date: string
  end_date: string
  budget: number
  budget_currency: string
  type: ProjectType
  required_recruits: number
  recruited: number
  status: ProjectStatus
  customer_id: number
  expertise_id: number
  area_id: number
  level_id: number
}

export interface ProjectResponse {
  project_id: number
  name: string
  start_date: string
  end_date: string
  budget: number
  budget_currency: string
  type: ProjectType
  required_recruits: number
  recruited: number
  status: ProjectStatus
  customer_id: number
  expertise_id: number
  area_id: number
  level_id: number
  customer_name?: string
  expertise_name?: string
  area_name?: string
  level_name?: string
  created_at: string
  updated_at: string
}

export interface ProjectListResponse {
  success: boolean
  message: string
  data: ProjectResponse[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface ProjectDetailResponse {
  success: boolean
  message: string
  data: ProjectResponse
}

// Customer types
export type Gender = "NAM" | "NU" | "KHAC";

export interface CustomerResponse {
  customer_id: number
  name: string
  field_id: number
  representative_name: string
  representative_phone: string
  representative_email: string
  representative_role: string
  created_at: string
  updated_at: string
}

export interface CustomerListResponse {
  success: boolean
  message: string
  data: CustomerResponse[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Candidate types
export interface CandidateResponse {
  candidate_id: number
  name: string
  phone: string
  email: string
  year_of_birth: number
  gender: string
  education: string
  source: string
  expertise_id: number
  field_id: number
  area_id: number
  level_id: number
  headhunter_id: number
  expertise_name?: string
  field_name?: string
  area_name?: string
  level_name?: string
  headhunter_name?: string
  note: string
  created_at: string
  updated_at: string
}

export interface CandidateListResponse {
  success: boolean
  message: string
  data: CandidateResponse[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface CandidateDetailResponse {
  success: boolean
  message: string
  data: CandidateResponse
}

export interface CandidateCreate {
  name: string
  phone: string
  email: string
  year_of_birth: number
  gender: Gender
  education: string
  source: string
  expertise_id: number
  field_id: number
  area_id: number
  level_id: number
  headhunter_id: number
  note: string
}

// Headhunter types
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

export interface HeadhunterListResponse {
  success: boolean
  message: string
  data: HeadhunterResponse[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface HeadhunterDetailResponse {
  success: boolean
  message: string
  data: HeadhunterResponse
}

// Expertise types
export interface ExpertiseResponse {
  expertise_id: number
  name: string
  created_at: string
  updated_at: string
}

export interface ExpertiseListResponse {
  success: boolean
  message: string
  data: ExpertiseResponse[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Field types
export interface FieldResponse {
  field_id: number
  name: string
  created_at: string
  updated_at: string
}

export interface FieldListResponse {
  success: boolean
  message: string
  data: FieldResponse[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Area types
export interface AreaResponse {
  area_id: number
  name: string
  created_at: string
  updated_at: string
}

export interface AreaListResponse {
  success: boolean
  message: string
  data: AreaResponse[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Level types
export interface LevelResponse {
  level_id: number
  name: string
  created_at: string
  updated_at: string
}

export interface LevelListResponse {
  success: boolean
  message: string
  data: LevelResponse[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
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

// Project API functions
export const projectAPI = {
  async createProject(projectData: ProjectCreate): Promise<ProjectDetailResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to create project',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while creating project', 0, 'Failed to connect to server')
    }
  },

  async getProjects(page = 1, pageSize = 20): Promise<ProjectListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/projects?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch projects',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching projects', 0, 'Failed to connect to server')
    }
  },

  async searchProjects(query: string, page = 1, pageSize = 20): Promise<ProjectListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/projects/search?query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to search projects',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while searching projects', 0, 'Failed to connect to server')
    }
  },

  async getProject(projectId: number): Promise<ProjectDetailResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch project',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching project', 0, 'Failed to connect to server')
    }
  },

  async deleteProject(projectId: number): Promise<void> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to delete project',
          response.status,
          errorData.detail
        )
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while deleting project', 0, 'Failed to connect to server')
    }
  }
}

// Customer API functions
export const customerAPI = {
  async getCustomers(page = 1, pageSize = 100): Promise<CustomerListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/customers?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch customers',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching customers', 0, 'Failed to connect to server')
    }
  }
}

// Expertise API functions
export const expertiseAPI = {
  async getExpertises(page = 1, pageSize = 100): Promise<ExpertiseListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/expertises?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch expertises',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching expertises', 0, 'Failed to connect to server')
    }
  }
}

// Area API functions
export const areaAPI = {
  async getAreas(page = 1, pageSize = 100): Promise<AreaListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/areas?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch areas',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching areas', 0, 'Failed to connect to server')
    }
  }
}

// Level API functions
export const levelAPI = {
  async getLevels(page = 1, pageSize = 100): Promise<LevelListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/levels?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch levels',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching levels', 0, 'Failed to connect to server')
    }
  }
}

export const candidateAPI = {
  async createCandidate(candidateData: CandidateCreate): Promise<CandidateDetailResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to create candidate',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while creating candidate', 0, 'Failed to connect to server')
    }
  },

  async getCandidates(page = 1, pageSize = 20): Promise<CandidateListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/candidates?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch candidates',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching candidates', 0, 'Failed to connect to server')
    }
  },

  async getCandidate(candidateId: number): Promise<CandidateDetailResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/candidates/${candidateId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch candidate',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching candidate', 0, 'Failed to connect to server')
    }
  },

  async searchCandidates(
    query: string,
    expertiseId?: number,
    fieldId?: number,
    areaId?: number,
    levelId?: number,
    headhunterId?: number,
    page = 1,
    pageSize = 20
  ): Promise<CandidateListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      // Build query parameters
      const params = new URLSearchParams()
      
      // Add query parameter (can be empty for filter-only searches)
      params.append('query', query || '')
      
      if (expertiseId) params.append('expertise_id', expertiseId.toString())
      if (fieldId) params.append('field_id', fieldId.toString())
      if (areaId) params.append('area_id', areaId.toString())
      if (levelId) params.append('level_id', levelId.toString())
      if (headhunterId) params.append('headhunter_id', headhunterId.toString())
      
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())

      const response = await fetch(`${API_BASE_URL}/api/v1/candidates/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to search candidates',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while searching candidates', 0, 'Failed to connect to server')
    }
  },

  async deleteCandidate(candidateId: number): Promise<void> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to delete candidate',
          response.status,
          errorData.detail
        )
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while deleting candidate', 0, 'Failed to connect to server')
    }
  }
}

export const fieldAPI = {
  async getFields(page = 1, pageSize = 100): Promise<FieldListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/fields?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch fields',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching fields', 0, 'Failed to connect to server')
    }
  }
}

export const headhunterAPI = {
  async getHeadhunters(page = 1, pageSize = 100): Promise<HeadhunterListResponse> {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new APIError('Not authenticated', 401)
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/headhunters?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json()
        throw new APIError(
          'Failed to fetch headhunters',
          response.status,
          errorData.detail
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError('Network error while fetching headhunters', 0, 'Failed to connect to server')
    }
  },
}