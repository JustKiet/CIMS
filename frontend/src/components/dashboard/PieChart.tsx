'use client'

import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  title: string
  data: { [key: string]: number }
  colors?: string[]
  className?: string
}

const defaultColors = [
  '#DC2626', // red-600
  '#EA580C', // orange-600  
  '#D97706', // amber-600
  '#CA8A04', // yellow-600
  '#65A30D', // lime-600
  '#16A34A', // green-600
  '#059669', // emerald-600
  '#0D9488', // teal-600
  '#0891B2', // cyan-600
  '#0284C7', // sky-600
  '#2563EB', // blue-600
  '#7C3AED', // violet-600
  '#9333EA', // purple-600
  '#C026D3', // fuchsia-600
  '#DB2777', // pink-600
  '#E11D48', // rose-600
]

export const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  colors = defaultColors,
  className = ''
}) => {
  const labels = Object.keys(data)
  const values = Object.values(data)
  
  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length).map(color => color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#FFFFFF',
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: 500
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#6B7280',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: { label: string; parsed: number; dataset: { data: number[] } }) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  }

  // Don't render if no data
  if (labels.length === 0 || values.every(v => v === 0)) {
    return (
      <div className={`bg-gradient-to-br from-[#FFFAF4] to-white rounded-xl border border-[#982B1C]/20 p-6 shadow-lg ${className}`}>
        <h3 className="text-lg font-semibold text-[#982B1C] mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-[#FFFAF4] to-white rounded-xl border border-[#982B1C]/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <h3 className="text-lg font-semibold text-[#982B1C] mb-4">{title}</h3>
      <div className="relative h-64">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  )
}
