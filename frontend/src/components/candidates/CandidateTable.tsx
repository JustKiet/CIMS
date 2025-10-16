import React, { useState } from 'react'
import { CandidateResponse } from '@/lib/api'
import { Trash2, UserPlus, Edit } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { CandidateNominationModal } from './CandidateNominationModal'
import { CandidateUpdateModal } from './CandidateUpdateModal'

interface CandidateTableProps {
  candidates: CandidateResponse[]
  onEdit: (candidate: CandidateResponse) => void
  onDelete: (candidateId: number) => void
  onRefresh?: () => void
  loading?: boolean
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  onDelete,
  onRefresh,
  loading = false
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResponse | null>(null)
  const [isNominationModalOpen, setIsNominationModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  const handleNomination = (candidate: CandidateResponse) => {
    setSelectedCandidate(candidate)
    setIsNominationModalOpen(true)
  }

  const handleEdit = (candidate: CandidateResponse) => {
    setSelectedCandidate(candidate)
    setIsUpdateModalOpen(true)
  }

  const handleCloseNominationModal = () => {
    setIsNominationModalOpen(false)
    setSelectedCandidate(null)
  }

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false)
    setSelectedCandidate(null)
  }

  const handleUpdateSuccess = () => {
    if (onRefresh) {
      onRefresh()
    }
  }
  if (loading) {
    return <LoadingSkeleton rows={10} />
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: '#EFF4FA' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Danh sách ứng viên</h2>
        {candidates.length > 0 && (
          <span className="text-sm text-gray-600">
            {candidates.length} ứng viên
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên ứng viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã ứng viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chuyên môn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lĩnh vực
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khu vực
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhân sự phụ trách
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Không có ứng viên nào được tìm thấy
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => {
                return (
                  <tr 
                    key={candidate.candidate_id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(candidate)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: '#982B1C' }}
                      >
                        #{candidate.candidate_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.expertise_name || 'Chưa xác định'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.field_name || 'Chưa xác định'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {candidate.area_name || 'Chưa xác định'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.headhunter_name || 'Chưa xác định'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(candidate)
                          }}
                          className="h-8 w-8 text-gray-600 hover:text-blue-600"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(candidate.candidate_id)
                          }}
                          className="h-8 w-8 text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNomination(candidate)
                          }}
                          className="h-8 w-8 text-gray-600 hover:text-green-600"
                          title="Quản lý đề cử"
                        >
                          <UserPlus className="h-4 w-4" />
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

      {/* Nomination Modal */}
      <CandidateNominationModal
        open={isNominationModalOpen}
        onClose={handleCloseNominationModal}
        candidate={selectedCandidate}
        onSuccess={() => {
          // Optional: Add any refresh logic here if needed
          console.log('Nomination operation completed successfully')
        }}
      />

      {/* Update Modal */}
      <CandidateUpdateModal
        open={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        candidate={selectedCandidate}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  )
}
