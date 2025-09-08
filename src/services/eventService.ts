/**
 * Servicio centralizado para operaciones relacionadas con eventos
 * Separa la lógica de API del componente UI
 */

interface PokemonEvent {
  id: string
  title: string
  description: string
  date: string
  imageUrl?: string
  sourceUrl: string
}

interface ScrapingResponse {
  success: boolean
  events: PokemonEvent[]
  message?: string
  error?: string
}

interface CalendarSyncResponse {
  success: boolean
  syncedCount: number
  message?: string
  error?: string
}

export class EventService {
  
  /**
   * Obtener eventos desde el scraping de Pokémon GO
   */
  static async fetchEvents(): Promise<PokemonEvent[]> {
    try {
      const response = await fetch('/api/scrape-pokemon', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ScrapingResponse = await response.json()
      
      if (!data.success && data.error) {
        throw new Error(data.error)
      }

      return data.events || []
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  }

  /**
   * Sincronizar eventos seleccionados con Google Calendar
   */
  static async syncToCalendar(events: PokemonEvent[]): Promise<CalendarSyncResponse> {
    try {
      const response = await fetch('/api/sync-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CalendarSyncResponse = await response.json()
      
      if (!data.success && data.error) {
        throw new Error(data.error)
      }

      return data
    } catch (error) {
      console.error('Error syncing to calendar:', error)
      throw error
    }
  }

  /**
   * Validar un evento antes de procesarlo
   */
  static validateEvent(event: any): event is PokemonEvent {
    return (
      event &&
      typeof event.id === 'string' &&
      typeof event.title === 'string' &&
      typeof event.description === 'string' &&
      typeof event.date === 'string' &&
      typeof event.sourceUrl === 'string' &&
      event.title.trim().length > 0 &&
      event.sourceUrl.trim().length > 0
    )
  }

  /**
   * Filtrar eventos válidos
   */
  static filterValidEvents(events: any[]): PokemonEvent[] {
    return events.filter(this.validateEvent)
  }
}
