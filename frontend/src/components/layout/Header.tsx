"use client"

import React from 'react'
import { Bell } from 'lucide-react'
import { UserProfile } from './UserProfile'
import { useAuth } from '@/hooks/useAuth'
import capitalizeEachWord from '@/utils/captializeEachWord'

interface HeaderProps {
  onNotificationClick?: () => void
  notificationCount?: number
}

export const Header: React.FC<HeaderProps> = ({
  onNotificationClick,
  notificationCount = 0
}) => {
  const { user, logout } = useAuth()

  // Don't render if no user data
  if (!user) {
    return null
  }

  return (
    <header className="bg-[#FFFAF4] border-b-1 border-gray-300 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Side - Greeting */}
        <div className="flex-1">
          <h1 className="text-lg font-medium text-gray-900">
            Xin chào, {capitalizeEachWord(user.name)}!
          </h1>
          <p className="text-sm text-gray-500">
            Ngày mới tốt lành!
          </p>
        </div>

        {/* Right Side - Notifications & User Profile */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={onNotificationClick}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-gray-300" />

          {/* User Profile */}
          <UserProfile
            username={capitalizeEachWord(user.name)}
            role={capitalizeEachWord(user.role || "Headhunter")}
            onLogout={logout}
          />
        </div>
      </div>
    </header>
  )
}
