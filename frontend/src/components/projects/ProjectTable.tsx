import React from 'react'
import { ProjectResponse } from '@/lib/api'
import { formatProjectStatus, formatDate, formatProjectDisplayName } from '@/utils/projectUtils'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

interface ProjectTableProps {
  projects: ProjectResponse[]
  onEdit: (project: ProjectResponse) => void
  onDelete: (projectId: number) => void
  loading?: boolean
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  onEdit,
  onDelete,
  loading = false
}) => {
  if (loading) {
    return <LoadingSkeleton rows={10} />
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: '#EFF4FA' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Danh sách dự án</h2>
        {projects.length > 0 && (
          <span className="text-sm text-gray-600">
            {projects.length} dự án
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã dự án
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày bắt đầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày kết thúc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiến độ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Không có dự án nào được tìm thấy
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const status = formatProjectStatus(project.status)
                return (
                  <tr key={project.project_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatProjectDisplayName(project)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: '#982B1C' }}
                      >
                        #{project.project_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(project.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(project.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-white ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(project)}
                          className="h-8 w-8 text-gray-600 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(project.project_id)}
                          className="h-8 w-8 text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
