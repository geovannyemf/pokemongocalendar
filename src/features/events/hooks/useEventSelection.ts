import { useState, useCallback } from 'react'

/**
 * Hook para gestionar la selección múltiple de eventos
 * Separación de responsabilidades: solo se encarga de la selección
 */
export function useEventSelection(totalEvents: number = 0) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  // Seleccionar/deseleccionar un evento individual
  const toggleSelectEvent = useCallback((eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }, [])

  // Seleccionar todos los eventos
  const selectAll = useCallback(() => {
    if (totalEvents > 0) {
      setSelectedEvents(Array.from({ length: totalEvents }, (_, i) => i.toString()))
    }
  }, [totalEvents])

  // Deseleccionar todos los eventos
  const selectNone = useCallback(() => {
    setSelectedEvents([])
  }, [])

  // Toggle entre seleccionar todo y deseleccionar todo
  const toggleSelectAll = useCallback(() => {
    if (selectedEvents.length === totalEvents && totalEvents > 0) {
      selectNone()
    } else {
      selectAll()
    }
  }, [selectedEvents.length, totalEvents, selectAll, selectNone])

  // Verificar si todos están seleccionados
  const isAllSelected = totalEvents > 0 && selectedEvents.length === totalEvents

  // Verificar si hay alguno seleccionado
  const hasSelection = selectedEvents.length > 0

  // Obtener eventos seleccionados como índices
  const getSelectedIndices = useCallback(() => {
    return selectedEvents.map(id => parseInt(id)).filter(index => !isNaN(index))
  }, [selectedEvents])

  return {
    selectedEvents,
    toggleSelectEvent,
    toggleSelectAll,
    selectAll,
    selectNone,
    isAllSelected,
    hasSelection,
    selectedCount: selectedEvents.length,
    getSelectedIndices,
    setSelectedEvents
  }
}
