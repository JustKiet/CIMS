"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserProfileProps {
  username: string
  role: string
  avatar?: string
  onLogout: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({
  username,
  role,
  avatar,
  onLogout
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={username}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#982B1C] flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {getInitials(username)}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {username}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {role}
          </span>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform duration-200",
            isDropdownOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-full bg-white rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={() => {
              onLogout()
              setIsDropdownOpen(false)
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            <LogOut className="w-4 h-4 mr-3 text-gray-400" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
