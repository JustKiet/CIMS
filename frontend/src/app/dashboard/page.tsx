"use client"

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth'
import { DashboardLayout } from '@/components/layout'
import { useDashboard } from '@/hooks/useDashboard'
import { 
  StatsCard, 
  PieChart, 
  BarChart, 
  LineChart, 
  RecentActivity 
} from '@/components/dashboard'
import { 
  Users, 
  Building2, 
  Briefcase, 
  UserCheck, 
  TrendingUp, 
  CheckCircle, 
  Pause,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

function DashboardContent() {
  const { user, isLoading: authLoading } = useAuth()
  const { stats, loading: dashboardLoading, error, refetch } = useDashboard()
  const router = useRouter()

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFAF4] via-white to-[#FFFAF4]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#982B1C]/20 border-t-[#982B1C] rounded-full animate-spin mx-auto mb-4"></div>
            <Loader2 className="w-6 h-6 text-[#982B1C] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-[#982B1C] mb-2">Đang tải Dashboard</h2>
          <p className="text-gray-600">Đang lấy dữ liệu của bạn...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <DashboardLayout notificationCount={0}>
        <div className="p-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Không thể tải Dashboard</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={refetch}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleNotificationClick = () => {
    console.log('Notification clicked')
  }

  // Fallback stats if data is not available
  const safeStats = stats || {
    totalCandidates: 0,
    totalCustomers: 0,
    totalProjects: 0,
    totalNominees: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    candidatesByExpertise: {},
    projectsByStatus: {
      'TIMKIEMUNGVIEN': 0,
      'UNGVIENPHONGVAN': 0,
      'UNGVIENTHUVIEC': 0,
      'TAMNGUNG': 0,
      'HUY': 0,
      'HOANTHANH': 0
    },
    nomineesByStatus: {
      'DECU': 0,
      'PHONGVAN': 0,
      'THUONGLUONG': 0,
      'THUVIEC': 0,
      'TUCHOI': 0,
      'KYHOPDONG': 0
    },
    projectsByCustomer: [],
    recentActivity: {
      candidates: [],
      projects: [],
      nominees: []
    },
    monthlyTrends: []
  }

  return (
    <DashboardLayout
      onNotificationClick={handleNotificationClick}
      notificationCount={3}
    >
      {/* Dashboard Content */}
      <div className="min-h-screen bg-gradient-to-br from-[#FFFAF4] via-white to-[#FFFAF4] p-6">
        {/* Header */}
        {/* <div className="mb-8">
          <div className="bg-gradient-to-r from-[#982B1C] to-[#B91C1C] rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Chào mừng trở lại, {user.name}! 👋
                </h1>
                <p className="text-xl opacity-90 mb-4">
                  Đây là những gì đang diễn ra với tuyển dụng hôm nay
                </p>
                <div className="text-sm opacity-75">
                  {new Date().toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng số ứng viên"
            value={safeStats.totalCandidates}
            subtitle="Hồ sơ đang hoạt động"
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Dự án đang hoạt động"
            value={safeStats.activeProjects}
            subtitle="Đang trong tiến trình"
            icon={Briefcase}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Tổng số khách hàng"
            value={safeStats.totalCustomers}
            subtitle="Công ty đối tác"
            icon={Building2}
            color="purple"
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Tuyển dụng thành công"
            value={safeStats.nomineesByStatus['KYHOPDONG'] || 0}
            subtitle="Trong tháng này"
            icon={UserCheck}
            color="orange"
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Dự án hoàn thành"
            value={safeStats.completedProjects}
            subtitle="Hoàn thành thành công"
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Dự án tạm dừng"
            value={safeStats.onHoldProjects}
            subtitle="Tạm dừng hoặc hủy bỏ"
            icon={Pause}
            color="red"
          />
          <StatsCard
            title="Tổng số đề cử"
            value={safeStats.totalNominees}
            subtitle="Tất cả đề cử"
            icon={UserCheck}
            color="pink"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Status Distribution */}
          <PieChart
            title="Dự án theo trạng thái"
            data={{
              'Tìm kiếm ứng viên': safeStats.projectsByStatus['TIMKIEMUNGVIEN'],
              'Phỏng vấn': safeStats.projectsByStatus['UNGVIENPHONGVAN'],
              'Thử việc': safeStats.projectsByStatus['UNGVIENTHUVIEC'],
              'Hoàn thành': safeStats.projectsByStatus['HOANTHANH'],
              'Tạm dừng': safeStats.projectsByStatus['TAMNGUNG'],
              'Hủy bỏ': safeStats.projectsByStatus['HUY']
            }}
            colors={['#DC2626', '#EA580C', '#D97706', '#16A34A', '#6B7280', '#EF4444']}
          />

          {/* Nominee Status Distribution */}
          <PieChart
            title="Đề cử theo trạng thái"
            data={{
              'Đề cử': safeStats.nomineesByStatus['DECU'],
              'Phỏng vấn': safeStats.nomineesByStatus['PHONGVAN'],
              'Thương lượng': safeStats.nomineesByStatus['THUONGLUONG'],
              'Thử việc': safeStats.nomineesByStatus['THUVIEC'],
              'Được tuyển': safeStats.nomineesByStatus['KYHOPDONG'],
              'Từ chối': safeStats.nomineesByStatus['TUCHOI']
            }}
            colors={['#2563EB', '#7C3AED', '#DC2626', '#EA580C', '#16A34A', '#6B7280']}
          />
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Candidates by Expertise */}
          <BarChart
            title="Ứng viên theo chuyên môn"
            data={safeStats.candidatesByExpertise}
            color="#982B1C"
          />

          {/* Top Customers by Projects */}
          <BarChart
            title="Khách hàng hàng đầu theo dự án"
            data={safeStats.projectsByCustomer.reduce((acc, item) => {
              acc[item.customerName] = item.projectCount
              return acc
            }, {} as { [key: string]: number })}
            color="#7C3AED"
            horizontal
          />
        </div>

        {/* Trends and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Trends */}
          <div className="lg:col-span-2">
            <LineChart
              title="Xu hướng hiệu suất hàng tháng"
              data={safeStats.monthlyTrends}
            />
          </div>

          {/* Recent Activity */}
          <RecentActivity
            candidates={safeStats.recentActivity.candidates}
            projects={safeStats.recentActivity.projects}
            nominees={safeStats.recentActivity.nominees}
          />
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-12 bg-gradient-to-r from-[#982B1C]/5 to-[#982B1C]/10 rounded-2xl p-8 border border-[#982B1C]/20">
          <h3 className="text-xl font-semibold text-[#982B1C] mb-6 text-center">Thao tác nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => router.push('/candidates?action=add')}
              className="group bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[#982B1C]/10"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Thêm ứng viên mới</h4>
                  <p className="text-sm text-gray-500">Đăng ký hồ sơ ứng viên mới</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/projects?action=add')}
              className="group bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[#982B1C]/10"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Tạo dự án</h4>
                  <p className="text-sm text-gray-500">Bắt đầu dự án tuyển dụng mới</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/reports')}
              className="group bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[#982B1C]/10"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Xem báo cáo</h4>
                  <p className="text-sm text-gray-500">Tạo báo cáo tuyển dụng</p>
                </div>
              </div>
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
