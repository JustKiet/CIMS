'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface TrendData {
  month: string
  candidates: number
  projects: number
  placements: number
}

interface LineChartProps {
  title: string
  data: TrendData[]
  className?: string
}

export const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  className = ''
}) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Ứng viên',
        data: data.map(item => item.candidates),
        borderColor: '#DC2626', // red-600
        backgroundColor: '#DC262620', // red-600 with opacity
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#DC2626',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Dự án',
        data: data.map(item => item.projects),
        borderColor: '#2563EB', // blue-600
        backgroundColor: '#2563EB20', // blue-600 with opacity
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Tuyển dụng',
        data: data.map(item => item.placements),
        borderColor: '#16A34A', // green-600
        backgroundColor: '#16A34A20', // green-600 with opacity
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#16A34A',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
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
        intersect: false,
        mode: 'index' as const,
        callbacks: {
          label: function(context: { datasetIndex: number; parsed: { y: number }; dataset: { label?: string } }) {
            return `${context.dataset.label || 'Unknown'}: ${context.parsed.y.toLocaleString()}`
          }
        }
      }
    },
    scales: {
      x: {
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
    elements: {
      line: {
        borderWidth: 3
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  }

  return (
    <div className={`bg-gradient-to-br from-[#FFFAF4] to-white rounded-xl border border-[#982B1C]/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <h3 className="text-lg font-semibold text-[#982B1C] mb-4">{title}</h3>
      <div className="relative h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
