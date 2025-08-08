import React from 'react'
import { HeadhunterResponse } from '@/lib/api'
import { Edit, Trash2, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

interface HeadhunterTableProps {
  headhunters: HeadhunterResponse[]
  onEdit: (headhunter: HeadhunterResponse) => void
  onDelete: (headhunterId: number) => void
  loading?: boolean
  currentUser: HeadhunterResponse | null
}

const isAdmin = (user: HeadhunterResponse | null): boolean => {
  return user?.role?.toLowerCase() === 'admin'
}

export const HeadhunterTable: React.FC<HeadhunterTableProps> = ({
  headhunters,
  onEdit,
  onDelete,
  loading = false,
  currentUser
}) => {
  if (loading) {
    return <LoadingSkeleton rows={10} />
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: '#EFF4FA' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Danh sách nhân sự</h2>
        {headhunters.length > 0 && (
          <span className="text-sm text-gray-600">
            {headhunters.length} nhân sự
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên nhân sự
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã nhân sự
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khu vực
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {headhunters.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Không có nhân sự nào được tìm thấy
                </td>
              </tr>
            ) : (
              headhunters.map((headhunter) => {
                return (
                  <tr key={headhunter.headhunter_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {headhunter.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: '#982B1C' }}
                      >
                        #{headhunter.headhunter_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <a 
                            href={`mailto:${headhunter.email}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {headhunter.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <a 
                            href={`tel:${headhunter.phone}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {headhunter.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {headhunter.area_name || 'Chưa xác định'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {headhunter.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {isAdmin(currentUser) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(headhunter)}
                              className="h-8 w-8 text-gray-600 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(headhunter.headhunter_id)}
                              className="h-8 w-8 text-gray-600 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {!isAdmin(currentUser) && (
                          <span className="text-gray-500 text-sm">Chỉ admin mới có thể thao tác</span>
                        )}
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
