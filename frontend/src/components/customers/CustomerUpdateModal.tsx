import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Search, ChevronDown } from 'lucide-react'
import { ProjectTable } from '@/components/projects/ProjectTable'
import { customerAPI, fieldAPI, projectAPI, CustomerResponse, CustomerUpdate, FieldResponse, ProjectResponse, APIError } from '@/lib/api'

interface CustomerUpdateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  customer: CustomerResponse | null
}

interface DropdownOption {
  id: number
  name: string
}

export const CustomerUpdateModal: React.FC<CustomerUpdateModalProps> = ({
  open,
  onClose,
  onSuccess,
  customer
}) => {
  const [formData, setFormData] = useState<CustomerUpdate>({
    name: '',
    field_id: undefined,
    representative_name: '',
    representative_phone: '',
    representative_email: '',
    representative_role: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dropdown data
  const [fields, setFields] = useState<DropdownOption[]>([])
  
  // Projects data
  const [customerProjects, setCustomerProjects] = useState<ProjectResponse[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  
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

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadDropdownData()
      if (customer) {
        loadCustomerProjects(customer.customer_id)
      }
    }
  }, [open, customer])

  // Populate form with customer data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        field_id: customer.field_id,
        representative_name: customer.representative_name,
        representative_phone: customer.representative_phone,
        representative_email: customer.representative_email,
        representative_role: customer.representative_role
      })
      
      // Also set the field search to show current field name
      const currentField = fields.find(f => f.id === customer.field_id)
      if (currentField) {
        setFieldSearch(currentField.name)
      }
    }
  }, [customer, fields])

  const loadDropdownData = async () => {
    try {
      const [fieldsRes] = await Promise.all([
        fieldAPI.getFields()
      ])

      setFields(fieldsRes.data.map((field: FieldResponse) => ({
        id: field.field_id,
        name: field.name
      })))

    } catch (err) {
      console.error('Error loading dropdown data:', err)
      setError('Không thể tải dữ liệu dropdown')
    }
  }

  const loadCustomerProjects = async (customerId: number) => {
    try {
      setProjectsLoading(true)
      // Use the new dedicated API endpoint for better performance
      const projectsRes = await projectAPI.getProjectsByCustomer(customerId, 1, 100)
      setCustomerProjects(projectsRes.data)
    } catch (err) {
      console.error('Error loading customer projects:', err)
      // Don't set main error as this is secondary data
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    // Validation
    if (!formData.name?.trim()) {
      setError('Vui lòng nhập tên khách hàng')
      return
    }
    if (!formData.field_id) {
      setError('Vui lòng chọn lĩnh vực')
      return
    }
    if (!formData.representative_name?.trim()) {
      setError('Vui lòng nhập tên đại diện')
      return
    }
    if (!formData.representative_phone?.trim()) {
      setError('Vui lòng nhập số điện thoại đại diện')
      return
    }
    if (!formData.representative_email?.trim()) {
      setError('Vui lòng nhập email đại diện')
      return
    }
    if (!formData.representative_role?.trim()) {
      setError('Vui lòng nhập chức vụ đại diện')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Only send fields that have changed
      const updateData: CustomerUpdate = {}
      
      if (formData.name !== customer.name) {
        updateData.name = formData.name
      }
      if (formData.field_id !== customer.field_id) {
        updateData.field_id = formData.field_id
      }
      if (formData.representative_name !== customer.representative_name) {
        updateData.representative_name = formData.representative_name
      }
      if (formData.representative_phone !== customer.representative_phone) {
        updateData.representative_phone = formData.representative_phone
      }
      if (formData.representative_email !== customer.representative_email) {
        updateData.representative_email = formData.representative_email
      }
      if (formData.representative_role !== customer.representative_role) {
        updateData.representative_role = formData.representative_role
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0) {
        setError('Không có thay đổi nào để cập nhật')
        return
      }

      await customerAPI.updateCustomer(customer.customer_id, updateData)
      onSuccess()
      onClose()
      resetForm()
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.detail || err.message)
      } else {
        setError('Có lỗi xảy ra khi cập nhật khách hàng')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      field_id: undefined,
      representative_name: '',
      representative_phone: '',
      representative_email: '',
      representative_role: ''
    })
    setError(null)
    setFieldSearch('')
    setOpenDropdown(null)
    setCustomerProjects([])
    setProjectsLoading(false)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      resetForm()
    }
  }

  // Project action handlers
  const handleEditProject = (project: ProjectResponse) => {
    // For now, just log the project ID. You can implement navigation to project edit later
    console.log('Edit project:', project.project_id)
    // TODO: Navigate to project edit page or open project edit modal
  }

  const handleDeleteProject = (projectId: number) => {
    // For now, just log the project ID. You can implement project deletion later
    console.log('Delete project:', projectId)
    // TODO: Implement project deletion with confirmation
  }

  const SimpleDropdown: React.FC<{
    value: number | null
    options: DropdownOption[]
    placeholder: string
    searchValue: string
    onSearchChange: (value: string) => void
    isOpen: boolean
    onToggle: () => void
    onSelect: (option: DropdownOption) => void
    required?: boolean
  }> = ({ value, options, placeholder, searchValue, onSearchChange, isOpen, onToggle, onSelect, required }) => {
    const filteredOptions = options.filter(option =>
      option.name.toLowerCase().includes(searchValue.toLowerCase())
    )

    const selectedOption = options.find(opt => opt.id === value)

    return (
      <div className="relative">
        <div
          className={`flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            required && !value ? 'border-red-300' : ''
          }`}
          onClick={onToggle}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-8 text-sm"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      value === option.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
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

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-screen-2xl h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Cập nhật thông tin khách hàng</h2>
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
          {/* Left 1/4 - Customer Form */}
          <div className="lg:w-1/4 lg:border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
              <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

          <div className="grid grid-cols-1 gap-4">
            {/* Customer Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên khách hàng *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên khách hàng"
                required
              />
            </div>

            {/* Field */}
            <div>
              <label htmlFor="field_id" className="block text-sm font-medium text-gray-700 mb-2">
                Lĩnh vực *
              </label>
              <SimpleDropdown
                value={formData.field_id || null}
                options={fields}
                placeholder="Chọn lĩnh vực"
                searchValue={fieldSearch}
                onSearchChange={setFieldSearch}
                isOpen={openDropdown === 'field'}
                onToggle={() => setOpenDropdown(openDropdown === 'field' ? null : 'field')}
                onSelect={(option) => {
                  setFormData(prev => ({ ...prev, field_id: option.id }))
                  setFieldSearch(option.name)
                }}
                required
              />
            </div>

            {/* Representative Name */}
            <div>
              <label htmlFor="representative_name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đại diện *
              </label>
              <Input
                id="representative_name"
                type="text"
                value={formData.representative_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, representative_name: e.target.value }))}
                placeholder="Nhập tên đại diện"
                required
              />
            </div>

            {/* Representative Role */}
            <div>
              <label htmlFor="representative_role" className="block text-sm font-medium text-gray-700 mb-2">
                Chức vụ đại diện *
              </label>
              <Input
                id="representative_role"
                type="text"
                value={formData.representative_role || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, representative_role: e.target.value }))}
                placeholder="Nhập chức vụ đại diện"
                required
              />
            </div>

            {/* Representative Phone */}
            <div>
              <label htmlFor="representative_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại đại diện *
              </label>
              <Input
                id="representative_phone"
                type="tel"
                value={formData.representative_phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, representative_phone: e.target.value }))}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            {/* Representative Email */}
            <div>
              <label htmlFor="representative_email" className="block text-sm font-medium text-gray-700 mb-2">
                Email đại diện *
              </label>
              <Input
                id="representative_email"
                type="email"
                value={formData.representative_email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, representative_email: e.target.value }))}
                placeholder="Nhập email đại diện"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
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
              disabled={loading}
              className="bg-[#982B1C] hover:bg-[#7A2116] text-white"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>

      {/* Right 3/4 - Customer Projects */}
      <div className="lg:w-3/4 min-w-0 overflow-y-auto flex-1">
        <div className="p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dự án của khách hàng</h3>
          <div className="flex-1 overflow-hidden">
            <ProjectTable
              projects={customerProjects}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              loading={projectsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
)
}
