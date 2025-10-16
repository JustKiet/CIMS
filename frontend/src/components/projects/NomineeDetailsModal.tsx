import React, { useState, useEffect, useCallback } from 'react'
import { candidateAPI, nomineeAPI, type CandidateResponse, type NomineeResponse } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { X, Building, User } from 'lucide-react'

interface NomineeDetailsModalProps {
  open: boolean
  onClose: () => void
  nomineeId: number
}

export const NomineeDetailsModal: React.FC<NomineeDetailsModalProps> = ({
  open,
  onClose,
  nomineeId
}) => {
  const [nominee, setNominee] = useState<NomineeResponse | null>(null)
  const [candidate, setCandidate] = useState<CandidateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch nominee details
      const nomineeResponse = await nomineeAPI.getNominee(nomineeId)
      if (nomineeResponse.success) {
        setNominee(nomineeResponse.data)
        
        // Fetch candidate details using candidate_id from nominee
        if (nomineeResponse.data.candidate_id) {
          const candidateResponse = await candidateAPI.getCandidate(nomineeResponse.data.candidate_id)
          if (candidateResponse.success) {
            setCandidate(candidateResponse.data)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching nominee/candidate data:', err)
      setError('Không thể tải thông tin ứng viên. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [nomineeId])

  useEffect(() => {
    if (open && nomineeId) {
      fetchData()
    }
  }, [open, nomineeId, fetchData])

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UNGCUYEN':
        return 'Ứng cuyển'
      case 'DUOCCHAP':
        return 'Được chấp'
      case 'BICHAP':
        return 'Bị chấp'
      case 'PHONGVAN':
        return 'Phỏng vấn'
      case 'NHANVIEC':
        return 'Nhận việc'
      case 'TUCHOI':
        return 'Từ chối'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa xác định'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết ứng viên đề cử</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && <LoadingSkeleton rows={6} />}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && nominee && candidate && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Nominee Details for this Project */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                  <Building className="w-5 h-5" />
                  Thông tin đề cử dự án
                </h3>
                
                <div className="space-y-4">
                  {/* Nominee ID + Project Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã đề cử
                      </label>
                      <input
                        type="text"
                        value={`#${nominee.nominee_id}`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dự án
                      </label>
                      <input
                        type="text"
                        value={nominee.project_name || `#${nominee.project_id}`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Campaign */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đợt đề cử
                    </label>
                    <input
                      type="text"
                      value={nominee.campaign}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <input
                      type="text"
                      value={getStatusText(nominee.status)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số năm kinh nghiệm
                    </label>
                    <input
                      type="text"
                      value={`${nominee.years_of_experience} năm`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Salary Expectation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lương mong muốn
                    </label>
                    <input
                      type="text"
                      value={nominee.salary_expectation ? `${nominee.salary_expectation.toLocaleString()} VND` : 'Chưa xác định'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Notice Period */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian báo trước
                    </label>
                    <input
                      type="text"
                      value={`${nominee.notice_period} ngày`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Headhunter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhân sự phụ trách
                    </label>
                    <input
                      type="text"
                      value={nominee.headhunter_name || 'Chưa xác định'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Created Date + Updated Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày tạo
                      </label>
                      <input
                        type="text"
                        value={formatDate(nominee.created_at)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cập nhật cuối
                      </label>
                      <input
                        type="text"
                        value={formatDate(nominee.updated_at)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Candidate Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                  <User className="w-5 h-5" />
                  Thông tin ứng viên
                </h3>
                
                <div className="space-y-4">
                  {/* Candidate Name + ID */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên ứng viên
                      </label>
                      <input
                        type="text"
                        value={candidate.name}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã ứng viên
                      </label>
                      <input
                        type="text"
                        value={`#${candidate.candidate_id}`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="text"
                      value={candidate.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={candidate.phone}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Year of Birth + Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Năm sinh
                      </label>
                      <input
                        type="text"
                        value={candidate.year_of_birth.toString()}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giới tính
                      </label>
                      <input
                        type="text"
                        value={candidate.gender}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Học vấn
                    </label>
                    <input
                      type="text"
                      value={candidate.education}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nguồn
                    </label>
                    <input
                      type="text"
                      value={candidate.source}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Expertise + Level */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chuyên môn
                      </label>
                      <input
                        type="text"
                        value={candidate.expertise_name || 'Chưa xác định'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cấp bậc
                      </label>
                      <input
                        type="text"
                        value={candidate.level_name || 'Chưa xác định'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Note */}
                  {candidate.note && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <textarea
                        value={candidate.note}
                        readOnly
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
