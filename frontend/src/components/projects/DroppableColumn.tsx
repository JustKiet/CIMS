import React from 'react'
import { useDroppable, useDndMonitor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { NomineeCard } from './NomineeCard'
import type { NomineeResponse } from '@/lib/api'

interface DroppableColumnProps {
  id: string
  title: string
  nominees: NomineeResponse[]
  hideAvatars?: boolean
  className?: string
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  title,
  nominees,
  hideAvatars = false,
  className = ''
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  })

  useDndMonitor({
    onDragStart(event) {
      console.log('Drag started:', event.active.id, 'from column:', id)
    },
    onDragOver(event) {
      console.log('Drag over:', event.over?.id, 'from:', event.active.id)
    },
    onDragEnd(event) {
      console.log('Drag ended:', event.active.id, 'to:', event.over?.id)
    },
  })

  const style = {
    backgroundColor: isOver ? '#f3f4f6' : undefined,
    minHeight: '200px',
  }

  return (
    <div className={`p-3 border border-gray-200 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        {title}
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
          {nominees.length}
        </span>
      </h4>
      
      <div
        ref={setNodeRef}
        style={style}
        className="space-y-2 transition-colors duration-200"
      >
        <SortableContext 
          items={nominees.map(n => n.nominee_id)} 
          strategy={verticalListSortingStrategy}
        >
          {nominees.map((nominee) => (
            <NomineeCard
              key={nominee.nominee_id}
              nominee={nominee}
              hideAvatar={hideAvatars}
            />
          ))}
        </SortableContext>
        
        {nominees.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8 border-2 border-dashed border-gray-200 rounded-lg">
            Kéo ứng viên vào đây
          </div>
        )}
      </div>
    </div>
  )
}
