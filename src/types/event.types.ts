// Tipos centralizados para eventos de Pokémon GO

export interface PokemonEvent {
  id: string
  title: string
  description: string
  date: string
  imageUrl?: string
  sourceUrl: string
}

export interface EventState {
  events: PokemonEvent[]
  selectedEvents: string[]
  loading: boolean
  error: string | null
}

export interface EventFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  searchTerm?: string
  eventTypes?: string[]
}

export type SortOrder = "asc" | "desc"
export type SortField = "date" | "title" | "relevance"

export interface SortOptions {
  field: SortField
  order: SortOrder
}

// Estados de sincronización
export interface SyncState {
  syncing: boolean
  lastSync: Date | null
  error: string | null
}

// Tipos para API responses
export interface ScrapingResponse {
  success: boolean
  events: PokemonEvent[]
  message?: string
  error?: string
}

export interface CalendarSyncResponse {
  success: boolean
  syncedCount: number
  message?: string
  error?: string
}
