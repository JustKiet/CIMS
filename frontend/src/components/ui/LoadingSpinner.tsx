import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} text-[#982B1C] animate-spin`} />
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-[#982B1C] animate-pulse" />
      </div>
      {text && (
        <p className={`mt-3 text-[#982B1C] font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  )
}

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFAF4] via-white to-[#FEF7ED]">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-br from-[#982B1C] via-[#B91C1C] to-[#DC2626] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-12 bg-white/20 rounded-lg mb-4 mx-auto max-w-md animate-pulse"></div>
            <div className="h-6 bg-white/15 rounded-lg mb-2 mx-auto max-w-lg animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded-lg mx-auto max-w-xl animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse">
                <div className="h-12 w-12 bg-white/20 rounded-lg mb-4"></div>
                <div className="h-4 bg-white/15 rounded mb-2"></div>
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>

          {/* Secondary Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse">
                <div className="h-12 w-12 bg-white/20 rounded-lg mb-4"></div>
                <div className="h-4 bg-white/15 rounded mb-2"></div>
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section Skeleton */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 mx-auto animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-lg mb-4 mx-auto max-w-md animate-pulse"></div>
            <div className="h-5 bg-gray-100 rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 max-w-sm"></div>
                <div className="h-64 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border p-6 mb-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 max-w-sm"></div>
            <div className="h-80 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
