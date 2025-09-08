import { PokemonEvent, ScrapingResponse, CalendarSyncResponse } from '@/src/types/event.types'

/**
 * Servicio para operaciones relacionadas con eventos
 * Centraliza todas las llamadas a APIs relacionadas con eventos
 */
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
      
      if (!data.success) {
        throw new Error(data.error || 'Error al obtener eventos')
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
      
      if (!data.success) {
        throw new Error(data.error || 'Error al sincronizar con calendario')
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

  /**
   * Generar ID único para un evento basado en su contenido
   */
  static generateEventId(event: Omit<PokemonEvent, 'id'>): string {
    const content = `${event.title}-${event.date}-${event.sourceUrl}`
    return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
  }

  /**
   * Normalizar eventos asegurando que tengan ID único
   */
  static normalizeEvents(events: any[]): PokemonEvent[] {
    return this.filterValidEvents(events).map(event => ({
      ...event,
      id: event.id || this.generateEventId(event)
    }))
  }
}
