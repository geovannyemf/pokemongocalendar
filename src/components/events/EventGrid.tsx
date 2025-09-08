import React from 'react'
import { PokemonEvent } from '@/src/types/event.types'
import { EventCard } from './EventCard'

interface EventGridProps {
  events: PokemonEvent[]
  selectedEvents: string[]
  onToggleSelectEvent: (id: string) => void
  loading?: boolean
  error?: string | null
}

/**
 * Componente grid para mostrar múltiples eventos
 * Responsabilidad: Layout y distribución de eventos
 */
export function EventGrid({ 
  events, 
  selectedEvents, 
  onToggleSelectEvent, 
  loading = false,
  error = null 
}: EventGridProps) {
  
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div 
            key={`skeleton-${index}`}
            className="animate-pulse"
          >
            <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 text-lg font-medium">Error al cargar eventos</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <p className="text-gray-500 text-lg">
            No hay eventos cargados. Haz clic en "Extraer Eventos" para comenzar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
      {events.map((event, index) => {
        const isSelected = selectedEvents.includes(index.toString())
        
        return (
          <EventCard
            key={`event-${index}`}
            event={event}
            index={index}
            isSelected={isSelected}
            onToggleSelect={onToggleSelectEvent}
          />
        )
      })}
    </div>
  )
}
