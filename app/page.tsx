"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Loader2 } from "lucide-react"
import { EventGrid } from "./EventGrid"
import { useEvents } from "@/src/hooks/useEvents"
import { useEventSelection } from "@/src/hooks/useEventSelection"
import { ERROR_MESSAGES, SUCCESS_MESSAGES, APP_CONFIG } from "@/src/lib/constants"

// Importar tipos centralizados
interface PokemonEvent {
  id: string
  title: string
  description: string
  date: string
  imageUrl?: string
  sourceUrl: string
}

type SortOrder = "asc" | "desc"

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
    selectedCount 
  } = useEventSelection(events.length)

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents()
  }, [])

  // Eventos ordenados
  const sortedEvents = sortEvents(events, sortOrder)

  // Función para sincronizar con Google Calendar (mejorada)
  const syncToGoogleCalendar = async () => {
    if (!hasSelection) {
      alert(ERROR_MESSAGES.NO_EVENTS_SELECTED)
      return
    }

    setSyncing(true)
    try {
      const response = await fetch("/api/sync-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: sortedEvents }),
      })

      if (response.ok) {
        setLastSync(new Date().toLocaleString("es-ES"))
        alert(SUCCESS_MESSAGES.EVENTS_SYNCED(selectedCount))
      }
    } catch (error) {
      console.error("Error syncing to calendar:", error)
      alert(ERROR_MESSAGES.CALENDAR_SYNC_FAILED)
    } finally {
      setSyncing(false)
    }
  }

  // Función para extraer eventos (mejorada)
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
          <div className="flex flex-wrap justify-center gap-4 mb-4 items-center">
            <Button onClick={handleFetchEvents} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extrayendo...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Extraer Eventos
                </>
              )}
            </Button>
            <Button onClick={syncToGoogleCalendar} disabled={syncing || !hasSelection} variant="outline">
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Sincronizar con Google Calendar ({selectedCount})
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
          {lastSync && <p className="text-sm text-gray-500 mt-2">Última sincronización: {lastSync}</p>}
        </div>
        {/* Lista de eventos */}
        <EventGrid
          events={sortedEvents}
          selectedEvents={selectedEvents}
          toggleSelectEvent={toggleSelectEvent}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
