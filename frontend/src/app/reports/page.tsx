"use client"

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'

function ReportsContent() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout
      notificationCount={3}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Báo cáo - Thống kê</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Reports and statistics functionality will be implemented here.</p>
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
