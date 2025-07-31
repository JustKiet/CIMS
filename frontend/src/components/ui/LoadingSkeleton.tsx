import React from 'react'

interface LoadingSkeletonProps {
  rows?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
        
        {/* Table header skeleton */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
        
        {/* Table rows skeleton */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-8 bg-gray-100 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
