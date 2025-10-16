import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface DropdownOption {
  id: number
  name: string
}

interface SearchableDropdownProps {
  options: DropdownOption[]
  placeholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  onSelect: (option: DropdownOption) => void
  required?: boolean
  inModal?: boolean
  label?: string
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  placeholder,
  searchValue,
  onSearchChange,
  isOpen,
  onToggle,
  onSelect,
  required = false,
  inModal = false,
  label
}) => {
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const dropdownZIndex = inModal ? 'z-[70]' : 'z-50'

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => !isOpen && onToggle()}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={required}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggle()
          }}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className={`absolute ${dropdownZIndex} w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg`}>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
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
