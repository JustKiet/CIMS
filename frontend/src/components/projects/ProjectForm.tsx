import React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableDropdown, DropdownOption } from '@/components/ui/SearchableDropdown'
import { ProjectUpdate, ProjectStatus, ProjectType } from '@/lib/api'

interface ProjectFormProps {
  formData: ProjectUpdate
  setFormData: (data: ProjectUpdate) => void
  customers: DropdownOption[]
  expertises: DropdownOption[]
  areas: DropdownOption[]
  levels: DropdownOption[]
  customerSearch: string
  setCustomerSearch: (value: string) => void
  expertiseSearch: string
  setExpertiseSearch: (value: string) => void
  areaSearch: string
  setAreaSearch: (value: string) => void
  levelSearch: string
  setLevelSearch: (value: string) => void
  openDropdown: string | null
  setOpenDropdown: (dropdown: string | null) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  loading: boolean
  error: string | null
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  formData,
  setFormData,
  customers,
  expertises,
  areas,
  levels,
  customerSearch,
  setCustomerSearch,
  expertiseSearch,
  setExpertiseSearch,
  areaSearch,
  setAreaSearch,
  levelSearch,
  setLevelSearch,
  openDropdown,
  setOpenDropdown,
  onSubmit,
  onClose,
  loading,
  error
}) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin dự án</h3>
      <form onSubmit={onSubmit}>
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
          <SearchableDropdown
            label="Khách hàng"
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
            <SearchableDropdown
              label="Chuyên môn"
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
            <SearchableDropdown
              label="Level"
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

          {/* Area */}
          <SearchableDropdown
            label="Khu vực"
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

        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#982B1C] hover:bg-[#7A2116] text-white"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </div>
      </form>
    </div>
  )
}
