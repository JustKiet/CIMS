import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Edit, Trash2 } from 'lucide-react'
import { 
  CandidateResponse, 
  NomineeResponse, 
  NomineeCreate, 
  NomineeUpdate, 
  ProjectResponse,
  NomineeStatus,
  nomineeAPI,
  projectAPI
} from '@/lib/api'
import { Button } from '@/components/ui/Button'

interface CandidateNominationModalProps {
  open: boolean
  onClose: () => void
  candidate: CandidateResponse | null
  onSuccess: () => void
}

interface DropdownOption {
  id: number
  name: string
}

const STATUS_OPTIONS: { value: NomineeStatus; label: string }[] = [
  { value: 'DECU', label: 'Đề cử' },
  { value: 'PHONGVAN', label: 'Phỏng vấn' },
  { value: 'THUONGLUONG', label: 'Thương lượng' },
  { value: 'THUVIEC', label: 'Thử việc' },
  { value: 'TUCHOI', label: 'Từ chối' },
  { value: 'KYHOPDONG', label: 'Ký hợp đồng' },
]

export const CandidateNominationModal: React.FC<CandidateNominationModalProps> = ({
  open,
  onClose,
  candidate,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nominees, setNominees] = useState<NomineeResponse[]>([])
  const [selectedNominee, setSelectedNominee] = useState<NomineeResponse | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [projects, setProjects] = useState<DropdownOption[]>([])
  
  // Form data
  const [formData, setFormData] = useState({
    project_id: null as number | null,
    campaign: '',
    status: 'DECU' as NomineeStatus,
    years_of_experience: 0,
    salary_expectation: 0,
    notice_period: 30,
  })

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<'project' | 'status' | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  const resetForm = () => {
    setFormData({
      project_id: null,
      campaign: '',
      status: 'DECU',
      years_of_experience: 0,
      salary_expectation: 0,
      notice_period: 30,
    })
    setSelectedNominee(null)
    setIsEditing(false)
    setError(null)
  }

  const loadNominees = useCallback(async () => {
    if (!candidate) return
    
    try {
      setLoading(true)
      const response = await nomineeAPI.getNomineesByCandidate(candidate.candidate_id)
      setNominees(response.data)
    } catch (err) {
      console.error('Error loading nominees:', err)
      setNominees([])
    } finally {
      setLoading(false)
    }
  }, [candidate])

  // Load data when modal opens
  useEffect(() => {
    if (open && candidate) {
      loadNominees()
      loadProjects()
      resetForm()
    }
  }, [open, candidate, loadNominees])

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getProjects(1, 100)
      setProjects(response.data.map((p: ProjectResponse) => ({ 
        id: p.project_id, 
        name: p.name 
      })))
    } catch (err) {
      console.error('Error loading projects:', err)
      setProjects([]) // Ensure empty array on error
      setError('Không thể tải danh sách dự án')
    }
  }

  const handleEdit = (nominee: NomineeResponse) => {
    setSelectedNominee(nominee)
    setFormData({
      project_id: nominee.project_id,
      campaign: nominee.campaign,
      status: nominee.status,
      years_of_experience: nominee.years_of_experience,
      salary_expectation: nominee.salary_expectation,
      notice_period: nominee.notice_period,
    })
    setIsEditing(true)
  }

  const handleDelete = async (nomineeId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề cử này?')) return
    
    try {
      setLoading(true)
      await nomineeAPI.deleteNominee(nomineeId)
      await loadNominees()
      onSuccess()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Có lỗi xảy ra khi xóa đề cử')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!candidate || !formData.project_id) {
      setError('Vui lòng chọn dự án')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (isEditing && selectedNominee) {
        const updateData: NomineeUpdate = {
          project_id: formData.project_id,
          campaign: formData.campaign,
          status: formData.status,
          years_of_experience: formData.years_of_experience,
          salary_expectation: formData.salary_expectation,
          notice_period: formData.notice_period,
        }
        await nomineeAPI.updateNominee(selectedNominee.nominee_id, updateData)
      } else {
        const createData: NomineeCreate = {
          candidate_id: candidate.candidate_id,
          project_id: formData.project_id,
          campaign: formData.campaign,
          status: formData.status,
          years_of_experience: formData.years_of_experience,
          salary_expectation: formData.salary_expectation,
          notice_period: formData.notice_period,
        }
        await nomineeAPI.createNominee(createData)
      }

      await loadNominees()
      resetForm()
      onSuccess()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Có lỗi xảy ra khi lưu đề cử')
      }
    } finally {
      setLoading(false)
    }
  }

  const SimpleDropdown: React.FC<{
    label: string
    value: number | string | null
    options: DropdownOption[] | { value: string; label: string }[]
    onSelect: (value: number | string) => void
    isOpen: boolean
    onToggle: () => void
    required?: boolean
  }> = ({ label, value, options, onSelect, isOpen, onToggle, required = false }) => {
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
    
    const selectedOption = options.length > 0 && 'id' in options[0] 
      ? (options as DropdownOption[]).find(opt => opt.id === value)
      : (options as { value: string; label: string }[]).find(opt => opt.value === value)

    useEffect(() => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        const modalRect = modalRef.current?.getBoundingClientRect()
        
        if (modalRect) {
          const spaceBelow = modalRect.bottom - rect.bottom
          const spaceAbove = rect.top - modalRect.top
          
          // If there's not enough space below (less than 160px for dropdown), position above
          setDropdownPosition(spaceBelow < 160 && spaceAbove > 160 ? 'top' : 'bottom')
        }
      }
    }, [isOpen])

    return (
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={onToggle}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption 
                ? ('id' in selectedOption ? selectedOption.name : selectedOption.label)
                : `Chọn ${label.toLowerCase()}`
              }
            </span>
          </button>
          
          {isOpen && (
            <div 
              className={`absolute z-[60] w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto ${
                dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
              style={{
                maxHeight: dropdownPosition === 'top' ? '160px' : '160px'
              }}
            >
              {options.length > 0 ? options.map((option) => (
                <button
                  key={'id' in option ? option.id : option.value}
                  type="button"
                  onClick={() => {
                    onSelect('id' in option ? option.id : option.value)
                    setOpenDropdown(null)
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {'id' in option ? option.name : option.label}
                </button>
              )) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Không có dữ liệu
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!open || !candidate) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">QUẢN LÝ ĐỀ CỬ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1" style={{ overflowX: 'visible' }}>
          {/* Existing Nominees */}
          {nominees.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Danh sách đề cử hiện tại</h3>
              <div className="space-y-2">
                {nominees.map((nominee) => (
                  <div key={nominee.nominee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 flex-1 text-sm">
                      <div><span className="font-medium">Mã đề cử:</span> #{nominee.nominee_id}</div>
                      <div><span className="font-medium">Dự án:</span> {nominee.project_name || 'N/A'}</div>
                      <div><span className="font-medium">Trạng thái:</span> {STATUS_OPTIONS.find(s => s.value === nominee.status)?.label}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(nominee)}
                        className="h-8 w-8 text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(nominee.nominee_id)}
                        className="h-8 w-8 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Candidate Information Fields - Read Only */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên ứng viên
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhân sự phụ trách
                  </label>
                  <input
                    type="text"
                    value={candidate.headhunter_name || 'Chưa xác định'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Nomination Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SimpleDropdown
                  label="Dự án"
                  value={formData.project_id}
                  options={projects}
                  onSelect={(id) => setFormData(prev => ({ ...prev, project_id: Number(id) }))}
                  isOpen={openDropdown === 'project'}
                  onToggle={() => setOpenDropdown(openDropdown === 'project' ? null : 'project')}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đợt đề cử <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.campaign}
                    onChange={(e) => setFormData(prev => ({ ...prev, campaign: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <SimpleDropdown
                  label="Trạng thái"
                  value={formData.status}
                  options={STATUS_OPTIONS}
                  onSelect={(status) => setFormData(prev => ({ ...prev, status: status as NomineeStatus }))}
                  isOpen={openDropdown === 'status'}
                  onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số năm kinh nghiệm
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức lương mong muốn (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salary_expectation}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_expectation: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notice Period (ngày)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.notice_period}
                    onChange={(e) => setFormData(prev => ({ ...prev, notice_period: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  style={{ backgroundColor: '#F0F0F0' }}
                  onClick={() => {
                    resetForm()
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#982B1C' }}
                  className="text-white"
                >
                  {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo đề cử')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
