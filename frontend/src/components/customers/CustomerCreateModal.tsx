import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Search } from 'lucide-react'
import { customerAPI, fieldAPI } from '@/lib/api'
import type { CustomerCreate, FieldResponse } from '@/lib/api'

interface CustomerCreateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface DropdownOption {
  id: number
  name: string
}

export const CustomerCreateModal: React.FC<CustomerCreateModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    field_id: null as number | null,
    representative_name: '',
    representative_phone: '',
    representative_email: '',
    representative_role: '',
  })

  // Dropdown data
  const [fields, setFields] = useState<DropdownOption[]>([])

  // Search states for dropdowns
  const [fieldSearch, setFieldSearch] = useState('')

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'field' | null>(null)
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
      name: '',
      field_id: null,
      representative_name: '',
      representative_phone: '',
      representative_email: '',
      representative_role: '',
    })
    setFieldSearch('')
    setError(null)
  }

  const loadDropdownData = async () => {
    try {
      const [fieldsResponse] = await Promise.all([
        fieldAPI.getFields(1, 100)
      ])
      
      setFields(fieldsResponse.data.map((field: FieldResponse) => ({
        id: field.field_id,
        name: field.name
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
      setError('Tên khách hàng là bắt buộc')
      return false
    }
    if (!formData.field_id) {
      setError('Lĩnh vực là bắt buộc')
      return false
    }
    if (!formData.representative_name.trim()) {
      setError('Tên đại diện là bắt buộc')
      return false
    }
    if (!formData.representative_phone.trim()) {
      setError('Số điện thoại đại diện là bắt buộc')
      return false
    }
    if (!formData.representative_email.trim()) {
      setError('Email đại diện là bắt buộc')
      return false
    }
    if (!formData.representative_role.trim()) {
      setError('Chức vụ đại diện là bắt buộc')
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.representative_email)) {
      setError('Email không hợp lệ')
      return false
    }

    // Validate phone format (simple validation)
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (!phoneRegex.test(formData.representative_phone)) {
      setError('Số điện thoại không hợp lệ')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const customerData: CustomerCreate = {
        name: formData.name.trim(),
        field_id: formData.field_id!,
        representative_name: formData.representative_name.trim(),
        representative_phone: formData.representative_phone.trim(),
        representative_email: formData.representative_email.trim(),
        representative_role: formData.representative_role.trim(),
      }

      await customerAPI.createCustomer(customerData)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo khách hàng')
    } finally {
      setLoading(false)
    }
  }

  const filteredFields = fields.filter(field =>
    field.name.toLowerCase().includes(fieldSearch.toLowerCase())
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Thêm khách hàng mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thông tin khách hàng</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên khách hàng"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lĩnh vực <span className="text-red-500">*</span>
                </label>
                <SimpleDropdown
                  name="Lĩnh vực"
                  options={filteredFields}
                  selectedId={formData.field_id}
                  onSelect={(id) => handleInputChange('field_id', id)}
                  searchValue={fieldSearch}
                  onSearchChange={setFieldSearch}
                  placeholder="Chọn lĩnh vực"
                  isOpen={openDropdown === 'field'}
                  onToggle={() => setOpenDropdown(openDropdown === 'field' ? null : 'field')}
                />
              </div>
            </div>
          </div>

          {/* Representative Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thông tin đại diện</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đại diện <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.representative_name}
                  onChange={(e) => handleInputChange('representative_name', e.target.value)}
                  placeholder="Nhập tên đại diện"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chức vụ <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.representative_role}
                  onChange={(e) => handleInputChange('representative_role', e.target.value)}
                  placeholder="Nhập chức vụ"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.representative_phone}
                  onChange={(e) => handleInputChange('representative_phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.representative_email}
                  onChange={(e) => handleInputChange('representative_email', e.target.value)}
                  placeholder="Nhập email"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
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
              className="bg-[#982B1C] hover:bg-[#7A2116] text-white"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo khách hàng'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
