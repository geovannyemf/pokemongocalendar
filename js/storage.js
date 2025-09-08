// ========== ALMACENAMIENTO LOCAL - CONCEPTOS BÁSICOS A AVANZADOS ==========

/**
 * Manejo de Local Storage con JavaScript
 * Demuestra persistencia de datos en el navegador
 */

// Clase para manejo de almacenamiento local
class StorageManager {
  constructor(prefix = "pokemon_go_") {
    this.prefix = prefix
    this.isSupported = this.checkSupport()
  }

  // Verificar si localStorage está disponible
  checkSupport() {
    try {
      const test = "__storage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      console.warn("localStorage no está disponible:", error)
      return false
    }
  }

  // Generar clave con prefijo
  getKey(key) {
    return `${this.prefix}${key}`
  }

  // Guardar datos (básico)
  save(key, data) {
    if (!this.isSupported) {
      console.warn("localStorage no disponible, usando memoria temporal")
      return false
    }

    try {
      const serializedData = JSON.stringify({
        data: data,
        timestamp: Date.now(),
        version: "1.0",
      })

      localStorage.setItem(this.getKey(key), serializedData)
      return true
    } catch (error) {
      console.error("Error guardando en localStorage:", error)
      return false
    }
  }

  // Cargar datos (básico)
  load(key, defaultValue = null) {
    if (!this.isSupported) {
      return defaultValue
    }

    try {
      const item = localStorage.getItem(this.getKey(key))

      if (!item) {
        return defaultValue
      }

      const parsed = JSON.parse(item)

      // Verificar estructura de datos
      if (parsed && typeof parsed === "object" && "data" in parsed) {
        return parsed.data
      }

      // Compatibilidad con datos antiguos
      return parsed || defaultValue
    } catch (error) {
      console.error("Error cargando de localStorage:", error)
      return defaultValue
    }
  }

  // Eliminar datos
  remove(key) {
    if (!this.isSupported) {
      return false
    }

    try {
      localStorage.removeItem(this.getKey(key))
      return true
    } catch (error) {
      console.error("Error eliminando de localStorage:", error)
      return false
    }
  }

  // Limpiar todos los datos del prefijo
  clear() {
    if (!this.isSupported) {
      return false
    }

    try {
      const keysToRemove = []

      // Encontrar todas las claves con nuestro prefijo
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key)
        }
      }

      // Eliminar las claves encontradas
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      return true
    } catch (error) {
      console.error("Error limpiando localStorage:", error)
      return false
    }
  }

  // Obtener información de almacenamiento
  getStorageInfo() {
    if (!this.isSupported) {
      return { supported: false }
    }

    try {
      const keys = []
      let totalSize = 0

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key)
          keys.push(key)
          totalSize += key.length + (value ? value.length : 0)
        }
      }

      return {
        supported: true,
        keys: keys.length,
        totalSize: totalSize,
        formattedSize: this.formatBytes(totalSize),
      }
    } catch (error) {
      console.error("Error obteniendo info de almacenamiento:", error)
      return { supported: true, error: error.message }
    }
  }

  // Formatear bytes a formato legible
  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}

// ========== CACHE AVANZADO CON EXPIRACIÓN ==========

class CacheManager extends StorageManager {
  constructor(prefix = "pokemon_cache_") {
    super(prefix)
    this.defaultTTL = 60 * 60 * 1000 // 1 hora por defecto
  }

  // Guardar con tiempo de vida (TTL)
  saveWithTTL(key, data, ttl = this.defaultTTL) {
    const cacheData = {
      data: data,
      timestamp: Date.now(),
      ttl: ttl,
      expires: Date.now() + ttl,
    }

    return this.save(key, cacheData)
  }

  // Cargar verificando expiración
  loadWithTTL(key, defaultValue = null) {
    const cached = this.load(key)

    if (!cached || typeof cached !== "object") {
      return defaultValue
    }

    // Verificar si ha expirado
    if (cached.expires && Date.now() > cached.expires) {
      this.remove(key)
      return defaultValue
    }

    return cached.data || defaultValue
  }

  // Limpiar elementos expirados
  cleanExpired() {
    if (!this.isSupported) {
      return 0
    }

    let cleaned = 0
    const now = Date.now()

    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)

        if (key && key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key)

          try {
            const parsed = JSON.parse(item)

            if (parsed && parsed.expires && now > parsed.expires) {
              localStorage.removeItem(key)
              cleaned++
            }
          } catch (error) {
            // Si no se puede parsear, eliminar
            localStorage.removeItem(key)
            cleaned++
          }
        }
      }
    } catch (error) {
      console.error("Error limpiando cache expirado:", error)
    }

    return cleaned
  }
}

// ========== CONFIGURACIÓN PERSISTENTE ==========

class ConfigManager extends StorageManager {
  constructor() {
    super("pokemon_config_")
    this.defaultConfig = {
      theme: "light",
      language: "es",
      autoSync: false,
      syncInterval: 60, // minutos
      notifications: true,
      googleConnected: false,
      lastSync: null,
    }
  }

  // Obtener configuración completa
  getConfig() {
    const saved = this.load("settings", {})
    return { ...this.defaultConfig, ...saved }
  }

  // Actualizar configuración
  updateConfig(updates) {
    const current = this.getConfig()
    const updated = { ...current, ...updates }

    return this.save("settings", updated)
  }

  // Obtener valor específico
  get(key) {
    const config = this.getConfig()
    return config[key]
  }

  // Establecer valor específico
  set(key, value) {
    return this.updateConfig({ [key]: value })
  }

  // Resetear a configuración por defecto
  reset() {
    return this.save("settings", this.defaultConfig)
  }
}

// ========== HISTORIAL DE EVENTOS ==========

class EventHistoryManager extends StorageManager {
  constructor() {
    super("pokemon_history_")
    this.maxHistorySize = 100
  }

  // Agregar evento al historial
  addToHistory(event) {
    const history = this.getHistory()

    // Evitar duplicados
    const exists = history.find((item) => item.id === event.id)
    if (exists) {
      return false
    }

    // Agregar timestamp
    const historyItem = {
      ...event,
      addedAt: Date.now(),
    }

    history.unshift(historyItem)

    // Mantener tamaño máximo
    if (history.length > this.maxHistorySize) {
      history.splice(this.maxHistorySize)
    }

    return this.save("events", history)
  }

  // Obtener historial
  getHistory() {
    return this.load("events", [])
  }

  // Limpiar historial
  clearHistory() {
    return this.save("events", [])
  }

  // Obtener estadísticas
  getStats() {
    const history = this.getHistory()

    return {
      totalEvents: history.length,
      oldestEvent: history.length > 0 ? history[history.length - 1].addedAt : null,
      newestEvent: history.length > 0 ? history[0].addedAt : null,
      eventsByMonth: this.groupByMonth(history),
    }
  }

  // Agrupar por mes
  groupByMonth(events) {
    return events.reduce((groups, event) => {
      const date = new Date(event.addedAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      groups[monthKey] = (groups[monthKey] || 0) + 1
      return groups
    }, {})
  }
}

// Crear instancias globales
window.storage = new StorageManager()
window.cache = new CacheManager()
window.config = new ConfigManager()
window.eventHistory = new EventHistoryManager()

// Limpiar cache expirado al cargar
window.addEventListener("load", () => {
  const cleaned = window.cache.cleanExpired()
  if (cleaned > 0) {
    console.log(`Limpiados ${cleaned} elementos de cache expirados`)
  }
})
