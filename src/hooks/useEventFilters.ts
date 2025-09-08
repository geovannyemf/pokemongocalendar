import { useMemo } from 'react'
import { PokemonEvent } from '@/src/types/event.types'
import { getEventStatus, EventStatus } from '@/src/lib/eventUtils'

/**
 * Hook para filtrar eventos por estado
 */
export function useEventFilters(events: PokemonEvent[]) {
  
  const eventsByStatus = useMemo(() => {
    const past: PokemonEvent[] = []
    const active: PokemonEvent[] = []
    const upcoming: PokemonEvent[] = []
    
    events.forEach(event => {
      const status = getEventStatus(event.date)
      switch (status) {
        case 'past':
          past.push(event)
          break
        case 'active':
          active.push(event)
          break
        case 'upcoming':
          upcoming.push(event)
          break
      }
    })
    
    return { past, active, upcoming }
  }, [events])

  const filterByStatus = (status: EventStatus | 'all') => {
    if (status === 'all') return events
    return eventsByStatus[status]
  }

  const getStatusCounts = () => ({
    past: eventsByStatus.past.length,
    active: eventsByStatus.active.length,
    upcoming: eventsByStatus.upcoming.length,
    total: events.length
  })

  return {
    eventsByStatus,
    filterByStatus,
    getStatusCounts
  }
}
