import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Search } from 'lucide-react'
import { headhunterAPI, areaAPI, HeadhunterResponse } from '@/lib/api'
import type { HeadhunterUpdate, AreaResponse } from '@/lib/api'

interface HeadhunterUpdateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  headhunter: HeadhunterResponse | null
  currentUser: HeadhunterResponse | null
}

const isAdmin = (user: HeadhunterResponse | null): boolean => {
  return user?.role?.toLowerCase() === 'admin'
}

interface DropdownOption {
  id: number
  name: string
}

export const HeadhunterUpdateModal: React.FC<HeadhunterUpdateModalProps> = ({
  open,
  onClose,
  onSuccess,
  headhunter,
  currentUser
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area_id: null as number | null,
    role: ''
  })

  // Dropdown data
  const [areas, setAreas] = useState<DropdownOption[]>([])

  // Search states for dropdowns
  const [areaSearch, setAreaSearch] = useState('')

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'area' | null>(null)
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

  const populateForm = useCallback(() => {
    if (headhunter) {
      setFormData({
        name: headhunter.name,
        email: headhunter.email,
        phone: headhunter.phone,
        area_id: headhunter.area_id,
        role: headhunter.role
      })
    }
    setAreaSearch('')
    setError(null)
  }, [headhunter])

  // Load initial data and populate form
  useEffect(() => {
    if (open && headhunter) {
      loadDropdownData()
      populateForm()
    }
  }, [open, headhunter, populateForm])

  const loadDropdownData = async () => {
    try {
      const [areasResponse] = await Promise.all([
        areaAPI.getAreas(1, 100)
      ])
      
      setAreas(areasResponse.data.map((area: AreaResponse) => ({
        id: area.area_id,
        name: area.name
      })))
    } catch (err) {
      console.error('Error loading dropdown data:', err)
      setError('Không thể tải dữ liệu dropdown')
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Tên nhân sự là bắt buộc')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email là bắt buộc')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Số điện thoại là bắt buộc')
      return false
    }
    if (!formData.area_id) {
      setError('Khu vực là bắt buộc')
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ')
      return false
    }

    // Validate phone format (simple validation)
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !headhunter) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updateData: HeadhunterUpdate = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        area_id: formData.area_id!,
        role: formData.role,
      }

      await headhunterAPI.updateHeadhunter(headhunter.headhunter_id, updateData)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật nhân sự')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpenDropdown(null)
    onClose()
  }

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(areaSearch.toLowerCase())
  )

  const SimpleDropdown: React.FC<{
    name: string
    options: DropdownOption[]
    selectedId: number | null
    onSelect: (id: number, name: string) => void
    searchValue: string
    onSearchChange: (value: string) => void
    placeholder: string
    isOpen: boolean
    onToggle: () => void
  }> = ({
    name,
    options,
    selectedId,
    onSelect,
    searchValue,
    onSearchChange,
    placeholder,
    isOpen,
    onToggle
  }) => {
    return (
      <div className="relative">
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer flex justify-between items-center"
          onClick={onToggle}
        >
          <span className={selectedId ? "text-gray-900" : "text-gray-500"}>
            {selectedId ? options.find(opt => opt.id === selectedId)?.name : placeholder}
          </span>
          <span className="text-gray-400">▼</span>
        </div>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={`Tìm kiếm ${name.toLowerCase()}...`}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">Không có dữ liệu</div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => {
                      onSelect(option.id, option.name)
                      onToggle()
                    }}
                  >
                    {option.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!open) return null

  if (!isAdmin(currentUser)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Không có quyền truy cập</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Chỉ có quản trị viên mới có thể cập nhật thông tin nhân sự.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Cập nhật thông tin nhân sự</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nhân sự <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên nhân sự"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Nhập email"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khu vực <span className="text-red-500">*</span>
                </label>
                <SimpleDropdown
                  name="Khu vực"
                  options={filteredAreas}
                  selectedId={formData.area_id}
                  onSelect={(id) => handleInputChange('area_id', id)}
                  searchValue={areaSearch}
                  onSearchChange={setAreaSearch}
                  placeholder="Chọn khu vực"
                  isOpen={openDropdown === 'area'}
                  onToggle={() => setOpenDropdown(openDropdown === 'area' ? null : 'area')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="headhunter">Headhunter</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-[#982B1C] hover:bg-[#7A2116] text-white"
              disabled={loading}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
