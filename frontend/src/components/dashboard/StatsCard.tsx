import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'pink'
  trend?: {
    value: number
    isPositive: boolean
  }
}

const colorClasses = {
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border-red-200',
    icon: 'text-red-600',
    value: 'text-red-700',
    title: 'text-red-900'
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    value: 'text-blue-700',
    title: 'text-blue-900'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-200',
    icon: 'text-green-600',
    value: 'text-green-700',
    title: 'text-green-900'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    value: 'text-purple-700',
    title: 'text-purple-900'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    value: 'text-orange-700',
    title: 'text-orange-900'
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
    border: 'border-pink-200',
    icon: 'text-pink-600',
    value: 'text-pink-700',
    title: 'text-pink-900'
  }
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}) => {
  const colors = colorClasses[color]

  return (
    <div className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <Icon size={80} className={colors.icon} />
      </div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
            <Icon size={24} className={colors.icon} />
          </div>
          {trend && (
            <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className={`text-sm font-medium ${colors.title} opacity-80`}>
            {title}
          </h3>
          <p className={`text-3xl font-bold ${colors.value}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`text-xs ${colors.title} opacity-60`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full hover:animate-pulse"></div>
      </div>
    </div>
  )
}
