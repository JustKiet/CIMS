"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Eye, Printer, ChevronDown } from 'lucide-react'
import { projectAPI, headhunterAPI, ProjectResponse, HeadhunterResponse } from '@/lib/api'

type ReportType = 'performance' | 'projects' | 'candidates'

interface DropdownOption {
  id: number
  name: string
}

function ReportsContent() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reportType: 'performance' as ReportType,
    selectedProject: null as number | null,
    selectedHeadhunter: null as number | null,
  })

  // Dropdown data
  const [projects, setProjects] = useState<DropdownOption[]>([])
  const [headhunters, setHeadhunters] = useState<DropdownOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<'project' | 'headhunter' | null>(null)

  useEffect(() => {
    loadDropdownData()
  }, [])

  const loadDropdownData = async () => {
    try {
      setLoading(true)
      const [projectsResponse, headhuntersResponse] = await Promise.all([
        projectAPI.getProjects(1, 100),
        headhunterAPI.getHeadhunters(1, 100)
      ])

      const projectOptions = [
        { id: 0, name: 'Tất cả' },
        ...projectsResponse.data.map((project: ProjectResponse) => ({
          id: project.project_id,
          name: project.name
        }))
      ]

      const headhunterOptions = [
        { id: 0, name: 'Tất cả' },
        ...headhuntersResponse.data.map((headhunter: HeadhunterResponse) => ({
          id: headhunter.headhunter_id,
          name: headhunter.name
        }))
      ]

      setProjects(projectOptions)
      setHeadhunters(headhunterOptions)
    } catch (err) {
      console.error('Error loading dropdown data:', err)
      setError('Không thể tải dữ liệu dropdown')
    } finally {
      setLoading(false)
    }
  }

  const handleReportTypeChange = (type: ReportType) => {
    setFormData(prev => ({
      ...prev,
      reportType: type,
      // Reset dependent fields based on report type
      selectedProject: type === 'projects' ? prev.selectedProject : null,
      selectedHeadhunter: type === 'projects' ? null : prev.selectedHeadhunter,
    }))
  }

  const handlePreview = () => {
    // TODO: Implement preview logic
    console.log('Preview report with data:', formData)
  }

  const handlePrint = () => {
    // TODO: Implement print logic
    console.log('Print report with data:', formData)
  }

  const isProjectDropdownDisabled = formData.reportType === 'performance' || formData.reportType === 'candidates'
  const isHeadhunterDropdownDisabled = formData.reportType === 'projects'

  // Custom dropdown component
  const CustomDropdown: React.FC<{
    label: string
    options: DropdownOption[]
    selectedId: number | null
    onSelect: (id: number) => void
    isOpen: boolean
    onToggle: () => void
    disabled?: boolean
  }> = ({ label, options, selectedId, onSelect, isOpen, onToggle, disabled = false }) => {
    const selectedOption = options.find(opt => opt.id === selectedId)

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <button
          type="button"
          onClick={disabled ? undefined : onToggle}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center ${
            disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400'
          }`}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.name : `Chọn ${label.toLowerCase()}...`}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 ${disabled ? 'opacity-50' : ''}`} />
        </button>
        
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option.id)
                  onToggle()
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 border-b border-gray-100 last:border-b-0"
              >
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout
      notificationCount={3}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Báo cáo - Thống kê</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6">
            {/* Date Range Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thời gian báo cáo - thống kê</h3>
              <div className="flex space-x-4 justify-around">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ ngày <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến ngày <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Report Type Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Loại báo cáo - thống kê</h3>
              <div className="flex space-x-6 justify-around">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="performance"
                    checked={formData.reportType === 'performance'}
                    onChange={() => handleReportTypeChange('performance')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Báo cáo hiệu suất nhân sự</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="projects"
                    checked={formData.reportType === 'projects'}
                    onChange={() => handleReportTypeChange('projects')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Thống kê dự án</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="candidates"
                    checked={formData.reportType === 'candidates'}
                    onChange={() => handleReportTypeChange('candidates')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Thống kê ứng viên</span>
                </label>
              </div>
            </div>

            {/* Filter Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bộ lọc</h3>
              <div className="flex space-x-4 justify-around">
                <div className="flex-1">
                  <CustomDropdown
                    label="Dự án"
                    options={projects}
                    selectedId={formData.selectedProject}
                    onSelect={(id) => setFormData(prev => ({ ...prev, selectedProject: id === 0 ? null : id }))}
                    isOpen={openDropdown === 'project'}
                    onToggle={() => setOpenDropdown(openDropdown === 'project' ? null : 'project')}
                    disabled={isProjectDropdownDisabled}
                  />
                </div>
                <div className="flex-1">
                  <CustomDropdown
                    label="Chuyên viên"
                    options={headhunters}
                    selectedId={formData.selectedHeadhunter}
                    onSelect={(id) => setFormData(prev => ({ ...prev, selectedHeadhunter: id === 0 ? null : id }))}
                    isOpen={openDropdown === 'headhunter'}
                    onToggle={() => setOpenDropdown(openDropdown === 'headhunter' ? null : 'headhunter')}
                    disabled={isHeadhunterDropdownDisabled}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={loading || !formData.fromDate || !formData.toDate}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Xem trước báo cáo - thống kê
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                disabled={loading || !formData.fromDate || !formData.toDate}
                className="bg-[#982B1C] hover:bg-[#7A2116] text-white flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                In báo cáo thống kê
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  )
}
