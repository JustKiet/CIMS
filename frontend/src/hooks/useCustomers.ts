import { useState, useEffect, useCallback } from 'react'
import { customerAPI, CustomerResponse, APIError } from '@/lib/api'
import { useDebounce } from './useDebounce'

export type CustomerSortField = 'name' | 'customer_id' | 'representative_name' | 'representative_email'
export type CustomerSortOrder = 'asc' | 'desc'

export interface CustomerSortOption {
  field: CustomerSortField
  order: CustomerSortOrder
}

interface UseCustomersOptions {
  initialPageSize?: number
  initialPage?: number
}

interface UseCustomersReturn {
  customers: CustomerResponse[]
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  searchQuery: string
  sortOption: CustomerSortOption
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSearchQuery: (query: string) => void
  setSortOption: (option: CustomerSortOption) => void
  refetch: () => Promise<void>
  deleteCustomer: (customerId: number) => Promise<void>
  searchCustomers: () => Promise<void>
}

export const useCustomers = (options: UseCustomersOptions = {}): UseCustomersReturn => {
  const { initialPageSize = 10, initialPage = 1 } = options

  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<CustomerSortOption>({ field: 'name', order: 'asc' })

  // Debounce search query updates
  const debouncedSetSearch = useDebounce((query: string) => {
    setDebouncedSearchQuery(query)
  }, 500)

  useEffect(() => {
    debouncedSetSearch(searchQuery)
  }, [searchQuery, debouncedSetSearch])

  const sortCustomers = useCallback((customers: CustomerResponse[], field: CustomerSortField, order: CustomerSortOrder) => {
    return [...customers].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'customer_id':
          aValue = a.customer_id
          bValue = b.customer_id
          break
        case 'representative_name':
          aValue = a.representative_name.toLowerCase()
          bValue = b.representative_name.toLowerCase()
          break
        case 'representative_email':
          aValue = a.representative_email.toLowerCase()
          bValue = b.representative_email.toLowerCase()
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

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let response
      if (debouncedSearchQuery.trim().length > 0) {
        // Search customers by name
        response = await customerAPI.searchCustomers(
          debouncedSearchQuery,
          page,
          pageSize
        )
      } else {
        // Get all customers
        response = await customerAPI.getCustomers(page, pageSize)
      }

      const sortedCustomers = sortCustomers(response.data, sortOption.field, sortOption.order)

      setCustomers(sortedCustomers)
      setTotalItems(response.pagination?.total || response.data.length)
      setTotalPages(response.pagination?.total_pages || Math.ceil((response.pagination?.total || response.data.length) / pageSize))
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi tải danh sách khách hàng')
      }
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearchQuery, sortOption, sortCustomers])

  const searchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setPage(1) // Reset to first page when searching

      let response
      if (debouncedSearchQuery.trim().length > 0) {
        response = await customerAPI.searchCustomers(
          debouncedSearchQuery,
          1, // Always start from page 1 for new search
          pageSize
        )
      } else {
        response = await customerAPI.getCustomers(1, pageSize)
      }

      const sortedCustomers = sortCustomers(response.data, sortOption.field, sortOption.order)

      setCustomers(sortedCustomers)
      setTotalItems(response.pagination?.total || response.data.length)
      setTotalPages(response.pagination?.total_pages || Math.ceil((response.pagination?.total || response.data.length) / pageSize))
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi tìm kiếm khách hàng')
      }
      console.error('Error searching customers:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchQuery, pageSize, sortOption, sortCustomers])

  const refetch = useCallback(async () => {
    await fetchCustomers()
  }, [fetchCustomers])

  const deleteCustomer = useCallback(async (customerId: number) => {
    try {
      await customerAPI.deleteCustomer(customerId)
      // Refetch the current page
      await fetchCustomers()
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.detail || err.message)
      } else {
        throw new Error('Có lỗi xảy ra khi xóa khách hàng')
      }
    }
  }, [fetchCustomers])

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

  // Fetch customers when dependencies change
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return {
    customers,
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
    deleteCustomer,
    searchCustomers
  }
}
