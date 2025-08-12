import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Search } from 'lucide-react'
import { projectAPI, customerAPI, expertiseAPI, areaAPI, levelAPI } from '@/lib/api'
import type { ProjectCreate, CustomerResponse, ExpertiseResponse, AreaResponse, LevelResponse, ProjectType, ProjectStatus } from '@/lib/api'

interface ProjectCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface DropdownOption {
  id: number
  name: string
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    budget: '',
    budget_currency: 'VND',
    type: 'CODINH' as ProjectType,
    required_recruits: '',
    recruited: '0',
    status: 'TIMKIEMUNGVIEN' as ProjectStatus,
    customer_id: null as number | null,
    expertise_id: null as number | null,
    area_id: null as number | null,
    level_id: null as number | null,
  })

  // Dropdown data
  const [customers, setCustomers] = useState<DropdownOption[]>([])
  const [expertises, setExpertises] = useState<DropdownOption[]>([])
  const [areas, setAreas] = useState<DropdownOption[]>([])
  const [levels, setLevels] = useState<DropdownOption[]>([])

  // Search states for dropdowns
  const [customerSearch, setCustomerSearch] = useState('')
  const [expertiseSearch, setExpertiseSearch] = useState('')
  const [areaSearch, setAreaSearch] = useState('')
  const [levelSearch, setLevelSearch] = useState('')

  // Dropdown open states - only one can be open at a time
  const [openDropdown, setOpenDropdown] = useState<'customer' | 'expertise' | 'area' | 'level' | null>(null)
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

  // Load initial data
  useEffect(() => {
    if (open) {
      loadDropdownData()
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setFormData({
      start_date: '',
      end_date: '',
      budget: '',
      budget_currency: 'VND',
      type: 'CODINH',
      required_recruits: '',
      recruited: '0',
      status: 'TIMKIEMUNGVIEN',
      customer_id: null,
      expertise_id: null,
      area_id: null,
      level_id: null,
    })
    setError(null)
    setCustomerSearch('')
    setExpertiseSearch('')
    setAreaSearch('')
    setLevelSearch('')
  }

  const loadDropdownData = async () => {
    try {
      const [customersRes, expertisesRes, areasRes, levelsRes] = await Promise.all([
        customerAPI.getCustomers(),
        expertiseAPI.getExpertises(),
        areaAPI.getAreas(),
        levelAPI.getLevels()
      ])

      setCustomers(customersRes.data.map((c: CustomerResponse) => ({ id: c.customer_id, name: c.name })))
      setExpertises(expertisesRes.data.map((e: ExpertiseResponse) => ({ id: e.expertise_id, name: e.name })))
      setAreas(areasRes.data.map((a: AreaResponse) => ({ id: a.area_id, name: a.name })))
      setLevels(levelsRes.data.map((l: LevelResponse) => ({ id: l.level_id, name: l.name })))
    } catch (err) {
      console.error('Error loading dropdown data:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer_id || !formData.expertise_id || !formData.area_id || !formData.level_id) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const projectData: ProjectCreate = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: parseFloat(formData.budget),
        budget_currency: formData.budget_currency,
        type: formData.type,
        required_recruits: parseInt(formData.required_recruits),
        recruited: parseInt(formData.recruited),
        status: formData.status,
        customer_id: formData.customer_id,
        expertise_id: formData.expertise_id,
        area_id: formData.area_id,
        level_id: formData.level_id,
      }

      await projectAPI.createProject(projectData)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Có lỗi xảy ra khi tạo dự án')
      }
    } finally {
      setLoading(false)
    }
  }

  const SearchableDropdown: React.FC<{
    label: string
    value: number | null
    options: DropdownOption[]
    searchValue: string
    onSearchChange: (value: string) => void
    onSelect: (id: number, name: string) => void
    isOpen: boolean
    onToggle: () => void
    required?: boolean
  }> = ({ label, value, options, searchValue, onSearchChange, onSelect, isOpen, onToggle, required = false }) => {
    const selectedOption = options.find(opt => opt.id === value)
    const filteredOptions = options.filter(opt => 
      opt.name.toLowerCase().includes(searchValue.toLowerCase())
    )
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Auto-focus the search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        // Small delay to ensure the dropdown is rendered
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 50)
      }
    }, [isOpen])

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={onToggle}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {selectedOption ? selectedOption.name : `Chọn ${label.toLowerCase()}...`}
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={`Tìm ${label.toLowerCase()}...`}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    onKeyDown={(e) => {
                      // Prevent the dropdown from closing when pressing keys
                      e.stopPropagation()
                    }}
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onSelect(option.id, option.name)
                        onToggle() // This will close the dropdown
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {option.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    Không tìm thấy kết quả
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Tạo dự án mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <SearchableDropdown
              label="Khách hàng"
              value={formData.customer_id}
              options={customers}
              searchValue={customerSearch}
              onSearchChange={setCustomerSearch}
              onSelect={(id) => setFormData(prev => ({ ...prev, customer_id: id }))}
              isOpen={openDropdown === 'customer'}
              onToggle={() => setOpenDropdown(openDropdown === 'customer' ? null : 'customer')}
              required
            />

            {/* Expertise Selection */}
            <SearchableDropdown
              label="Chuyên môn"
              value={formData.expertise_id}
              options={expertises}
              searchValue={expertiseSearch}
              onSearchChange={setExpertiseSearch}
              onSelect={(id) => setFormData(prev => ({ ...prev, expertise_id: id }))}
              isOpen={openDropdown === 'expertise'}
              onToggle={() => setOpenDropdown(openDropdown === 'expertise' ? null : 'expertise')}
              required
            />

            {/* Area Selection */}
            <SearchableDropdown
              label="Khu vực"
              value={formData.area_id}
              options={areas}
              searchValue={areaSearch}
              onSearchChange={setAreaSearch}
              onSelect={(id) => setFormData(prev => ({ ...prev, area_id: id }))}
              isOpen={openDropdown === 'area'}
              onToggle={() => setOpenDropdown(openDropdown === 'area' ? null : 'area')}
              required
            />

            {/* Level Selection */}
            <SearchableDropdown
              label="Cấp độ"
              value={formData.level_id}
              options={levels}
              searchValue={levelSearch}
              onSearchChange={setLevelSearch}
              onSelect={(id) => setFormData(prev => ({ ...prev, level_id: id }))}
              isOpen={openDropdown === 'level'}
              onToggle={() => setOpenDropdown(openDropdown === 'level' ? null : 'level')}
              required
            />

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngân sách <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0"
                required
              />
            </div>

            {/* Budget Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tiền tệ</label>
              <select
                value={formData.budget_currency}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại dự án</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProjectType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CODINH">Cố định</option>
                <option value="THOIVU">Thời vụ</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TIMKIEMUNGVIEN">Tìm kiếm ứng viên</option>
                <option value="UNGVIENPHONGVAN">Ứng viên phỏng vấn</option>
                <option value="UNGVIENTHUVIEC">Ứng viên thử việc</option>
                <option value="TAMNGUNG">Tạm ngưng</option>
                <option value="HUY">Hủy</option>
                <option value="HOANTHANH">Hoàn thành</option>
              </select>
            </div>

            {/* Required Recruits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng cần tuyển <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={formData.required_recruits}
                onChange={(e) => setFormData(prev => ({ ...prev, required_recruits: e.target.value }))}
                placeholder="1"
                required
              />
            </div>

            {/* Recruited */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đã tuyển</label>
              <Input
                type="number"
                min="0"
                value={formData.recruited}
                onChange={(e) => setFormData(prev => ({ ...prev, recruited: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#982B1C] hover:bg-[#7A2116] text-white"
            >
              {loading ? 'Đang tạo...' : 'Tạo dự án'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
