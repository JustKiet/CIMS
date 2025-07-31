import { ProjectStatus, ProjectType } from '@/lib/api'

export const formatProjectStatus = (status: ProjectStatus): { label: string; color: string } => {
  const statusMap = {
    TIMKIEMUNGVIEN: { label: 'Tìm kiếm ứng viên', color: 'bg-yellow-500' },
    UNGVIENPHONGVAN: { label: 'Ứng viên phỏng vấn', color: 'bg-blue-500' },
    UNGVIENTHUVIEC: { label: 'Ứng viên thử việc', color: 'bg-purple-500' },
    TAMNGUNG: { label: 'Tạm ngưng', color: 'bg-orange-500' },
    HUY: { label: 'Hủy', color: 'bg-red-500' },
    HOANTHANH: { label: 'Hoàn thành', color: 'bg-green-500' }
  }
  
  return statusMap[status] || { label: status, color: 'bg-gray-500' }
}

export const formatProjectType = (type: ProjectType): string => {
  const typeMap = {
    CODINH: 'Cố định',
    THOIVU: 'Thời vụ'
  }
  
  return typeMap[type] || type
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })
}

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatProjectDisplayName = (
  project: { 
    customer_name?: string; 
    expertise_name?: string; 
    name?: string 
  }
): string => {
  if (project.customer_name && project.expertise_name) {
    return `[${project.customer_name}] ${project.expertise_name}`
  }
  return project.name || 'Chưa có tên'
}
