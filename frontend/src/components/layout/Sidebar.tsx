"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FolderOpen, 
  Users, 
  Building2, 
  UserCheck, 
  BarChart3, 
  Settings 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
}

const sidebarItems: SidebarItem[] = [
  { 
    label: 'Trang chủ', 
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />
  },
  { 
    label: 'Quản lý dự án', 
    href: '/projects',
    icon: <FolderOpen className="w-5 h-5" />
  },
  { 
    label: 'Danh sách ứng viên', 
    href: '/candidates',
    icon: <Users className="w-5 h-5" />
  },
  { 
    label: 'Danh sách khách hàng', 
    href: '/customers',
    icon: <Building2 className="w-5 h-5" />
  },
  { 
    label: 'Danh sách nhân sự', 
    href: '/staff',
    icon: <UserCheck className="w-5 h-5" />
  },
  { 
    label: 'Báo cáo - Thống kê', 
    href: '/reports',
    icon: <BarChart3 className="w-5 h-5" />
  },
  { 
    label: 'Cài đặt', 
    href: '/settings',
    icon: <Settings className="w-5 h-5" />
  },
]

export const Sidebar: React.FC = () => {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-1/6 min-w-[240px] bg-[#982B1C] flex flex-col">
      {/* AWC Logo */}
      <div className="flex items-center justify-center py-6 px-4">
        <div className="relative">
          <Image
            src="/awc-logo-cropped.png"
            alt="AWC - Asia White Collar"
            width={180}
            height={60}
            className="object-contain brightness-0 invert"
            style={{
              objectPosition: 'center'
            }}
            priority
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white hover:bg-black/20 hover:text-white"
                  )}
                >
                  <span className={cn(
                    "mr-3 transition-all duration-200",
                    isActive 
                      ? "text-white" 
                      : "text-white/80 group-hover:text-white"
                  )}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
