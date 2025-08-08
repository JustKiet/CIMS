import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, ChevronDown } from 'lucide-react'
import { 
  projectAPI, 
  nomineeAPI,
  candidateAPI,
  customerAPI, 
  expertiseAPI, 
  areaAPI, 
  levelAPI, 
  ProjectResponse, 
  ProjectUpdate, 
  NomineeResponse,
  CustomerResponse,
  ExpertiseResponse,
  AreaResponse,
  LevelResponse,
  NomineeStatus,
  ProjectStatus,
  ProjectType,
  APIError 
} from '@/lib/api'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ProjectUpdateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  project: ProjectResponse | null
}

interface DropdownOption {
  id: number
  name: string
}

interface NomineeWithCandidate extends NomineeResponse {
  candidate_name?: string
  candidate_phone?: string
}

// Nominee statuses for the columns
const NOMINEE_STATUSES: { key: NomineeStatus; label: string; color: string }[] = [
  { key: 'DECU', label: 'Đề cử', color: 'bg-gray-100 text-gray-900 border-gray-400' },
  { key: 'PHONGVAN', label: 'Phỏng vấn', color: 'bg-gray-100 text-gray-900 border-gray-400' },
  { key: 'THUONGLUONG', label: 'Thương lượng', color: 'bg-gray-100 text-gray-900 border-gray-400' },
  { key: 'THUVIEC', label: 'Thử việc', color: 'bg-gray-100 text-gray-900 border-gray-400' },
  { key: 'KYHOPDONG', label: 'Ký hợp đồng', color: 'bg-gray-100 text-gray-900 border-gray-400' },
]

const REJECTED_STATUS = { key: 'TUCHOI' as NomineeStatus, label: 'Từ chối', color: 'bg-gray-100 text-gray-900 border-gray-400' }

interface NomineeCardProps {
  nominee: NomineeWithCandidate
  isDragging?: boolean
}

const NomineeCard: React.FC<NomineeCardProps> = ({ nominee, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: nominee.nominee_id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="text-sm font-medium text-gray-900 mb-1">
        {nominee.candidate_name || 'Không tìm thấy tên'}
      </div>
      <div className="text-xs text-gray-600">
        {nominee.candidate_phone || 'Không có SĐT'}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Kinh nghiệm: {nominee.years_of_experience} năm
      </div>
    </div>
  )
}

interface DroppableColumnProps {
  status: NomineeStatus
  label: string
  color: string
  nominees: NomineeWithCandidate[]
  children: React.ReactNode
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ status, label, color, nominees, children }) => {
  const { setNodeRef } = useDroppable({
    id: status,
  })

  return (
    <div className="h-full flex flex-col border-r border-black">
      <div className={`p-3 border-b border-black ${color} flex-shrink-0`}>
        <h4 className="font-bold text-sm mb-1 text-black">{label}</h4>
        <span className="text-xs text-gray-600">{nominees.length} ứng viên</span>
      </div>
      <div ref={setNodeRef} className="flex-1 space-y-2 overflow-y-auto p-2">
        <SortableContext items={nominees.map(n => n.nominee_id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  )
}

export const ProjectUpdateModal: React.FC<ProjectUpdateModalProps> = ({
  open,
  onClose,
  onSuccess,
  project
}) => {
  const [formData, setFormData] = useState<ProjectUpdate>({
    name: '',
    start_date: '',
    end_date: '',
    budget: undefined,
    budget_currency: 'VND',
    type: 'CODINH' as ProjectType,
    required_recruits: undefined,
    recruited: undefined,
    status: 'TIMKIEMUNGVIEN' as ProjectStatus,
    customer_id: undefined,
    expertise_id: undefined,
    area_id: undefined,
    level_id: undefined
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dropdown data
  const [customers, setCustomers] = useState<DropdownOption[]>([])
  const [expertises, setExpertises] = useState<DropdownOption[]>([])
  const [areas, setAreas] = useState<DropdownOption[]>([])
  const [levels, setLevels] = useState<DropdownOption[]>([])
  
  // Nominees data
  const [projectNominees, setProjectNominees] = useState<NomineeWithCandidate[]>([])
  const [nomineesLoading, setNomineesLoading] = useState(false)
  
  // Search states for dropdowns
  const [customerSearch, setCustomerSearch] = useState('')
  const [expertiseSearch, setExpertiseSearch] = useState('')
  const [areaSearch, setAreaSearch] = useState('')
  const [levelSearch, setLevelSearch] = useState('')
  
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'customer' | 'expertise' | 'area' | 'level' | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Drag and drop
  const [activeId, setActiveId] = useState<string | number | null>(null)
  const [draggedNominee, setDraggedNominee] = useState<NomineeWithCandidate | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadDropdownData()
      if (project) {
        loadProjectNominees(project.project_id)
      }
    }
  }, [open, project])

  // Populate form with project data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.budget,
        budget_currency: project.budget_currency,
        type: project.type,
        required_recruits: project.required_recruits,
        recruited: project.recruited,
        status: project.status,
        customer_id: project.customer_id,
        expertise_id: project.expertise_id,
        area_id: project.area_id,
        level_id: project.level_id
      })
      
      // Set search values to show current selections
      const currentCustomer = customers.find(c => c.id === project.customer_id)
      if (currentCustomer) {
        setCustomerSearch(currentCustomer.name)
      }
      
      const currentExpertise = expertises.find(e => e.id === project.expertise_id)
      if (currentExpertise) {
        setExpertiseSearch(currentExpertise.name)
      }
      
      const currentArea = areas.find(a => a.id === project.area_id)
      if (currentArea) {
        setAreaSearch(currentArea.name)
      }
      
      const currentLevel = levels.find(l => l.id === project.level_id)
      if (currentLevel) {
        setLevelSearch(currentLevel.name)
      }
    }
  }, [project, customers, expertises, areas, levels])

  const loadDropdownData = async () => {
    try {
      const [customersRes, expertisesRes, areasRes, levelsRes] = await Promise.allSettled([
        customerAPI.getCustomers(1, 100),
        expertiseAPI.getExpertises(1, 100),
        areaAPI.getAreas(1, 100),
        levelAPI.getLevels(1, 100)
      ])

      if (customersRes.status === 'fulfilled') {
        setCustomers(customersRes.value.data.map((customer: CustomerResponse) => ({
          id: customer.customer_id,
          name: customer.name
        })))
      } else {
        console.error('Failed to load customers:', customersRes.reason)
        throw new Error('Failed to load customers')
      }

      if (expertisesRes.status === 'fulfilled') {
        setExpertises(expertisesRes.value.data.map((expertise: ExpertiseResponse) => ({
          id: expertise.expertise_id,
          name: expertise.name
        })))
      } else {
        console.error('Failed to load expertises:', expertisesRes.reason)
        throw new Error('Failed to load expertises')
      }

      if (areasRes.status === 'fulfilled') {
        setAreas(areasRes.value.data.map((area: AreaResponse) => ({
          id: area.area_id,
          name: area.name
        })))
      } else {
        console.error('Failed to load areas:', areasRes.reason)
        throw new Error('Failed to load areas')
      }

      if (levelsRes.status === 'fulfilled') {
        setLevels(levelsRes.value.data.map((level: LevelResponse) => ({
          id: level.level_id,
          name: level.name
        })))
      } else {
        console.error('Failed to load levels:', levelsRes.reason)
        throw new Error('Failed to load levels')
      }

    } catch (err) {
      console.error('Error loading dropdown data:', err)
      setError('Không thể tải dữ liệu dropdown')
    }
  }

  const loadProjectNominees = async (projectId: number) => {
    try {
      setNomineesLoading(true)
      const nomineesRes = await nomineeAPI.getNomineesByProject(projectId, 1, 100)
      
      // Fetch candidate details for each nominee
      const nomineesWithCandidates = await Promise.allSettled(
        nomineesRes.data.map(async (nominee) => {
          try {
            const candidateRes = await candidateAPI.getCandidate(nominee.candidate_id)
            return {
              ...nominee,
              candidate_name: candidateRes.data.name,
              candidate_phone: candidateRes.data.phone
            }
          } catch (err) {
            console.error(`Error loading candidate ${nominee.candidate_id}:`, err)
            return {
              ...nominee,
              candidate_name: 'Không tìm thấy',
              candidate_phone: ''
            }
          }
        })
      )
      
      // Extract successful results
      const successfulNominees = nomineesWithCandidates
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<NomineeWithCandidate>).value)
      
      setProjectNominees(successfulNominees)
    } catch (err) {
      console.error('Error loading project nominees:', err)
      // Don't set main error as this is secondary data, but show empty state
      setProjectNominees([])
    } finally {
      setNomineesLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id)
    
    const nominee = projectNominees.find(n => n.nominee_id === active.id)
    setDraggedNominee(nominee || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    setDraggedNominee(null)
    
    if (!over) return
    
    const nomineeId = active.id as number
    const newStatus = over.id as NomineeStatus
    
    // Find the nominee being dragged
    const nominee = projectNominees.find(n => n.nominee_id === nomineeId)
    if (!nominee || nominee.status === newStatus) return
    
    try {
      // Update nominee status
      await nomineeAPI.updateNominee(nomineeId, { status: newStatus })
      
      // Update local state
      setProjectNominees(prev => 
        prev.map(n => 
          n.nominee_id === nomineeId 
            ? { ...n, status: newStatus }
            : n
        )
      )
    } catch (err) {
      console.error('Error updating nominee status:', err)
      setError('Không thể cập nhật trạng thái ứng viên')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    // Validation
    if (!formData.name?.trim()) {
      setError('Vui lòng nhập tên dự án')
      return
    }
    if (!formData.customer_id) {
      setError('Vui lòng chọn khách hàng')
      return
    }
    if (!formData.expertise_id) {
      setError('Vui lòng chọn chuyên môn')
      return
    }
    if (!formData.area_id) {
      setError('Vui lòng chọn khu vực')
      return
    }
    if (!formData.level_id) {
      setError('Vui lòng chọn level')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Only send fields that have changed
      const updateData: ProjectUpdate = {}
      
      if (formData.name !== project.name) {
        updateData.name = formData.name
      }
      if (formData.start_date !== project.start_date) {
        updateData.start_date = formData.start_date
      }
      if (formData.end_date !== project.end_date) {
        updateData.end_date = formData.end_date
      }
      if (formData.budget !== project.budget) {
        updateData.budget = formData.budget
      }
      if (formData.budget_currency !== project.budget_currency) {
        updateData.budget_currency = formData.budget_currency
      }
      if (formData.type !== project.type) {
        updateData.type = formData.type
      }
      if (formData.required_recruits !== project.required_recruits) {
        updateData.required_recruits = formData.required_recruits
      }
      if (formData.recruited !== project.recruited) {
        updateData.recruited = formData.recruited
      }
      if (formData.status !== project.status) {
        updateData.status = formData.status
      }
      if (formData.customer_id !== project.customer_id) {
        updateData.customer_id = formData.customer_id
      }
      if (formData.expertise_id !== project.expertise_id) {
        updateData.expertise_id = formData.expertise_id
      }
      if (formData.area_id !== project.area_id) {
        updateData.area_id = formData.area_id
      }
      if (formData.level_id !== project.level_id) {
        updateData.level_id = formData.level_id
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0) {
        setError('Không có thay đổi nào để cập nhật')
        return
      }

      await projectAPI.updateProject(project.project_id, updateData)
      onSuccess()
      onClose()
      resetForm()
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi cập nhật dự án')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      budget: undefined,
      budget_currency: 'VND',
      type: 'CODINH' as ProjectType,
      required_recruits: undefined,
      recruited: undefined,
      status: 'TIMKIEMUNGVIEN' as ProjectStatus,
      customer_id: undefined,
      expertise_id: undefined,
      area_id: undefined,
      level_id: undefined
    })
    setError(null)
    setCustomerSearch('')
    setExpertiseSearch('')
    setAreaSearch('')
    setLevelSearch('')
    setOpenDropdown(null)
    setProjectNominees([])
    setNomineesLoading(false)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      resetForm()
    }
  }

  const SimpleDropdown: React.FC<{
    options: DropdownOption[]
    placeholder: string
    searchValue: string
    onSearchChange: (value: string) => void
    isOpen: boolean
    onToggle: () => void
    onSelect: (option: DropdownOption) => void
    required?: boolean
  }> = ({ options, placeholder, searchValue, onSearchChange, isOpen, onToggle, onSelect, required }) => {
    const filteredOptions = options.filter(option =>
      option.name.toLowerCase().includes(searchValue.toLowerCase())
    )

    return (
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onToggle}
            placeholder={placeholder}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => {
                      onSelect(option)
                      onToggle()
                    }}
                  >
                    {option.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Không tìm thấy kết quả nào
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Group nominees by status
  const nomineesByStatus = NOMINEE_STATUSES.reduce((acc, status) => {
    acc[status.key] = projectNominees.filter(n => n.status === status.key)
    return acc
  }, {} as Record<NomineeStatus, NomineeWithCandidate[]>)

  const rejectedNominees = projectNominees.filter(n => n.status === REJECTED_STATUS.key)

  if (!open) return null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div 
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-screen-2xl h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Cập nhật thông tin dự án</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content - Two column layout with 1:3 ratio */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Left 1/4 - Project Form */}
            <div className="lg:w-1/4 lg:border-r border-gray-200 overflow-y-auto flex-shrink-0">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin dự án</h3>
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    {/* Project Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên dự án <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập tên dự án"
                        required
                      />
                    </div>

                    {/* Customer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Khách hàng <span className="text-red-500">*</span>
                      </label>
                      <SimpleDropdown
                        options={customers}
                        placeholder="Chọn khách hàng"
                        searchValue={customerSearch}
                        onSearchChange={setCustomerSearch}
                        isOpen={openDropdown === 'customer'}
                        onToggle={() => setOpenDropdown(openDropdown === 'customer' ? null : 'customer')}
                        onSelect={(option) => {
                          setFormData({ ...formData, customer_id: option.id })
                          setCustomerSearch(option.name)
                        }}
                        required
                      />
                    </div>

                    {/* Start Date and End Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày bắt đầu
                        </label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date || ''}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày kết thúc
                        </label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date || ''}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                        Ngân sách
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="budget"
                          type="number"
                          value={formData.budget || ''}
                          onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                          placeholder="Nhập ngân sách"
                          className="flex-1"
                        />
                        <select
                          value={formData.budget_currency || 'VND'}
                          onChange={(e) => setFormData({ ...formData, budget_currency: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="VND">VND</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Loại dự án
                      </label>
                      <select
                        id="type"
                        value={formData.type || 'CODINH'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CODINH">Cố định</option>
                        <option value="THOIVU">Thời vụ</option>
                      </select>
                    </div>

                    {/* Required Recruits and Recruited */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="required_recruits" className="block text-sm font-medium text-gray-700 mb-2">
                          Số lượng cần tuyển
                        </label>
                        <Input
                          id="required_recruits"
                          type="number"
                          value={formData.required_recruits || ''}
                          onChange={(e) => setFormData({ ...formData, required_recruits: Number(e.target.value) })}
                          placeholder="Cần tuyển"
                        />
                      </div>
                      <div>
                        <label htmlFor="recruited" className="block text-sm font-medium text-gray-700 mb-2">
                          Đã tuyển
                        </label>
                        <Input
                          id="recruited"
                          type="number"
                          value={formData.recruited || ''}
                          onChange={(e) => setFormData({ ...formData, recruited: Number(e.target.value) })}
                          placeholder="Đã tuyển"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <select
                        id="status"
                        value={formData.status || 'TIMKIEMUNGVIEN'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="TIMKIEMUNGVIEN">Tìm kiếm ứng viên</option>
                        <option value="UNGVIENPHONGVAN">Ứng viên phỏng vấn</option>
                        <option value="UNGVIENTHUVIEC">Ứng viên thử việc</option>
                        <option value="TAMNGUNG">Tạm ngừng</option>
                        <option value="HUY">Hủy</option>
                        <option value="HOANTHANH">Hoàn thành</option>
                      </select>
                    </div>

                    {/* Expertise and Level */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chuyên môn <span className="text-red-500">*</span>
                        </label>
                        <SimpleDropdown
                          options={expertises}
                          placeholder="Chọn chuyên môn"
                          searchValue={expertiseSearch}
                          onSearchChange={setExpertiseSearch}
                          isOpen={openDropdown === 'expertise'}
                          onToggle={() => setOpenDropdown(openDropdown === 'expertise' ? null : 'expertise')}
                          onSelect={(option) => {
                            setFormData({ ...formData, expertise_id: option.id })
                            setExpertiseSearch(option.name)
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Level <span className="text-red-500">*</span>
                        </label>
                        <SimpleDropdown
                          options={levels}
                          placeholder="Chọn level"
                          searchValue={levelSearch}
                          onSearchChange={setLevelSearch}
                          isOpen={openDropdown === 'level'}
                          onToggle={() => setOpenDropdown(openDropdown === 'level' ? null : 'level')}
                          onSelect={(option) => {
                            setFormData({ ...formData, level_id: option.id })
                            setLevelSearch(option.name)
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Khu vực <span className="text-red-500">*</span>
                      </label>
                      <SimpleDropdown
                        options={areas}
                        placeholder="Chọn khu vực"
                        searchValue={areaSearch}
                        onSearchChange={setAreaSearch}
                        isOpen={openDropdown === 'area'}
                        onToggle={() => setOpenDropdown(openDropdown === 'area' ? null : 'area')}
                        onSelect={(option) => {
                          setFormData({ ...formData, area_id: option.id })
                          setAreaSearch(option.name)
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={loading}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right 3/4 - Nominee Drag and Drop */}
            <div className="lg:w-3/4 min-w-0 overflow-y-auto flex-1">
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý ứng viên</h3>
                
                {nomineesLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-500">Đang tải ứng viên...</div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Main status columns - takes up most space */}
                    <div className="flex flex-1 overflow-x-auto border-t border-l border-b border-black">
                      {NOMINEE_STATUSES.map((status) => (
                        <div key={status.key} className="flex-1 min-w-[200px] flex flex-col">
                          <DroppableColumn
                            status={status.key}
                            label={status.label}
                            color={status.color}
                            nominees={nomineesByStatus[status.key] || []}
                          >
                            {(nomineesByStatus[status.key] || []).map((nominee) => (
                              <NomineeCard 
                                key={nominee.nominee_id} 
                                nominee={nominee}
                                isDragging={activeId === nominee.nominee_id}
                              />
                            ))}
                          </DroppableColumn>
                        </div>
                      ))}
                      {/* Add right border for the last column */}
                      <div className="border-r border-black w-0"></div>
                    </div>

                    {/* Rejected candidates section - spans full width at bottom */}
                    <div className="mt-4 flex-shrink-0">
                      <div className="border border-black">
                        <DroppableColumn
                          status={REJECTED_STATUS.key}
                          label={`${REJECTED_STATUS.label} (${rejectedNominees.length})`}
                          color={REJECTED_STATUS.color}
                          nominees={rejectedNominees}
                        >
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {rejectedNominees.map((nominee) => (
                              <div key={nominee.nominee_id} className="w-48 flex-shrink-0">
                                <NomineeCard 
                                  nominee={nominee}
                                  isDragging={activeId === nominee.nominee_id}
                                />
                              </div>
                            ))}
                            {rejectedNominees.length === 0 && (
                              <div className="text-gray-400 text-sm py-4">
                                Kéo ứng viên vào đây để từ chối
                              </div>
                            )}
                          </div>
                        </DroppableColumn>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {draggedNominee ? (
          <NomineeCard nominee={draggedNominee} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
