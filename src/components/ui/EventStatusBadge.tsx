import React from 'react'
import { getEventStatus, getEventStatusInfo, EventStatus } from '@/src/lib/eventUtils'

interface EventStatusBadgeProps {
  eventDate: string
  className?: string
}

/**
 * Componente que muestra el estado del evento (Pasado, Activo, Próximo)
 * Se posiciona en la esquina superior derecha del card
 */
export function EventStatusBadge({ eventDate, className = '' }: EventStatusBadgeProps) {
  const status = getEventStatus(eventDate)
  const statusInfo = getEventStatusInfo(status)

  return (
    <div 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
        shadow-lg backdrop-blur-sm pointer-events-auto
        ${statusInfo.bgColor} ${statusInfo.color}
        ${className}
      `}
    >
      <span className="text-sm">{statusInfo.icon}</span>
      <span className="whitespace-nowrap">{statusInfo.label}</span>
    </div>
  )
}
