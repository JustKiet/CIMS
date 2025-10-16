import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { User } from 'lucide-react'
import type { NomineeResponse } from '@/lib/api'
import { NomineeDetailsModal } from './NomineeDetailsModal'

// Extended interface to handle both NomineeResponse and NomineeWithCandidate
interface NomineeCardProps {
  nominee: NomineeResponse & {
    candidate_name?: string
    candidate_phone?: string
  }
  hideAvatar?: boolean
}

export const NomineeCard: React.FC<NomineeCardProps> = ({
  nominee,
  hideAvatar = false
}) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nominee.nominee_id })

  // Use nominee_name and candidate phone number
  const nomineeName = nominee.nominee_name || `Nominee ${nominee.nominee_id}`
  const phoneNumber = nominee.candidate_phone || 'No phone'

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-gray-900 truncate">
                {nomineeName}
              </h5>
              <p className="text-xs text-gray-500">
                {phoneNumber}
              </p>
            </div>
            
            {/* User Details Icon - Clickable */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsDetailsModalOpen(true)
              }}
              className="ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Xem chi tiết ứng viên"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <NomineeDetailsModal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        nomineeId={nominee.nominee_id}
      />
    </>
  )
}
