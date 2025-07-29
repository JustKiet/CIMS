"use client"

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'

function DashboardContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleNotificationClick = () => {
    // Handle notification click
    console.log('Notification clicked')
  }

  return (
    <DashboardLayout
      onNotificationClick={handleNotificationClick}
      notificationCount={3}
    >
      {/* Dashboard Content */}
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Candidate Information Management System
          </h2>
          <p className="text-gray-600">
            Manage candidates, projects, and recruitment processes
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Logged in as: {user.name} ({user.email})
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Candidates</h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
            <p className="text-sm text-gray-500">Total active candidates</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Projects</h3>
            <p className="text-3xl font-bold text-green-600">56</p>
            <p className="text-sm text-gray-500">Active projects</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Placements</h3>
            <p className="text-3xl font-bold text-purple-600">89</p>
            <p className="text-sm text-gray-500">This month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-orange-600">92%</p>
            <p className="text-sm text-gray-500">Placement success</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white rounded-lg shadow p-4 text-left hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900">Add New Candidate</h4>
              <p className="text-sm text-gray-500">Register a new candidate profile</p>
            </button>
            
            <button className="bg-white rounded-lg shadow p-4 text-left hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900">Create Project</h4>
              <p className="text-sm text-gray-500">Start a new recruitment project</p>
            </button>
            
            <button className="bg-white rounded-lg shadow p-4 text-left hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900">View Reports</h4>
              <p className="text-sm text-gray-500">Generate placement reports</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
