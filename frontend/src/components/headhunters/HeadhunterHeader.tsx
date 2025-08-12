import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus, Search, ChevronDown, Check, ArrowUp, ArrowDown } from 'lucide-react'
import { HeadhunterSortField, HeadhunterSortOrder, HeadhunterSortOption } from '@/hooks/useHeadhunters'
import { HeadhunterResponse } from '@/lib/api'

interface HeadhunterHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddHeadhunter: () => void
  sortOption: HeadhunterSortOption
  onSortChange: (option: HeadhunterSortOption) => void
  onSearch: () => void
  loading?: boolean
  currentUser: HeadhunterResponse | null
}

const isAdmin = (user: HeadhunterResponse | null): boolean => {
  return user?.role?.toLowerCase() === 'admin'
}

const sortOptions: { field: HeadhunterSortField; label: string }[] = [
  { field: 'name', label: 'Tên nhân sự' },
  { field: 'headhunter_id', label: 'Mã nhân sự' },
  { field: 'email', label: 'Email' },
  { field: 'area_name', label: 'Khu vực' },
  { field: 'role', label: 'Vai trò' },
]

export const HeadhunterHeader: React.FC<HeadhunterHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddHeadhunter,
  sortOption,
  onSortChange,
  onSearch,
  loading = false,
  currentUser
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.field === sortOption.field)
    const orderLabel = sortOption.order === 'asc' ? 'Tăng dần' : 'Giảm dần'
    return `${option?.label} (${orderLabel})`
  }

  const handleSortOptionClick = (field: HeadhunterSortField, order: HeadhunterSortOrder) => {
    onSortChange({ field, order })
    setIsDropdownOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-3xl">
            {loading ? (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              </div>
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            )}
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên nhân sự, email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 rounded-full shadow-sm"
            />
          </div>
          
          {/* Add Headhunter Button - Only show for admin users */}
          {isAdmin(currentUser) && (
            <Button 
              onClick={onAddHeadhunter}
              className="flex items-center gap-2 bg-[#982B1C] hover:bg-[#7A2116] text-white px-4 py-2 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          )}
        </div>

        {/* Sort Options Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sắp xếp:</span>
            <Button
              variant="outline"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 min-w-[200px] justify-between"
            >
              <span className="truncate text-black">{getCurrentSortLabel()}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                {sortOptions.map((option) => (
                  <div key={option.field} className="px-3 py-2 border-b border-gray-100 last:border-b-0">
                    <div className="text-sm font-medium text-gray-700 mb-1">{option.label}</div>
                    <div className="flex gap-1">
                      {/* Ascending option */}
                      <button
                        onClick={() => handleSortOptionClick(option.field, 'asc')}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
                          sortOption.field === option.field && sortOption.order === 'asc'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <ArrowUp className="h-3 w-3" />
                        Tăng dần
                        {sortOption.field === option.field && sortOption.order === 'asc' && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                      
                      {/* Descending option */}
                      <button
                        onClick={() => handleSortOptionClick(option.field, 'desc')}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
                          sortOption.field === option.field && sortOption.order === 'desc'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <ArrowDown className="h-3 w-3" />
                        Giảm dần
                        {sortOption.field === option.field && sortOption.order === 'desc' && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
