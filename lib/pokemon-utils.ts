"use client"

import { useCallback } from "react"
import { useEffect } from "react"
import { useState } from "react"

// Utilidades para el proyecto Pokémon GO Calendar
// Este archivo demuestra conceptos de JavaScript de básico a avanzado

// ========== CONCEPTOS BÁSICOS ==========

// 1. Funciones básicas y manipulación de strings
export function formatEventTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// 2. Trabajo con fechas
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  return `${start.toLocaleDateString("es-ES", options)} - ${end.toLocaleDateString("es-ES", options)}`
}

// 3. Validación de datos
export function validateEvent(event: any): boolean {
  const requiredFields = ["title", "description", "startDate", "endDate"]
  return requiredFields.every((field) => event[field] && event[field].trim() !== "")
}

// ========== CONCEPTOS INTERMEDIOS ==========

// 4. Programación funcional - Filter, Map, Reduce
export function filterUpcomingEvents(events: any[]): any[] {
  const now = new Date()
  return events
    .filter((event) => new Date(event.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

// 5. Debouncing para optimizar búsquedas
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 6. Local Storage para persistencia
export const StorageManager = {
  save: (key: string, data: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  },

  load: (key: string, defaultValue: any): any => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error("Error loading from localStorage:", error)
      return defaultValue
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  },
}

// ========== CONCEPTOS AVANZADOS ==========

// 7. Custom Hook para manejo de estado complejo
export function useEventManager() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/scrape-pokemon")
      const data = await response.json()
      setEvents(data.events)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

// 8. Patrón Observer para notificaciones
export class EventNotifier {
  private observers: Array<(event: any) => void> = []

  subscribe(callback: (event: any) => void): () => void {
    this.observers.push(callback)

    // Retorna función para desuscribirse
    return () => {
      const index = this.observers.indexOf(callback)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  notify(event: any): void {
    this.observers.forEach((callback) => callback(event))
  }
}

// 9. Manejo avanzado de errores
export class PokemonAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error,
  ) {
    super(message)
    this.name = "PokemonAPIError"
  }
}

export async function safeApiCall<T>(apiCall: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      if (attempt === retries) {
        throw new PokemonAPIError(
          `API call failed after ${retries} attempts`,
          500,
          error instanceof Error ? error : new Error(String(error)),
        )
      }

      // Esperar antes del siguiente intento (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }

  throw new Error("Unexpected error in safeApiCall")
}

// 10. Generador para procesamiento de lotes
export function* batchProcessor<T>(items: T[], batchSize: number): Generator<T[], void, any> {
  for (let i = 0; i < items.length; i += batchSize) {
    yield items.slice(i, i + batchSize)
  }
}

// Ejemplo de uso del generador
export async function processBatchedEvents(events: any[], batchSize = 5): Promise<void> {
  const processor = batchProcessor(events, batchSize)

  for (const batch of processor) {
    console.log(
      `Procesando lote de ${batch.length} eventos:`,
      batch.map((e) => e.title),
    )

    // Simular procesamiento asíncrono
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}
