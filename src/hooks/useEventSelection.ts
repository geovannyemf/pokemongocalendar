import { useState, useCallback } from 'react'

/**
 * Hook para gestionar la selección múltiple de eventos
 * Separación de responsabilidades: solo se encarga de la selección
 */
export function useEventSelection(totalEvents: number = 0) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const toggleSelectEvent = useCallback((eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }, [])

  const selectAll = useCallback(() => {
    if (totalEvents > 0) {
      setSelectedEvents(Array.from({ length: totalEvents }, (_, i) => i.toString()))
    }
  }, [totalEvents])

  const selectNone = useCallback(() => {
    setSelectedEvents([])
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedEvents.length === totalEvents && totalEvents > 0) {
      selectNone()
    } else {
      selectAll()
    }
  }, [selectedEvents.length, totalEvents, selectAll, selectNone])

  const isAllSelected = totalEvents > 0 && selectedEvents.length === totalEvents
  const hasSelection = selectedEvents.length > 0

  return {
    selectedEvents,
    toggleSelectEvent,
    toggleSelectAll,
    selectAll,
    selectNone,
    isAllSelected,
    hasSelection,
    selectedCount: selectedEvents.length,
    setSelectedEvents
  }
}
