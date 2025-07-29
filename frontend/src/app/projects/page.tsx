"use client"

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'

function ProjectsContent() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <DashboardLayout
      notificationCount={3}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý dự án</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Project management functionality will be implemented here.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function Projects() {
  return (
    <ProtectedRoute>
      <ProjectsContent />
    </ProtectedRoute>
  )
}
