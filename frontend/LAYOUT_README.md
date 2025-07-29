# Layout Components Documentation

## Overview
This document describes the modular layout components created for the CIMS dashboard.

## Components

### 1. Sidebar (`components/layout/Sidebar.tsx`)
- **Purpose**: Fixed left sidebar navigation
- **Width**: 1/6 of page width (16.666667%)
- **Background**: #982B1C (AWC brand color)
- **Features**:
  - AWC logo (white version using CSS filter)
  - Navigation menu with active state highlighting
  - Hover effects for non-active items

### 2. Header (`components/layout/Header.tsx`)
- **Purpose**: Top header for the main content area
- **Features**:
  - Welcome message with username
  - Notification bell with count badge
  - User profile dropdown
  - Vertical divider between elements

### 3. UserProfile (`components/layout/UserProfile.tsx`)
- **Purpose**: User profile component with dropdown menu
- **Features**:
  - Avatar (image or initials fallback)
  - Username and role display
  - Dropdown with logout option
  - Click outside to close functionality

### 4. DashboardLayout (`components/layout/DashboardLayout.tsx`)
- **Purpose**: Main layout wrapper combining sidebar and header
- **Features**:
  - Integrates sidebar and header
  - Responsive content area
  - Props for user data and callbacks

## Usage Example

```tsx
import { DashboardLayout } from '@/components/layout'

function MyPage() {
  const { user, logout } = useAuth()
  
  return (
    <DashboardLayout
      username={`${user.first_name} ${user.last_name}`}
      role="Admin"
      onLogout={logout}
      onNotificationClick={() => console.log('Notifications')}
      notificationCount={5}
    >
      <div className="p-6">
        <h1>Page Content</h1>
      </div>
    </DashboardLayout>
  )
}
```

## Navigation Routes

The sidebar includes navigation to these routes:
- `/dashboard` - Trang chủ (highlighted when active)
- `/projects` - Quản lý dự án
- `/candidates` - Danh sách ứng viên
- `/customers` - Danh sách khách hàng
- `/staff` - Danh sách nhân sự
- `/reports` - Báo cáo - Thống kê
- `/settings` - Cài đặt

## Styling

- Uses Tailwind CSS for styling
- Follows the brand color scheme (#982B1C)
- Responsive design with minimum width constraints
- Consistent hover and active states
- Clean shadows and transitions

## Integration

All pages are protected with `ProtectedRoute` and use the `useAuth` hook for user data and authentication state management.
