/**
 * Constantes globales de la aplicación
 */

// URLs de la aplicación
export const APP_CONFIG = {
  POKEMON_GO_NEWS_URL: 'https://pokemongo.com/es/news',
  APP_NAME: 'Pokémon GO Calendar Sync',
  APP_DESCRIPTION: 'Extrae automáticamente eventos de Pokémon GO y guárdalos en tu Google Calendar'
} as const

// Configuración de scraping
export const SCRAPING_CONFIG = {
  TIMEOUT: 60000,
  MAX_RETRIES: 3,
  RATE_LIMIT_DELAY: 1000
} as const

// Configuración de UI
export const UI_CONFIG = {
  MAX_EVENTS_PER_PAGE: 50,
  DEFAULT_SORT_ORDER: 'asc' as const,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500
} as const

// Mensajes de error estándar
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  SCRAPING_FAILED: 'No se pudieron extraer los eventos. Intenta nuevamente.',
  CALENDAR_SYNC_FAILED: 'Error al sincronizar con Google Calendar.',
  INVALID_EVENT_DATA: 'Los datos del evento no son válidos.',
  NO_EVENTS_SELECTED: 'Selecciona al menos un evento para sincronizar',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.'
} as const

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  EVENTS_SYNCED: (count: number) => `¡${count} eventos sincronizados con Google Calendar!`,
  EVENTS_LOADED: (count: number) => `${count} eventos cargados exitosamente`
} as const

// Configuración de fechas
export const DATE_CONFIG = {
  LOCALE: 'es-ES',
  TIMEZONE: 'Europe/Madrid',
  DATE_FORMAT: {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const
  },
  DATETIME_FORMAT: {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const
  }
} as const

// Validaciones
export const VALIDATION_RULES = {
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  REQUIRED_FIELDS: ['title', 'description', 'date', 'sourceUrl']
} as const
