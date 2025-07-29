"use client"

import React, { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardLayoutProps {
  children: ReactNode
  onNotificationClick?: () => void
  notificationCount?: number
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onNotificationClick,
  notificationCount = 0
}) => {
  return (
    <div className="min-h-screen bg-[#FFFAF4]">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="ml-[16.666667%]"> {/* ml-1/6 equivalent */}
        {/* Header */}
        <Header
          onNotificationClick={onNotificationClick}
          notificationCount={notificationCount}
        />
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
