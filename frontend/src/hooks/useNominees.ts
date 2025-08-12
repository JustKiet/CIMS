import { useState, useEffect, useCallback } from 'react'
import { nomineeAPI, NomineeResponse, APIError } from '@/lib/api'

interface UseNomineesReturn {
  nominees: NomineeResponse[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getNomineesByProject: (projectId: number) => Promise<NomineeResponse[]>
  getNomineesByCandidate: (candidateId: number) => Promise<NomineeResponse[]>
}

export const useNominees = (): UseNomineesReturn => {
  const [nominees, setNominees] = useState<NomineeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllNominees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Since there's no get all nominees endpoint, we'll start with empty array
      // and let components fetch specific nominees as needed
      setNominees([])
    } catch (err) {
      console.error('Error fetching nominees:', err)
      setError(err instanceof APIError ? err.message : 'Failed to fetch nominees')
    } finally {
      setLoading(false)
    }
  }, [])

  const getNomineesByProject = useCallback(async (projectId: number): Promise<NomineeResponse[]> => {
    try {
      const response = await nomineeAPI.getNomineesByProject(projectId, 1, 100)
      return response.data
    } catch (err) {
      console.error('Error fetching nominees by project:', err)
      throw err
    }
  }, [])

  const getNomineesByCandidate = useCallback(async (candidateId: number): Promise<NomineeResponse[]> => {
    try {
      const response = await nomineeAPI.getNomineesByCandidate(candidateId, 1, 100)
      return response.data
    } catch (err) {
      console.error('Error fetching nominees by candidate:', err)
      throw err
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchAllNominees()
  }, [fetchAllNominees])

  useEffect(() => {
    fetchAllNominees()
  }, [fetchAllNominees])

  return {
    nominees,
    loading,
    error,
    refetch,
    getNomineesByProject,
    getNomineesByCandidate
  }
}
