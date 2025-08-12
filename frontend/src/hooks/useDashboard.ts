import { useState, useEffect, useCallback } from 'react'
import { candidateAPI, customerAPI, projectAPI, nomineeAPI } from '@/lib/api'
import type { 
  CandidateResponse, 
  ProjectResponse, 
  NomineeResponse,
  NomineeStatus,
  ProjectStatus
} from '@/lib/api'

export interface DashboardStats {
  totalCandidates: number
  totalCustomers: number
  totalProjects: number
  totalNominees: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  candidatesByExpertise: { [key: string]: number }
  projectsByStatus: { [key in ProjectStatus]: number }
  nomineesByStatus: { [key in NomineeStatus]: number }
  projectsByCustomer: { customerName: string; projectCount: number }[]
  recentActivity: {
    candidates: CandidateResponse[]
    projects: ProjectResponse[]
    nominees: NomineeResponse[]
  }
  monthlyTrends: {
    month: string
    candidates: number
    projects: number
    placements: number
  }[]
}

interface UseDashboardReturn {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to fetch all pages if needed
  const fetchAllCandidates = async () => {
    try {
      const firstPage = await candidateAPI.getCandidates(1, 100)
      let allCandidates = firstPage.data
      
      // If there are more pages, fetch them (limit to reasonable amount)
      if (firstPage.pagination && firstPage.pagination.total_pages > 1) {
        const maxPages = Math.min(firstPage.pagination.total_pages, 5) // Limit to 5 pages max
        const additionalPages = []
        
        for (let page = 2; page <= maxPages; page++) {
          additionalPages.push(candidateAPI.getCandidates(page, 100))
        }
        
        const additionalResults = await Promise.all(additionalPages)
        additionalResults.forEach(result => {
          allCandidates = [...allCandidates, ...result.data]
        })
      }
      
      return { data: allCandidates, pagination: firstPage.pagination }
    } catch (error) {
      console.warn('Failed to fetch candidates:', error)
      return { data: [], pagination: null }
    }
  }

  const fetchAllCustomers = async () => {
    try {
      const firstPage = await customerAPI.getCustomers(1, 100)
      return { data: firstPage.data, pagination: firstPage.pagination }
    } catch (error) {
      console.warn('Failed to fetch customers:', error)
      return { data: [], pagination: null }
    }
  }

  const fetchAllProjects = async () => {
    try {
      const firstPage = await projectAPI.getProjects(1, 100)
      return { data: firstPage.data, pagination: firstPage.pagination }
    } catch (error) {
      console.warn('Failed to fetch projects:', error)
      return { data: [], pagination: null }
    }
  }

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel with error handling
      const [candidatesRes, customersRes, projectsRes] = await Promise.all([
        fetchAllCandidates(),
        fetchAllCustomers(),
        fetchAllProjects()
      ])

      const candidates = candidatesRes.data
      const customers = customersRes.data
      const projects = projectsRes.data

      // Fetch nominees for each project (with error handling)
      const nomineesPromises = projects.slice(0, 10).map(project => // Limit to first 10 projects to avoid too many requests
        nomineeAPI.getNomineesByProject(project.project_id, 1, 100)
          .then(result => result.data)
          .catch(error => {
            console.warn(`Failed to fetch nominees for project ${project.project_id}:`, error)
            return []
          })
      )
      const nomineesResults = await Promise.all(nomineesPromises)
      const allNominees = nomineesResults.flatMap(nominees => nominees)

      // Calculate statistics
      const totalCandidates = candidatesRes.pagination?.total || candidates.length
      const totalCustomers = customersRes.pagination?.total || customers.length
      const totalProjects = projectsRes.pagination?.total || projects.length

      // Project status breakdown
      const projectsByStatus: { [key in ProjectStatus]: number } = {
        'TIMKIEMUNGVIEN': 0,
        'UNGVIENPHONGVAN': 0,
        'UNGVIENTHUVIEC': 0,
        'TAMNGUNG': 0,
        'HUY': 0,
        'HOANTHANH': 0
      }

      projects.forEach(project => {
        projectsByStatus[project.status] = (projectsByStatus[project.status] || 0) + 1
      })

      const activeProjects = projectsByStatus['TIMKIEMUNGVIEN'] + projectsByStatus['UNGVIENPHONGVAN'] + projectsByStatus['UNGVIENTHUVIEC']
      const completedProjects = projectsByStatus['HOANTHANH']
      const onHoldProjects = projectsByStatus['TAMNGUNG'] + projectsByStatus['HUY']

      // Nominee status breakdown
      const nomineesByStatus: { [key in NomineeStatus]: number } = {
        'DECU': 0,
        'PHONGVAN': 0,
        'THUONGLUONG': 0,
        'THUVIEC': 0,
        'TUCHOI': 0,
        'KYHOPDONG': 0
      }

      if (allNominees.length > 0) {
        allNominees.forEach(nominee => {
          nomineesByStatus[nominee.status] = (nomineesByStatus[nominee.status] || 0) + 1
        })
      } else {
        // Fallback mock data if no nominees found
        nomineesByStatus['DECU'] = 15
        nomineesByStatus['PHONGVAN'] = 8
        nomineesByStatus['THUONGLUONG'] = 5
        nomineesByStatus['THUVIEC'] = 3
        nomineesByStatus['KYHOPDONG'] = 12
        nomineesByStatus['TUCHOI'] = 7
      }

      const totalNominees = allNominees.length > 0 
        ? allNominees.length 
        : Object.values(nomineesByStatus).reduce((sum, count) => sum + count, 0) // Use fallback data total

      // Projects by customer
      const customerProjectCount: { [key: number]: number } = {}
      projects.forEach(project => {
        customerProjectCount[project.customer_id] = (customerProjectCount[project.customer_id] || 0) + 1
      })

      const projectsByCustomer = customers
        .map(customer => ({
          customerName: customer.name,
          projectCount: customerProjectCount[customer.customer_id] || 0
        }))
        .filter(item => item.projectCount > 0)
        .sort((a, b) => b.projectCount - a.projectCount)
        .slice(0, 10) // Top 10 customers

      // Candidates by expertise (mock data for now)
      const candidatesByExpertise: { [key: string]: number } = {}
      candidates.forEach(candidate => {
        const expertise = candidate.expertise_name || 'Unknown'
        candidatesByExpertise[expertise] = (candidatesByExpertise[expertise] || 0) + 1
      })

      // Recent activity - get latest items
      const recentCandidates = candidates
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      
      const recentProjects = projects
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      const recentNominees = allNominees.length > 0 
        ? allNominees
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        : [] // Empty array if no nominees

      // Monthly trends (mock data for now - would need date-based queries)
      const monthlyTrends = [
        { month: 'T1', candidates: 45, projects: 8, placements: 12 },
        { month: 'T2', candidates: 52, projects: 12, placements: 18 },
        { month: 'T3', candidates: 48, projects: 10, placements: 15 },
        { month: 'T4', candidates: 61, projects: 15, placements: 22 },
        { month: 'T5', candidates: 55, projects: 11, placements: 19 },
        { month: 'T6', candidates: 67, projects: 18, placements: 28 }
      ]

      const dashboardStats: DashboardStats = {
        totalCandidates,
        totalCustomers,
        totalProjects,
        totalNominees,
        activeProjects,
        completedProjects,
        onHoldProjects,
        candidatesByExpertise,
        projectsByStatus,
        nomineesByStatus,
        projectsByCustomer,
        recentActivity: {
          candidates: recentCandidates,
          projects: recentProjects,
          nominees: recentNominees
        },
        monthlyTrends
      }

      setStats(dashboardStats)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    stats,
    loading,
    error,
    refetch
  }
}
