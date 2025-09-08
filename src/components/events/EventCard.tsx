
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { PokemonEvent } from '@/src/types/event.types'
import { CheckboxCalendar } from "@/app/components/CheckboxCalendar"
import { ExpandableTitle } from "@/app/components/ExpandableTitle"
import { EventStatusBadge } from "@/src/components/ui/EventStatusBadge"

interface EventCardProps {
  event: PokemonEvent
  index: number
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

/**
 * Componente individual para mostrar un evento de Pokémon GO
 * Responsabilidad única: renderizar un evento con sus controles
 */
export function EventCard({ event, index, isSelected, onToggleSelect }: EventCardProps) {
  const handleCardClick = () => {
    onToggleSelect(index.toString())
  }

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Card
      className={`relative flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="relative pb-2 pt-12">
        {/* Badge de estado alineado con los márgenes del contenido */}
        <div className="absolute top-4 left-6 right-6 flex justify-end pointer-events-none">
          <EventStatusBadge eventDate={event.date} />
        </div>
        
        <ExpandableTitle title={event.title} />
        
        {event.imageUrl && (
          <div className="my-2 flex justify-center">
            <Image
              src={event.imageUrl}
              alt={event.title}
              width={320}
              height={180}
              className="rounded-md object-cover w-full h-auto"
              onError={(e) => {
                // Ocultar imagen si falla la carga
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        
        <CardDescription>
          <span className="inline-block bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            {new Date(event.date).toLocaleDateString("es-ES")}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <div className="flex justify-between items-end mt-auto">
          <Button
            variant="outline"
            size="sm"
            asChild
            onClick={handleStopPropagation}
          >
            <a 
              href={event.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Ver más
            </a>
          </Button>
          
          <div onClick={handleStopPropagation}>
            <CheckboxCalendar
              checked={isSelected}
              onChange={() => onToggleSelect(index.toString())}
              disabled={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
