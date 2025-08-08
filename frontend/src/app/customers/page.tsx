"use client"

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'
import { CustomerHeader, CustomerTable, CustomerCreateModal, CustomerUpdateModal } from '@/components/customers'
import { Pagination, ConfirmDialog } from '@/components/ui'
import { useCustomers } from '@/hooks/useCustomers'
import { CustomerResponse } from '@/lib/api'

function CustomersContent() {
  const { user } = useAuth()
  const {
    customers,
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
    deleteCustomer,
    refetch,
    searchCustomers
  } = useCustomers()

  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    customerId: number | null
    customerName: string
  }>({
    open: false,
    customerId: null,
    customerName: ''
  })
  const [deleting, setDeleting] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null)

  if (!user) return null

  const handleAddCustomer = () => {
    setCreateModalOpen(true)
  }

  const handleCreateSuccess = async () => {
    // Refresh the customers list
    await refetch()
  }

  const handleEditCustomer = (customer: CustomerResponse) => {
    setSelectedCustomer(customer)
    setUpdateModalOpen(true)
  }

  const handleUpdateSuccess = async () => {
    // Refresh the customers list
    await refetch()
  }

  const handleDeleteCustomer = (customerId: number) => {
    const customer = customers.find(c => c.customer_id === customerId)
    setDeleteConfirm({
      open: true,
      customerId: customerId,
      customerName: customer ? customer.name : ''
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.customerId) return

    try {
      setDeleting(true)
      setDeleteError(null)
      await deleteCustomer(deleteConfirm.customerId)
      setDeleteConfirm({ open: false, customerId: null, customerName: '' })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa khách hàng')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ open: false, customerId: null, customerName: '' })
  }

  return (
    <DashboardLayout notificationCount={3}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý khách hàng</h1>

        {/* Header with search and controls */}
        <CustomerHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddCustomer={handleAddCustomer}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onSearch={searchCustomers}
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

        {/* Customers Table */}
        <CustomerTable
          customers={customers}
          loading={loading}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
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
          title="Xác nhận xóa khách hàng"
          message={`Bạn có chắc chắn muốn xóa ${deleteConfirm.customerName}? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          loading={deleting}
        />

        {/* Customer Creation Modal */}
        <CustomerCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Customer Update Modal */}
        <CustomerUpdateModal
          open={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false)
            setSelectedCustomer(null)
          }}
          onSuccess={handleUpdateSuccess}
          customer={selectedCustomer}
        />
      </div>
    </DashboardLayout>
  )
}

export default function Customers() {
  return (
    <ProtectedRoute>
      <CustomersContent />
    </ProtectedRoute>
  )
}
