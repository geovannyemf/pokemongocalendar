// ========== CONCEPTOS BÁSICOS DE JAVASCRIPT ==========

/**
 * Utilidades básicas para el proyecto
 * Demuestra conceptos fundamentales de JavaScript
 */

// 1. Funciones básicas y manipulación de strings
function formatEventTitle(title) {
  if (!title || typeof title !== "string") {
    return "Sin título"
  }

  return title
    .trim()
    .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// 2. Trabajo con fechas - conceptos básicos
function formatDate(dateString) {
  try {
    const date = new Date(dateString)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return "Fecha no válida"
    }

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }

    return date.toLocaleDateString("es-ES", options)
  } catch (error) {
    console.error("Error formateando fecha:", error)
    return "Error en fecha"
  }
}

// 3. Formateo de rango de fechas
function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate)
  const end = formatDate(endDate)

  if (start === end) {
    return start
  }

  return `${start} - ${end}`
}

// 4. Validación de datos - conceptos de programación defensiva
function validateEvent(event) {
  const requiredFields = ["title", "description", "startDate", "endDate"]

  // Verificar que el evento sea un objeto
  if (!event || typeof event !== "object") {
    return false
  }

  // Verificar que todos los campos requeridos existan y no estén vacíos
  return requiredFields.every((field) => {
    return event[field] && typeof event[field] === "string" && event[field].trim() !== ""
  })
}

// 5. Función para generar IDs únicos
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 6. Función para limpiar HTML (seguridad básica)
function sanitizeHTML(str) {
  const div = document.createElement("div")
  div.textContent = str
  return div.innerHTML
}

// 7. Función para truncar texto
function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength).trim() + "..."
}

// ========== CONCEPTOS INTERMEDIOS ==========

// 8. Debouncing - optimización de rendimiento
function debounce(func, delay) {
  let timeoutId

  return function (...args) {
    // Limpiar el timeout anterior
    clearTimeout(timeoutId)

    // Establecer un nuevo timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 9. Throttling - control de frecuencia de ejecución
function throttle(func, limit) {
  let inThrottle

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 10. Programación funcional - filter, map, reduce
const EventUtils = {
  // Filtrar eventos próximos
  filterUpcomingEvents(events) {
    const now = new Date()
    return events
      .filter((event) => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  },

  // Agrupar eventos por mes
  groupEventsByMonth(events) {
    return events.reduce((groups, event) => {
      const date = new Date(event.startDate)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`

      if (!groups[monthKey]) {
        groups[monthKey] = []
      }

      groups[monthKey].push(event)
      return groups
    }, {})
  },

  // Buscar eventos por texto
  searchEvents(events, searchTerm) {
    const term = searchTerm.toLowerCase()
    return events.filter(
      (event) => event.title.toLowerCase().includes(term) || event.description.toLowerCase().includes(term),
    )
  },
}

// ========== CONCEPTOS AVANZADOS ==========

// 11. Patrón Observer - para notificaciones
class EventEmitter {
  constructor() {
    this.events = {}
  }

  // Suscribirse a un evento
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(callback)

    // Retornar función para desuscribirse
    return () => {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback)
    }
  }

  // Emitir un evento
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error en callback de evento ${eventName}:`, error)
        }
      })
    }
  }

  // Eliminar todos los listeners de un evento
  off(eventName) {
    delete this.events[eventName]
  }
}

// 12. Manejo avanzado de errores
class PokemonAPIError extends Error {
  constructor(message, statusCode = 500, originalError = null) {
    super(message)
    this.name = "PokemonAPIError"
    this.statusCode = statusCode
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    }
  }
}

// 13. Función para reintentos automáticos
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.warn(`Intento ${attempt} falló:`, error.message)

      if (attempt === maxRetries) {
        throw new PokemonAPIError(`Operación falló después de ${maxRetries} intentos`, 500, error)
      }

      // Esperar antes del siguiente intento (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }
}

// 14. Generador para procesamiento por lotes
function* batchProcessor(items, batchSize) {
  for (let i = 0; i < items.length; i += batchSize) {
    yield items.slice(i, i + batchSize)
  }
}

// 15. Función para procesar lotes de eventos
async function processBatchedEvents(events, batchSize = 5, processor) {
  const batches = batchProcessor(events, batchSize)
  const results = []

  for (const batch of batches) {
    console.log(`Procesando lote de ${batch.length} eventos`)

    try {
      const batchResults = await Promise.all(batch.map((event) => processor(event)))
      results.push(...batchResults)

      // Pequeña pausa entre lotes para no sobrecargar
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error("Error procesando lote:", error)
      throw error
    }
  }

  return results
}

// Exportar funciones para uso global
window.PokemonUtils = {
  formatEventTitle,
  formatDate,
  formatDateRange,
  validateEvent,
  generateUniqueId,
  sanitizeHTML,
  truncateText,
  debounce,
  throttle,
  EventUtils,
  EventEmitter,
  PokemonAPIError,
  retryOperation,
  batchProcessor,
  processBatchedEvents,
}
