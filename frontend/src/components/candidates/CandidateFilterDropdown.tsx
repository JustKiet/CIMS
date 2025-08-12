import React, { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
  expertiseAPI, 
  fieldAPI, 
  areaAPI, 
  levelAPI,
  ExpertiseResponse,
  FieldResponse,
  AreaResponse,
  LevelResponse
} from '@/lib/api'

export interface CandidateFilters {
  expertiseId?: number
  fieldId?: number
  areaId?: number
  levelId?: number
}

interface CandidateFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  filters: CandidateFilters
  onFiltersChange: (filters: CandidateFilters) => void
  onSearch: () => void
  searchBarRef: React.RefObject<HTMLDivElement | null>
}

interface FilterSection {
  title: string
  items: Array<{ id: number; name: string }>
  selectedId?: number
  onSelect: (id: number | undefined) => void
}

const FilterSection: React.FC<FilterSection> = ({ title, items, selectedId, onSelect }) => {
  return (
    <div className="py-4">
      <h3 className="text-sm font-semibold text-[#982B1C] mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-500 italic">Không có dữ liệu</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(selectedId === item.id ? undefined : item.id)}
              className={`px-3 py-1.5 text-xs rounded-full border border-gray-300 transition-all duration-200 ${
                selectedId === item.id
                  ? 'bg-[#982B1C] text-white border-[#982B1C]'
                  : 'bg-white text-gray-700 hover:bg-[#EFBAB7] hover:bg-opacity-25'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const CandidateFilterDropdown: React.FC<CandidateFilterDropdownProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onSearch,
  searchBarRef
}) => {
  const [expertises, setExpertises] = useState<ExpertiseResponse[]>([])
  const [fields, setFields] = useState<FieldResponse[]>([])
  const [areas, setAreas] = useState<AreaResponse[]>([])
  const [levels, setLevels] = useState<LevelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setLoading(true)
        const [expertiseRes, fieldRes, areaRes, levelRes] = await Promise.all([
          expertiseAPI.getExpertises(1, 100),
          fieldAPI.getFields(1, 100),
          areaAPI.getAreas(1, 100),
          levelAPI.getLevels(1, 100)
        ])

        setExpertises(expertiseRes.data)
        setFields(fieldRes.data)
        setAreas(areaRes.data)
        setLevels(levelRes.data)
      } catch (error) {
        console.error('Error loading filter data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadFilterData()
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, searchBarRef])

  // Position the dropdown relative to the search bar
  const getDropdownStyle = (): React.CSSProperties => {
    return {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '4px', // Small gap for visual preference
      zIndex: 50
    }
  }

  const handleFilterChange = (key: keyof CandidateFilters, value: number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleClearAll = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined)

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      style={getDropdownStyle()}
      className="bg-white rounded-lg shadow-md border border-gray-200 max-h-96 overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Bộ lọc tìm kiếm</h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Xóa tất cả
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#982B1C]"></div>
          </div>
        ) : (
          <>
            {/* Expertise Filter */}
            <FilterSection
              title="Chuyên môn"
              items={expertises.map(e => ({ id: e.expertise_id, name: e.name }))}
              selectedId={filters.expertiseId}
              onSelect={(id) => handleFilterChange('expertiseId', id)}
            />

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Field Filter */}
            <FilterSection
              title="Lĩnh vực"
              items={fields.map(f => ({ id: f.field_id, name: f.name }))}
              selectedId={filters.fieldId}
              onSelect={(id) => handleFilterChange('fieldId', id)}
            />

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Area Filter */}
            <FilterSection
              title="Khu vực"
              items={areas.map(a => ({ id: a.area_id, name: a.name }))}
              selectedId={filters.areaId}
              onSelect={(id) => handleFilterChange('areaId', id)}
            />

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Level Filter */}
            <FilterSection
              title="Cấp bậc"
              items={levels.map(l => ({ id: l.level_id, name: l.name }))}
              selectedId={filters.levelId}
              onSelect={(id) => handleFilterChange('levelId', id)}
            />
          </>
        )}

        {/* Search Button */}
        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
          <Button
            onClick={() => {
              onSearch()
              onClose()
            }}
            className="flex items-center gap-2 bg-[#982B1C] hover:bg-[#7A2116] text-white px-6 py-2 rounded-lg"
            disabled={loading}
          >
            <Search className="h-4 w-4" />
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  )
}
