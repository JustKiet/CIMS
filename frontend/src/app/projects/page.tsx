"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'
import { ProjectHeader, ProjectTable, ProjectCreateModal, ProjectUpdateModal } from '@/components/projects'
import { Pagination, ConfirmDialog } from '@/components/ui'
import { useProjects } from '@/hooks/useProjects'
import { ProjectResponse } from '@/lib/api'
import { useSearchParams } from 'next/navigation'

function ProjectsContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const {
    projects,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    totalPages,
    searchQuery,
    sortOption,
    setPage,
    setPageSize,
    setSearchQuery,
    setSortOption,
    deleteProject,
    refetch
  } = useProjects()

  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    projectId: number | null
    projectName: string
  }>({
    open: false,
    projectId: null,
    projectName: ''
  })
  const [deleting, setDeleting] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null)

  // Auto-open modal if action=add parameter is present
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add') {
      setCreateModalOpen(true)
    }
  }, [searchParams])

  if (!user) return null

  const handleAddProject = () => {
    setCreateModalOpen(true)
  }

  const handleCreateSuccess = async () => {
    // Refresh the projects list
    await refetch()
  }

  const handleUpdateSuccess = async () => {
    // Refresh the projects list
    await refetch()
  }

  const handleEditProject = (project: ProjectResponse) => {
    setSelectedProject(project)
    setUpdateModalOpen(true)
  }

  const handleDeleteProject = (projectId: number) => {
    const project = projects.find(p => p.project_id === projectId)
    setDeleteConfirm({
      open: true,
      projectId,
      projectName: project ? `[${project.customer_name}] ${project.expertise_name}` : 'dự án này'
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.projectId) return

    try {
      setDeleting(true)
      setDeleteError(null)
      await deleteProject(deleteConfirm.projectId)
      setDeleteConfirm({ open: false, projectId: null, projectName: '' })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa dự án')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ open: false, projectId: null, projectName: '' })
  }

  return (
    <DashboardLayout notificationCount={3}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý dự án</h1>
        
        {/* Header with search and controls */}
        <ProjectHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddProject={handleAddProject}
          sortOption={sortOption}
          onSortChange={setSortOption}
          loading={loading}
        />

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {deleteError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {deleteError}
          </div>
        )}

        {/* Projects Table */}
        <ProjectTable
          projects={projects}
          loading={loading}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConfirm.open}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Xác nhận xóa dự án"
          message={`Bạn có chắc chắn muốn xóa ${deleteConfirm.projectName}? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          loading={deleting}
        />

        {/* Project Creation Modal */}
        <ProjectCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Project Update Modal */}
        <ProjectUpdateModal
          open={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          onSuccess={handleUpdateSuccess}
          project={selectedProject}
        />
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
