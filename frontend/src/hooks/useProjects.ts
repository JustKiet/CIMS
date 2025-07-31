import { useState, useEffect, useCallback } from 'react'
import { projectAPI, ProjectResponse, APIError } from '@/lib/api'
import { useDebounce } from './useDebounce'
import { SortOption, SortField, SortOrder } from '@/components/projects/ProjectHeader'
import { formatProjectDisplayName } from '@/utils/projectUtils'

interface UseProjectsOptions {
  initialPageSize?: number
  initialPage?: number
}

interface UseProjectsReturn {
  projects: ProjectResponse[]
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  searchQuery: string
  sortOption: SortOption
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSearchQuery: (query: string) => void
  setSortOption: (option: SortOption) => void
  refetch: () => Promise<void>
  deleteProject: (projectId: number) => Promise<void>
}

export const useProjects = (options: UseProjectsOptions = {}): UseProjectsReturn => {
  const { initialPageSize = 10, initialPage = 1 } = options

  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'name', order: 'asc' })

  // Debounce search query updates
  const debouncedSetSearch = useDebounce((query: string) => {
    setDebouncedSearchQuery(query)
  }, 500)

  useEffect(() => {
    debouncedSetSearch(searchQuery)
  }, [searchQuery, debouncedSetSearch])

  const sortProjects = useCallback((projects: ProjectResponse[], field: SortField, order: SortOrder) => {
    return [...projects].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (field) {
        case 'name':
          aValue = formatProjectDisplayName(a).toLowerCase()
          bValue = formatProjectDisplayName(b).toLowerCase()
          break
        case 'project_id':
          aValue = a.project_id
          bValue = b.project_id
          break
        case 'start_date':
          aValue = new Date(a.start_date)
          bValue = new Date(b.start_date)
          break
        case 'end_date':
          aValue = new Date(a.end_date)
          bValue = new Date(b.end_date)
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'customer_name':
          aValue = (a.customer_name || '').toLowerCase()
          bValue = (b.customer_name || '').toLowerCase()
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

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let response
      if (debouncedSearchQuery.trim()) {
        response = await projectAPI.searchProjects(debouncedSearchQuery, page, pageSize)
      } else {
        response = await projectAPI.getProjects(page, pageSize)
      }

      const sortedProjects = sortProjects(response.data, sortOption.field, sortOption.order)

      setProjects(sortedProjects)
      setTotalItems(response.pagination?.total || response.data.length)
      setTotalPages(response.pagination?.total_pages || Math.ceil((response.pagination?.total || response.data.length) / pageSize))
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi tải danh sách dự án')
      }
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearchQuery, sortOption, sortProjects])

  const refetch = useCallback(async () => {
    await fetchProjects()
  }, [fetchProjects])

  const deleteProject = useCallback(async (projectId: number) => {
    try {
      await projectAPI.deleteProject(projectId)
      // Refetch the current page
      await fetchProjects()
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.detail || err.message)
      } else {
        throw new Error('Có lỗi xảy ra khi xóa dự án')
      }
    }
  }, [fetchProjects])

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

  // Fetch projects when dependencies change
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
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
    deleteProject
  }
}
