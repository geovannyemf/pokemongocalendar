"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Loader2 } from "lucide-react"
import { useEvents } from "@/src/features/events/hooks/useEvents"
import { useEventSelection } from "@/src/features/events/hooks/useEventSelection"
import { EventService } from "@/src/features/events/services/eventService"
import { EventGrid } from "@/src/components/events/EventGrid"
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner"
import { SortOrder } from "@/src/types/event.types"
import { APP_CONFIG, ERROR_MESSAGES } from "@/src/lib/constants"

/**
 * Página principal refactorizada con separación de responsabilidades
 * Solo se encarga de coordinar los diferentes hooks y componentes
 */
export default function PokemonGoCalendar() {
  // Estados locales específicos de la página
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  // Hooks personalizados para manejo de eventos
  const { events, loading, error, fetchEvents, sortEvents, clearError } = useEvents()
  const { 
    selectedEvents, 
    toggleSelectEvent, 
    toggleSelectAll,
    isAllSelected,
    hasSelection,
    selectedCount,
    getSelectedIndices
  } = useEventSelection(events.length)

  // Cargar eventos al montar
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Eventos ordenados
  const sortedEvents = sortEvents(events, { field: 'date', order: sortOrder })

  // Función para sincronizar con Google Calendar
  const handleSyncToCalendar = async () => {
    if (!hasSelection) {
      alert('Selecciona al menos un evento para sincronizar')
      return
    }

    setSyncing(true)
    try {
      const selectedIndices = getSelectedIndices()
      const eventsToSync = selectedIndices.map(index => events[index]).filter(Boolean)
      
      await EventService.syncToCalendar(eventsToSync)
      
      setLastSync(new Date().toLocaleString("es-ES"))
      alert(`¡${eventsToSync.length} eventos sincronizados con Google Calendar!`)
    } catch (error) {
      console.error('Error syncing to calendar:', error)
      alert(ERROR_MESSAGES.CALENDAR_SYNC_FAILED)
    } finally {
      setSyncing(false)
    }
  }

  // Función para extraer eventos
  const handleFetchEvents = async () => {
    clearError()
    await fetchEvents()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {APP_CONFIG.APP_NAME}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {APP_CONFIG.APP_DESCRIPTION}
          </p>
          
          {/* Controles principales */}
          <div className="flex flex-wrap justify-center gap-4 mb-4 items-center">
            <Button 
              onClick={handleFetchEvents} 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Extrayendo..." />
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Extraer Eventos
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleSyncToCalendar} 
              disabled={syncing || !hasSelection} 
              variant="outline"
            >
              {syncing ? (
                <LoadingSpinner size="sm" text="Sincronizando..." />
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Sincronizar ({selectedCount})
                </>
              )}
            </Button>
            
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-5 h-5 accent-blue-600 mr-2"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                disabled={events.length === 0}
              />
              Seleccionar todo
            </label>
            
            <select
              className="ml-2 px-2 py-1 rounded border border-gray-300 text-sm"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as SortOrder)}
            >
              <option value="asc">Fecha ascendente</option>
              <option value="desc">Fecha descendente</option>
            </select>
          </div>
          
          {lastSync && (
            <p className="text-sm text-gray-500 mt-2">
              Última sincronización: {lastSync}
            </p>
          )}
        </div>
        
        {/* Grid de eventos */}
        <EventGrid
          events={sortedEvents}
          selectedEvents={selectedEvents}
          onToggleSelectEvent={toggleSelectEvent}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
