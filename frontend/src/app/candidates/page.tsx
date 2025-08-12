"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'
import { CandidateHeader, CandidateTable, CandidateCreateModal } from '@/components/candidates'
import { Pagination, ConfirmDialog } from '@/components/ui'
import { useCandidates } from '@/hooks/useCandidates'
import { CandidateResponse } from '@/lib/api'
import { useSearchParams } from 'next/navigation'

function CandidatesContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const {
    candidates,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    totalPages,
    searchQuery,
    sortOption,
    filters,
    setPage,
    setPageSize,
    setSearchQuery,
    setSortOption,
    setFilters,
    deleteCandidate,
    refetch,
    searchWithFilters
  } = useCandidates()

  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    candidateId: number | null
    candidateName: string
  }>({
    open: false,
    candidateId: null,
    candidateName: ''
  })
  const [deleting, setDeleting] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Auto-open modal if action=add parameter is present
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add') {
      setCreateModalOpen(true)
    }
  }, [searchParams])

  if (!user) return null

  const handleAddCandidate = () => {
    setCreateModalOpen(true)
  }

  const handleCreateSuccess = async () => {
    // Refresh the candidates list
    await refetch()
  }

  const handleEditCandidate = (candidate: CandidateResponse) => {
    // Edit functionality is handled within CandidateTable component via modal
    console.log('Edit candidate:', candidate)
  }

  const handleDeleteCandidate = (candidateId: number) => {
    const candidate = candidates.find(p => p.candidate_id === candidateId)
    setDeleteConfirm({
      open: true,
      candidateId: candidateId,
      candidateName: candidate ? candidate.name : ''
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.candidateId) return

    try {
      setDeleting(true)
      setDeleteError(null)
      await deleteCandidate(deleteConfirm.candidateId)
      setDeleteConfirm({ open: false, candidateId: null, candidateName: '' })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa ứng viên')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ open: false, candidateId: null, candidateName: '' })
  }

  return (
    <DashboardLayout notificationCount={3}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý ứng viên</h1>

        {/* Header with search and controls */}
        <CandidateHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddCandidate={handleAddCandidate}
          sortOption={sortOption}
          onSortChange={setSortOption}
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={searchWithFilters}
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

        {/* Candidates Table */}
        <CandidateTable
          candidates={candidates}
          loading={loading}
          onEdit={handleEditCandidate}
          onDelete={handleDeleteCandidate}
          onRefresh={refetch}
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
          title="Xác nhận xóa ứng viên"
          message={`Bạn có chắc chắn muốn xóa ${deleteConfirm.candidateName}? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          loading={deleting}
        />

        {/* Candidate Creation Modal */}
        <CandidateCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </DashboardLayout>
  )
}

export default function Candidates() {
  return (
    <ProtectedRoute>
      <CandidatesContent />
    </ProtectedRoute>
  )
}
