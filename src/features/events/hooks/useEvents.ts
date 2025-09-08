import { useState, useCallback } from 'react'
import { PokemonEvent, EventState, SortOptions } from '@/src/types/event.types'

/**
 * Hook personalizado para gestionar el estado de eventos de Pokémon GO
 * Centraliza toda la lógica de estado relacionada con eventos
 */
export function useEvents() {
  const [state, setState] = useState<EventState>({
    events: [],
    selectedEvents: [],
    loading: false,
    error: null
  })

  // Cargar eventos desde la API
  const fetchEvents = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/scrape-pokemon')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar eventos')
      }

      setState(prev => ({
        ...prev,
        events: data.events || [],
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }))
    }
  }, [])

  // Ordenar eventos
  const sortEvents = useCallback((events: PokemonEvent[], options: SortOptions) => {
    return [...events].sort((a, b) => {
      let comparison = 0
      
      switch (options.field) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        default:
          comparison = 0
      }
      
      return options.order === 'desc' ? -comparison : comparison
    })
  }, [])

  // Filtrar eventos
  const filterEvents = useCallback((events: PokemonEvent[], searchTerm: string) => {
    if (!searchTerm.trim()) return events
    
    return events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [])

  return {
    ...state,
    fetchEvents,
    sortEvents,
    filterEvents,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}
