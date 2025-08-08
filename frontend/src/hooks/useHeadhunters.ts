import { useState, useEffect, useCallback } from 'react'
import { headhunterAPI, HeadhunterResponse, APIError } from '@/lib/api'
import { useDebounce } from './useDebounce'

export type HeadhunterSortField = 'name' | 'headhunter_id' | 'email' | 'area_name' | 'role'
export type HeadhunterSortOrder = 'asc' | 'desc'

export interface HeadhunterSortOption {
  field: HeadhunterSortField
  order: HeadhunterSortOrder
}

interface UseHeadhuntersOptions {
  initialPageSize?: number
  initialPage?: number
}

interface UseHeadhuntersReturn {
  headhunters: HeadhunterResponse[]
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  searchQuery: string
  sortOption: HeadhunterSortOption
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSearchQuery: (query: string) => void
  setSortOption: (option: HeadhunterSortOption) => void
  refetch: () => Promise<void>
  deleteHeadhunter: (headhunterId: number) => Promise<void>
  searchHeadhunters: () => Promise<void>
}

export const useHeadhunters = (options: UseHeadhuntersOptions = {}): UseHeadhuntersReturn => {
  const { initialPageSize = 10, initialPage = 1 } = options

  const [headhunters, setHeadhunters] = useState<HeadhunterResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<HeadhunterSortOption>({ field: 'name', order: 'asc' })

  // Debounce search query updates
  const debouncedSetSearch = useDebounce((query: string) => {
    setDebouncedSearchQuery(query)
  }, 500)

  useEffect(() => {
    debouncedSetSearch(searchQuery)
  }, [searchQuery, debouncedSetSearch])

  const sortHeadhunters = useCallback((headhunters: HeadhunterResponse[], field: HeadhunterSortField, order: HeadhunterSortOrder) => {
    return [...headhunters].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'headhunter_id':
          aValue = a.headhunter_id
          bValue = b.headhunter_id
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'area_name':
          aValue = (a.area_name || '').toLowerCase()
          bValue = (b.area_name || '').toLowerCase()
          break
        case 'role':
          aValue = a.role.toLowerCase()
          bValue = b.role.toLowerCase()
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

  const fetchHeadhunters = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let response
      if (debouncedSearchQuery.trim().length > 0) {
        // Search headhunters by name
        response = await headhunterAPI.searchHeadhunters(
          debouncedSearchQuery,
          page,
          pageSize
        )
      } else {
        // Get all headhunters
        response = await headhunterAPI.getHeadhunters(page, pageSize)
      }

      const sortedHeadhunters = sortHeadhunters(response.data, sortOption.field, sortOption.order)

      setHeadhunters(sortedHeadhunters)
      setTotalItems(response.pagination?.total || response.data.length)
      setTotalPages(response.pagination?.total_pages || Math.ceil((response.pagination?.total || response.data.length) / pageSize))
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi tải danh sách nhân sự')
      }
      console.error('Error fetching headhunters:', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearchQuery, sortOption, sortHeadhunters])

  const searchHeadhunters = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setPage(1) // Reset to first page when searching

      let response
      if (debouncedSearchQuery.trim().length > 0) {
        response = await headhunterAPI.searchHeadhunters(
          debouncedSearchQuery,
          1, // Always start from page 1 for new search
          pageSize
        )
      } else {
        response = await headhunterAPI.getHeadhunters(1, pageSize)
      }

      const sortedHeadhunters = sortHeadhunters(response.data, sortOption.field, sortOption.order)

      setHeadhunters(sortedHeadhunters)
      setTotalItems(response.pagination?.total || response.data.length)
      setTotalPages(response.pagination?.total_pages || Math.ceil((response.pagination?.total || response.data.length) / pageSize))
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi tìm kiếm nhân sự')
      }
      console.error('Error searching headhunters:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchQuery, pageSize, sortOption, sortHeadhunters])

  const refetch = useCallback(async () => {
    await fetchHeadhunters()
  }, [fetchHeadhunters])

  const deleteHeadhunter = useCallback(async (headhunterId: number) => {
    try {
      await headhunterAPI.deleteHeadhunter(headhunterId)
      // Refetch the current page
      await fetchHeadhunters()
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.detail || err.message)
      } else {
        throw new Error('Có lỗi xảy ra khi xóa nhân sự')
      }
    }
  }, [fetchHeadhunters])

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

  // Fetch headhunters when dependencies change
  useEffect(() => {
    fetchHeadhunters()
  }, [fetchHeadhunters])

  return {
    headhunters,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    totalPages,
    searchQuery,
    sortOption,
    setPage,
    setPageSize,
    setSearchQuery,
    setSortOption,
    refetch,
    deleteHeadhunter,
    searchHeadhunters
  }
}
