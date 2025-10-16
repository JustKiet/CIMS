import React from 'react'
import { Button } from '@/components/ui/Button'

interface ProjectModalHeaderProps {
  title: string
  onClose: () => void
}

export const ProjectModalHeader: React.FC<ProjectModalHeaderProps> = ({
  title,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        ✕
      </Button>
    </div>
  )
}
