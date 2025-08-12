'use client'

import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BarChartProps {
  title: string
  data: { [key: string]: number }
  color?: string
  className?: string
  horizontal?: boolean
}

export const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  color = '#982B1C',
  className = '',
  horizontal = false
}) => {
  const labels = Object.keys(data)
  const values = Object.values(data)
  
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: `${color}80`, // 50% opacity
        borderColor: color,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: `${color}CC`, // 80% opacity
        hoverBorderColor: color,
        hoverBorderWidth: 3
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#6B7280',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: { label: string; parsed: { x?: number; y?: number } }) {
            const value = horizontal ? context.parsed.x : context.parsed.y
            return `${context.label}: ${value?.toLocaleString() || 0}`
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      }
    },
    animation: {
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
