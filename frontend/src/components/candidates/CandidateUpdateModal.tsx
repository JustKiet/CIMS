import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Search } from 'lucide-react'
import { 
  candidateAPI, 
  expertiseAPI, 
  fieldAPI, 
  levelAPI, 
  areaAPI, 
  headhunterAPI, 
  Gender, 
  CandidateResponse, 
  CandidateUpdate,
  ExpertiseResponse,
  FieldResponse,
  AreaResponse,
  LevelResponse,
  HeadhunterResponse
} from '@/lib/api'

interface CandidateUpdateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  candidate: CandidateResponse | null
}

interface DropdownOption {
  id: number
  name: string
}

export const CandidateUpdateModal: React.FC<CandidateUpdateModalProps> = ({
  open,
  onClose,
  onSuccess,
  candidate
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    candidate_name: '',
    phone: '',
    email: '',
    year_of_birth: 0 as number,
    gender: "KHAC" as Gender,
    education: '',
    source: '',
    expertise_id: null as number | null,
    field_id: null as number | null,
    area_id: null as number | null,
    level_id: null as number | null,
    headhunter_id: null as number | null,
    note: '',
  })

  // Dropdown data
  const [genders, setGenders] = useState<DropdownOption[]>([])
  const [expertises, setExpertises] = useState<DropdownOption[]>([])
  const [fields, setFields] = useState<DropdownOption[]>([])
  const [areas, setAreas] = useState<DropdownOption[]>([])
  const [levels, setLevels] = useState<DropdownOption[]>([])
  const [headhunters, setHeadhunters] = useState<DropdownOption[]>([])

  // Search states for dropdowns
  const [expertiseSearch, setExpertiseSearch] = useState('')
  const [fieldSearch, setFieldSearch] = useState('')
  const [areaSearch, setAreaSearch] = useState('')
  const [levelSearch, setLevelSearch] = useState('')
  const [headhunterSearch, setHeadhunterSearch] = useState('')

  // Dropdown open states - only one can be open at a time
  const [openDropdown, setOpenDropdown] = useState<'gender' | 'expertise' | 'field' | 'area' | 'level' | 'headhunter' | null>(null)
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

  // Load initial data and populate form when modal opens
  useEffect(() => {
    if (open && candidate) {
      loadDropdownData()
      populateForm()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, candidate])

  const populateForm = () => {
    if (candidate) {
      setFormData({
        candidate_name: candidate.name,
        phone: candidate.phone,
        email: candidate.email,
        year_of_birth: candidate.year_of_birth,
        gender: candidate.gender as Gender,
        education: candidate.education,
        source: candidate.source,
        expertise_id: candidate.expertise_id,
        field_id: candidate.field_id,
        area_id: candidate.area_id,
        level_id: candidate.level_id,
        headhunter_id: candidate.headhunter_id,
        note: candidate.note,
      })
    }
    setError(null)
    setExpertiseSearch('')
    setFieldSearch('')
    setAreaSearch('')
    setLevelSearch('')
    setHeadhunterSearch('')
  }

  const loadDropdownData = async () => {
    try {
      const [expertisesRes, fieldsRes, areasRes, levelsRes, headhuntersRes] = await Promise.all([
        expertiseAPI.getExpertises(),
        fieldAPI.getFields(),
        areaAPI.getAreas(),
        levelAPI.getLevels(),
        headhunterAPI.getHeadhunters()
      ])
      setGenders([
        { id: 1, name: 'Nam' },
        { id: 2, name: 'Nữ' },
        { id: 3, name: 'Khác' }
      ])
      setExpertises(expertisesRes.data.map((e: ExpertiseResponse) => ({ id: e.expertise_id, name: e.name })))
      setFields(fieldsRes.data.map((f: FieldResponse) => ({ id: f.field_id, name: f.name })))
      setAreas(areasRes.data.map((a: AreaResponse) => ({ id: a.area_id, name: a.name })))
      setLevels(levelsRes.data.map((l: LevelResponse) => ({ id: l.level_id, name: l.name })))
      setHeadhunters(headhuntersRes.data.map((h: HeadhunterResponse) => ({ id: h.headhunter_id, name: h.name })))
    } catch (err) {
      console.error('Error loading dropdown data:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!candidate) {
      setError('Không tìm thấy thông tin ứng viên')
      return
    }

    if (!formData.expertise_id || !formData.field_id || !formData.area_id || !formData.level_id || !formData.headhunter_id) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const candidateData: CandidateUpdate = {
        name: formData.candidate_name,
        phone: formData.phone,
        email: formData.email,
        year_of_birth: formData.year_of_birth,
        gender: formData.gender,
        education: formData.education,
        source: formData.source,
        expertise_id: formData.expertise_id,
        field_id: formData.field_id,
        area_id: formData.area_id,
        level_id: formData.level_id,
        headhunter_id: formData.headhunter_id,
        note: formData.note,
      }

      await candidateAPI.updateCandidate(candidate.candidate_id, candidateData)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Có lỗi xảy ra khi cập nhật ứng viên')
      }
    } finally {
      setLoading(false)
    }
  }

  const SimpleDropdown: React.FC<{
    label: string
    value: number | null
    options: DropdownOption[]
    onSelect: (id: number, name: string) => void
    isOpen: boolean
    onToggle: () => void
    required?: boolean
  }> = ({ label, value, options, onSelect, isOpen, onToggle, required = false }) => {
    const selectedOption = options.find(opt => opt.id === value)

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
              <div className="max-h-48 overflow-y-auto">
                {options.map((option) => (
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
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

  if (!open || !candidate) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Cập nhật thông tin ứng viên</h2>
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
              {/* Candidate Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên ứng viên <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.candidate_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidate_name: e.target.value }))}
                  required
                />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            {/* Year of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm sinh <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.year_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, year_of_birth: Number(e.target.value) }))}
                required
              />
            </div>

            {/* Gender */}
            <SimpleDropdown
              label="Giới tính"
              value={genders.find(g => 
                (g.name === 'Nam' && formData.gender === 'NAM') ||
                (g.name === 'Nữ' && formData.gender === 'NU') ||
                (g.name === 'Khác' && formData.gender === 'KHAC')
              )?.id || null}
              options={genders}
              onSelect={(id, name) => {
                const genderValue = name === 'Nam' ? 'NAM' : name === 'Nữ' ? 'NU' : 'KHAC'
                setFormData(prev => ({ ...prev, gender: genderValue as Gender }))
              }}
              isOpen={openDropdown === 'gender'}
              onToggle={() => setOpenDropdown(openDropdown === 'gender' ? null : 'gender')}
              required
            />

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trình độ học vấn
              </label>
              <Input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                placeholder="Cử nhân, Thạc sĩ, Tiến sĩ..."
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nguồn ứng viên
              </label>
              <Input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                placeholder="Ví dụ: Facebook, LinkedIn, Giới thiệu..."
              />
            </div>

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

            {/* Field Selection */}
            <SearchableDropdown
              label="Lĩnh vực"
              value={formData.field_id}
              options={fields}
              searchValue={fieldSearch}
              onSearchChange={setFieldSearch}
              onSelect={(id) => setFormData(prev => ({ ...prev, field_id: id }))}
              isOpen={openDropdown === 'field'}
              onToggle={() => setOpenDropdown(openDropdown === 'field' ? null : 'field')}
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

            {/* Headhunter Selection */}
            <SearchableDropdown
              label="Nhân sự phụ trách"
              value={formData.headhunter_id}
              options={headhunters}
              searchValue={headhunterSearch}
              onSearchChange={setHeadhunterSearch}
              onSelect={(id) => setFormData(prev => ({ ...prev, headhunter_id: id }))}
              isOpen={openDropdown === 'headhunter'}
              onToggle={() => setOpenDropdown(openDropdown === 'headhunter' ? null : 'headhunter')}
              required
            />

            {/* Note */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Thông tin bổ sung về ứng viên..."
                rows={3}
                className="resize-none w-full px-3 py-2 border border-gray-300 rounded-md"
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
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
