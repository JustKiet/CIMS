import React from 'react'
import { User, Briefcase, Users, Clock } from 'lucide-react'
import type { CandidateResponse, ProjectResponse, NomineeResponse } from '@/lib/api'

interface RecentActivityProps {
  candidates: CandidateResponse[]
  projects: ProjectResponse[]
  nominees: NomineeResponse[]
  className?: string
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'TIMKIEMUNGVIEN':
      return 'bg-blue-100 text-blue-800'
    case 'UNGVIENPHONGVAN':
      return 'bg-orange-100 text-orange-800'
    case 'UNGVIENTHUVIEC':
      return 'bg-purple-100 text-purple-800'
    case 'HOANTHANH':
      return 'bg-green-100 text-green-800'
    case 'DECU':
      return 'bg-gray-100 text-gray-800'
    case 'PHONGVAN':
      return 'bg-blue-100 text-blue-800'
    case 'THUONGLUONG':
      return 'bg-orange-100 text-orange-800'
    case 'THUVIEC':
      return 'bg-purple-100 text-purple-800'
    case 'KYHOPDONG':
      return 'bg-green-100 text-green-800'
    case 'TUCHOI':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'TIMKIEMUNGVIEN':
      return 'Tìm kiếm ứng viên'
    case 'UNGVIENPHONGVAN':
      return 'Ứng viên phỏng vấn'
    case 'UNGVIENTHUVIEC':
      return 'Ứng viên thử việc'
    case 'HOANTHANH':
      return 'Hoàn thành'
    case 'DECU':
      return 'Đề cử'
    case 'PHONGVAN':
      return 'Phỏng vấn'
    case 'THUONGLUONG':
      return 'Thương lượng'
    case 'THUVIEC':
      return 'Thử việc'
    case 'KYHOPDONG':
      return 'Ký hợp đồng'
    case 'TUCHOI':
      return 'Từ chối'
    default:
      return status
  }
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  candidates,
  projects,
  nominees,
  className = ''
}) => {
  // Combine all activities and sort by date
  const allActivities = [
    ...candidates.map(candidate => ({
      type: 'candidate' as const,
      id: candidate.candidate_id,
      title: candidate.name,
      subtitle: candidate.email,
      date: candidate.created_at,
      icon: User,
      color: 'bg-blue-500',
      status: undefined
    })),
    ...projects.map(project => ({
      type: 'project' as const,
      id: project.project_id,
      title: project.name,
      subtitle: getStatusText(project.status),
      date: project.created_at,
      icon: Briefcase,
      color: 'bg-green-500',
      status: project.status
    })),
    ...nominees.map(nominee => ({
      type: 'nominee' as const,
      id: nominee.nominee_id,
      title: nominee.nominee_name || `Nominee #${nominee.nominee_id}`,
      subtitle: getStatusText(nominee.status),
      date: nominee.created_at,
      icon: Users,
      color: 'bg-purple-500',
      status: nominee.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10) // Show only latest 10 activities

  return (
    <div className={`bg-gradient-to-br from-[#FFFAF4] to-white rounded-xl border border-[#982B1C]/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#982B1C]">Hoạt động gần đây</h3>
        <Clock className="w-5 h-5 text-[#982B1C]/60" />
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {allActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Không có hoạt động gần đây</p>
          </div>
        ) : (
          allActivities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div
                key={`${activity.type}-${activity.id}-${index}`}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className={`p-2 rounded-full ${activity.color} text-white flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600 truncate">
                      {activity.subtitle}
                    </p>
                    {activity.status && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(activity.status)}`}>
                        {getStatusText(activity.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
