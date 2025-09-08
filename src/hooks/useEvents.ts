import { useState, useCallback } from 'react'

interface PokemonEvent {
  id: string
  title: string
  description: string
  date: string
  imageUrl?: string
  sourceUrl: string
}

type SortOrder = "asc" | "desc"

/**
 * Hook personalizado para gestionar el estado de eventos de Pokémon GO
 * Centraliza toda la lógica de estado relacionada con eventos
 */
export function useEvents() {
  const [events, setEvents] = useState<PokemonEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/scrape-pokemon")
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar eventos')
      }
      
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [])

  const sortEvents = useCallback((events: PokemonEvent[], order: SortOrder) => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return order === "asc" ? dateA - dateB : dateB - dateA
    })
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { 
    events, 
    loading, 
    error, 
    fetchEvents, 
    sortEvents, 
    clearError 
  }
}
