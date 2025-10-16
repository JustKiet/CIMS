import React from 'react'
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { DroppableColumn } from './DroppableColumn'
import { NomineeCard } from './NomineeCard'
import type { NomineeResponse } from '@/lib/api'

interface NomineeManagementProps {
  availableNominees: NomineeResponse[]
  acceptedNominees: NomineeResponse[]
  rejectedNominees: NomineeResponse[]
  interviewNominees: NomineeResponse[]
  hiredNominees: NomineeResponse[]
  draggedNominee: NomineeResponse | null
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

export const NomineeManagement: React.FC<NomineeManagementProps> = ({
  availableNominees,
  acceptedNominees,
  rejectedNominees,
  interviewNominees,
  hiredNominees,
  draggedNominee,
  onDragStart,
  onDragEnd
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  return (
    <div className="p-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý ứng viên</h3>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <DroppableColumn
            id="available"
            title="Ứng viên có sẵn"
            nominees={availableNominees}
          />
          
          <DroppableColumn
            id="accepted"
            title="Được chấp nhận"
            nominees={acceptedNominees}
          />
          
          <DroppableColumn
            id="interview"
            title="Phỏng vấn"
            nominees={interviewNominees}
          />
          
          <DroppableColumn
            id="hired"
            title="Đã tuyển"
            nominees={hiredNominees}
          />
          
          <DroppableColumn
            id="rejected"
            title="Từ chối"
            nominees={rejectedNominees}
          />
        </div>

        <DragOverlay>
          {draggedNominee && (
            <NomineeCard nominee={draggedNominee} />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
