import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { CheckboxCalendar } from "./components/CheckboxCalendar";
import { ExpandableTitle } from "./components/ExpandableTitle";
import { EventStatusBadge } from "@/src/components/ui/EventStatusBadge";

interface PokemonEvent {
  id: string
  title: string
  description: string
  date: string
  imageUrl?: string
  sourceUrl: string
}

interface Props {
  events: PokemonEvent[]
  selectedEvents: string[]
  toggleSelectEvent: (id: string) => void
  loading?: boolean
  error?: string | null
}

export function EventGrid({ events, selectedEvents, toggleSelectEvent, loading = false, error = null }: Props) {
  
  // Estado de carga
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

  // Estado de error
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

  // Estado vacío
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
      {events.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay eventos cargados. Haz clic en "Extraer Eventos" para comenzar.
          </p>
        </div>
      ) : (
        events.map((event, index) => {
          const isSelected = selectedEvents.includes(index.toString());
          return (
            <Card
              key={`event-${index}`}
              className={`relative flex flex-col h-full hover:shadow-lg transition-shadow ${isSelected ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => toggleSelectEvent(index.toString())}
            >
              <CardHeader className="relative pb-2 pt-8">
                {/* Badge de estado alineado con los márgenes del contenido */}
                <div className="absolute top-6 left-6 right-6 flex justify-end pointer-events-none">
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
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                <div className="flex justify-between items-end mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    onClick={e => e.stopPropagation()}
                  >
                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ver más
                    </a>
                  </Button>
                  <div onClick={e => e.stopPropagation()}>
                    <CheckboxCalendar
                      checked={isSelected}
                      onChange={() => toggleSelectEvent(index.toString())}
                      disabled={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}