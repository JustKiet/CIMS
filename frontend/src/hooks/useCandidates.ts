import { useState, useEffect, useCallback } from 'react'
import { candidateAPI, CandidateResponse, APIError } from '@/lib/api'
import { useDebounce } from './useDebounce'
import { SortOption, SortField, SortOrder } from '@/components/candidates/CandidateHeader'
import { CandidateFilters } from '@/components/candidates/CandidateFilterDropdown'

interface UseCandidatesOptions {
  initialPageSize?: number
  initialPage?: number
}

interface UseCandidatesReturn {
  candidates: CandidateResponse[]
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  searchQuery: string
  sortOption: SortOption
  filters: CandidateFilters
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSearchQuery: (query: string) => void
  setSortOption: (option: SortOption) => void
  setFilters: (filters: CandidateFilters) => void
  refetch: () => Promise<void>
  deleteCandidate: (candidateId: number) => Promise<void>
  searchWithFilters: () => Promise<void>
}

export const useCandidates = (options: UseCandidatesOptions = {}): UseCandidatesReturn => {
  const { initialPageSize = 10, initialPage = 1 } = options

  const [candidates, setCandidates] = useState<CandidateResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'name', order: 'asc' })
  const [filters, setFilters] = useState<CandidateFilters>({})

  // Debounce search query updates
  const debouncedSetSearch = useDebounce((query: string) => {
    setDebouncedSearchQuery(query)
  }, 500)

  useEffect(() => {
    debouncedSetSearch(searchQuery)
  }, [searchQuery, debouncedSetSearch])

  const sortCandidates = useCallback((candidates: CandidateResponse[], field: SortField, order: SortOrder) => {
    return [...candidates].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'candidate_id':
          aValue = a.candidate_id
          bValue = b.candidate_id
          break
        case 'expertise_name':
          aValue = (a.expertise_name || '').toLowerCase()
          bValue = (b.expertise_name || '').toLowerCase()
          break
        case 'field_name':
          aValue = (a.field_name || '').toLowerCase()
          bValue = (b.field_name || '').toLowerCase()
          break
        case 'area_name':
          aValue = (a.area_name || '').toLowerCase()
          bValue = (b.area_name || '').toLowerCase()
          break
        case 'headhunter_name':
          aValue = (a.headhunter_name || '').toLowerCase()
          bValue = (b.headhunter_name || '').toLowerCase()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [])

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we have any filters or search query
      const hasFilters = Object.values(filters).some(value => value !== undefined)
      const hasSearchQuery = debouncedSearchQuery.trim().length > 0

      let response
      if (hasFilters && !hasSearchQuery) {
        // Filter-only search: use search endpoint with empty string
        response = await candidateAPI.searchCandidates(
          '', // Empty query for filter-only search
          filters.expertiseId,
          filters.fieldId,
          filters.areaId,
          filters.levelId,
          undefined, // headhunterId
          page, 
          pageSize
        )
      } else if (hasSearchQuery || hasFilters) {
        // Search with text and/or filters
        response = await candidateAPI.searchCandidates(
          debouncedSearchQuery || '', 
          filters.expertiseId,
          filters.fieldId,
          filters.areaId,
          filters.levelId,
          undefined, // headhunterId - not included in filters for now
          page, 
          pageSize
        )
      } else {
        // If no filters and no search, just get all candidates
        response = await candidateAPI.getCandidates(page, pageSize)
      }

      const sortedCandidates = sortCandidates(response.data, sortOption.field, sortOption.order)

      setCandidates(sortedCandidates)
      setTotalItems(response.pagination?.total || response.data.length)
      setTotalPages(response.pagination?.total_pages || Math.ceil((response.pagination?.total || response.data.length) / pageSize))
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi tải danh sách ứng viên')
      }
      console.error('Error fetching candidates:', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearchQuery, sortOption, sortCandidates, filters])

  const searchWithFilters = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setPage(1) // Reset to first page when searching with filters

      // Check if we have any filters or search query
      const hasFilters = Object.values(filters).some(value => value !== undefined)
      const hasSearchQuery = debouncedSearchQuery.trim().length > 0

      let response
      if (hasFilters && !hasSearchQuery) {
        // Filter-only search: use search endpoint with empty string
        response = await candidateAPI.searchCandidates(
          '', // Empty query for filter-only search
          filters.expertiseId,
          filters.fieldId,
          filters.areaId,
          filters.levelId,
          undefined, // headhunterId
          1, // Always start from page 1 for new search
          pageSize
        )
      } else if (hasSearchQuery || hasFilters) {
        // Search with text and/or filters
        response = await candidateAPI.searchCandidates(
          debouncedSearchQuery || '', 
          filters.expertiseId,
          filters.fieldId,
          filters.areaId,
          filters.levelId,
          undefined, // headhunterId
          1, // Always start from page 1 for new search
          pageSize
        )
      } else {
        // If no filters and no search, just get all candidates
        response = await candidateAPI.getCandidates(1, pageSize)
      }

      const sortedCandidates = sortCandidates(response.data, sortOption.field, sortOption.order)

      setCandidates(sortedCandidates)
      setTotalItems(response.pagination?.total || response.data.length)
      setTotalPages(response.pagination?.total_pages || Math.ceil((response.pagination?.total || response.data.length) / pageSize))
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi tìm kiếm ứng viên')
      }
      console.error('Error searching candidates with filters:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchQuery, filters, pageSize, sortOption, sortCandidates])

  const refetch = useCallback(async () => {
    await fetchCandidates()
  }, [fetchCandidates])

  const deleteCandidate = useCallback(async (candidateId: number) => {
    try {
      await candidateAPI.deleteCandidate(candidateId)
      // Refetch the current page
      await fetchCandidates()
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.detail || err.message)
      } else {
        throw new Error('Có lỗi xảy ra khi xóa ứng viên')
      }
    }
  }, [fetchCandidates])

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== '') {
      setPage(1)
    }
  }, [debouncedSearchQuery])

  // Reset to page 1 when page size changes
  useEffect(() => {
    setPage(1)
  }, [pageSize])

  // Reset to page 1 when page size changes
  useEffect(() => {
    setPage(1)
  }, [pageSize])

  // Fetch candidates when dependencies change
  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  return {
    candidates,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    totalPages,
    searchQuery,
    sortOption,
    filters,
    setPage,
    setPageSize,
    setSearchQuery,
    setSortOption,
    setFilters,
    refetch,
    deleteCandidate,
    searchWithFilters
  }
}
