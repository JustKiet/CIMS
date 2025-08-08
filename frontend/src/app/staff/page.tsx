"use client"

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'
import { HeadhunterHeader, HeadhunterTable, HeadhunterCreateModal, HeadhunterUpdateModal } from '@/components/headhunters'
import { Pagination, ConfirmDialog } from '@/components/ui'
import { useHeadhunters } from '@/hooks/useHeadhunters'
import { HeadhunterResponse } from '@/lib/api'

function StaffContent() {
  const { user } = useAuth()
  const {
    headhunters,
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
    deleteHeadhunter,
    refetch,
    searchHeadhunters
  } = useHeadhunters()

  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    headhunterId: number | null
    headhunterName: string
  }>({
    open: false,
    headhunterId: null,
    headhunterName: ''
  })
  const [deleting, setDeleting] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedHeadhunter, setSelectedHeadhunter] = useState<HeadhunterResponse | null>(null)

  if (!user) return null

  const handleAddHeadhunter = () => {
    setCreateModalOpen(true)
  }

  const handleCreateSuccess = async () => {
    // Refresh the headhunters list
    await refetch()
  }

  const handleEditHeadhunter = (headhunter: HeadhunterResponse) => {
    setSelectedHeadhunter(headhunter)
    setUpdateModalOpen(true)
  }

  const handleUpdateSuccess = async () => {
    // Refresh the headhunters list
    await refetch()
  }

  const handleDeleteHeadhunter = (headhunterId: number) => {
    const headhunter = headhunters.find(h => h.headhunter_id === headhunterId)
    setDeleteConfirm({
      open: true,
      headhunterId: headhunterId,
      headhunterName: headhunter ? headhunter.name : ''
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.headhunterId) return

    try {
      setDeleting(true)
      setDeleteError(null)
      await deleteHeadhunter(deleteConfirm.headhunterId)
      setDeleteConfirm({ open: false, headhunterId: null, headhunterName: '' })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa nhân sự')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ open: false, headhunterId: null, headhunterName: '' })
  }

  return (
    <DashboardLayout notificationCount={3}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý nhân sự</h1>

        {/* Header with search and controls */}
        <HeadhunterHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddHeadhunter={handleAddHeadhunter}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onSearch={searchHeadhunters}
          loading={loading}
          currentUser={user}
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

        {/* Headhunters Table */}
        <HeadhunterTable
          headhunters={headhunters}
          loading={loading}
          onEdit={handleEditHeadhunter}
          onDelete={handleDeleteHeadhunter}
          currentUser={user}
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
          title="Xác nhận xóa nhân sự"
          message={`Bạn có chắc chắn muốn xóa ${deleteConfirm.headhunterName}? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          loading={deleting}
        />

        {/* Headhunter Creation Modal */}
        <HeadhunterCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          currentUser={user}
        />

        {/* Headhunter Update Modal */}
        <HeadhunterUpdateModal
          open={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false)
            setSelectedHeadhunter(null)
          }}
          onSuccess={handleUpdateSuccess}
          headhunter={selectedHeadhunter}
          currentUser={user}
        />
      </div>
    </DashboardLayout>
  )
}

export default function Staff() {
  return (
    <ProtectedRoute>
      <StaffContent />
    </ProtectedRoute>
  )
}
