// ========== APLICACIÓN PRINCIPAL ==========

/**
 * Controlador principal de la aplicación
 * Demuestra arquitectura de aplicación, manejo de eventos y UI
 */

class PokemonGoCalendarApp {
  constructor() {
    this.events = []
    this.isLoading = false
    this.isSyncing = false

    // Referencias a elementos del DOM
    this.elements = {}

    // Configuración
    this.config = window.config

    // Servicios
    this.scraper = window.pokemonScraper
    this.calendar = window.googleCalendar

    // Event emitter para comunicación interna
    this.eventEmitter = new window.PokemonUtils.EventEmitter()

    // Inicializar cuando el DOM esté listo
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init())
    } else {
      this.init()
    }
  }

  // ========== INICIALIZACIÓN ==========

  init() {
    console.log("Inicializando aplicación...")

    // Obtener referencias a elementos del DOM
    this.initializeElements()

    // Configurar event listeners
    this.setupEventListeners()

    // Configurar servicios
    this.setupServices()

    // Cargar estado inicial
    this.loadInitialState()

    // Configurar auto-scraping si está habilitado
    this.setupAutoScraping()

    console.log("Aplicación inicializada correctamente")
  }

  // Obtener referencias a elementos del DOM
  initializeElements() {
    this.elements = {
      extractBtn: document.getElementById("extractBtn"),
      syncBtn: document.getElementById("syncBtn"),
      authBtn: document.getElementById("authBtn"),
      eventsContainer: document.getElementById("eventsContainer"),
      syncStatus: document.getElementById("syncStatus"),
      syncStatusText: document.getElementById("syncStatusText"),
      configModal: document.getElementById("configModal"),
      closeModal: document.getElementById("closeModal"),
    }

    // Verificar que todos los elementos existan
    Object.entries(this.elements).forEach(([key, element]) => {
      if (!element) {
        console.warn(`Elemento ${key} no encontrado en el DOM`)
      }
    })
  }

  // Configurar event listeners del DOM
  setupEventListeners() {
    // Botón extraer eventos
    this.elements.extractBtn?.addEventListener("click", () => {
      this.handleExtractEvents()
    })

    // Botón sincronizar
    this.elements.syncBtn?.addEventListener("click", () => {
      this.handleSyncEvents()
    })

    // Botón autenticación
    this.elements.authBtn?.addEventListener("click", () => {
      this.handleAuthentication()
    })

    // Modal de configuración
    this.elements.closeModal?.addEventListener("click", () => {
      this.hideModal()
    })

    // Cerrar modal al hacer clic fuera
    this.elements.configModal?.addEventListener("click", (e) => {
      if (e.target === this.elements.configModal) {
        this.hideModal()
      }
    })

    // Tecla ESC para cerrar modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.elements.configModal?.classList.contains("show")) {
        this.hideModal()
      }
    })

    // Solicitar permisos de notificación
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  // Configurar servicios y sus event listeners
  setupServices() {
    // Listeners del scraper
    this.scraper.eventEmitter.on("scrapingStarted", () => {
      this.setLoadingState(true)
    })

    this.scraper.eventEmitter.on("eventsLoaded", (data) => {
      this.handleEventsLoaded(data.events)
      this.setLoadingState(false)
    })

    this.scraper.eventEmitter.on("scrapingError", (error) => {
      this.handleError("Error extrayendo eventos", error)
      this.setLoadingState(false)
    })

    this.scraper.eventEmitter.on("newEventsFound", (events) => {
      this.showNotification(`Se encontraron ${events.length} eventos nuevos`)
    })

    // Listeners del calendario
    this.calendar.eventEmitter.on("authSuccess", () => {
      this.handleAuthSuccess()
    })

    this.calendar.eventEmitter.on("authError", (error) => {
      this.handleError("Error de autenticación", error)
    })

    this.calendar.eventEmitter.on("syncStarted", (data) => {
      this.setSyncingState(true)
      this.showNotification(`Iniciando sincronización de ${data.count} eventos`)
    })

    this.calendar.eventEmitter.on("syncCompleted", (results) => {
      this.handleSyncCompleted(results)
      this.setSyncingState(false)
    })

    this.calendar.eventEmitter.on("syncError", (error) => {
      this.handleError("Error de sincronización", error)
      this.setSyncingState(false)
    })
  }

  // Cargar estado inicial
  loadInitialState() {
    // Cargar eventos desde cache
    const cachedEvents = window.cache.loadWithTTL("scraped_events")
    if (cachedEvents && Array.isArray(cachedEvents)) {
      this.handleEventsLoaded(cachedEvents)
    }

    // Actualizar UI según estado de conexión
    this.updateConnectionStatus()

    // Mostrar última sincronización
    this.updateSyncStatus()
  }

  // Configurar scraping automático
  setupAutoScraping() {
    if (this.config.get("autoSync")) {
      const interval = this.config.get("syncInterval") || 60
      this.autoScrapingCancel = this.scraper.scheduleAutoScraping(interval)
      console.log(`Auto-scraping configurado cada ${interval} minutos`)
    }
  }

  // ========== MANEJADORES DE EVENTOS ==========

  // Manejar extracción de eventos
  async handleExtractEvents() {
    try {
      console.log("Iniciando extracción de eventos...")
      await this.scraper.scrapeEvents(false) // Forzar nueva extracción
    } catch (error) {
      this.handleError("Error extrayendo eventos", error)
    }
  }

  // Manejar sincronización de eventos
  async handleSyncEvents() {
    if (this.events.length === 0) {
      this.showNotification("No hay eventos para sincronizar", "warning")
      return
    }

    try {
      console.log("Iniciando sincronización...")
      await this.calendar.syncEvents(this.events)
    } catch (error) {
      this.handleError("Error sincronizando eventos", error)
    }
  }

  // Manejar autenticación
  async handleAuthentication() {
    try {
      if (this.calendar.isConnected) {
        // Si ya está conectado, desconectar
        this.calendar.signOut()
        this.updateConnectionStatus()
      } else {
        // Si no está conectado, mostrar modal de configuración
        this.showModal()
      }
    } catch (error) {
      this.handleError("Error de autenticación", error)
    }
  }

  // Manejar eventos cargados
  handleEventsLoaded(events) {
    this.events = events
    this.renderEvents()
    this.updateUI()

    console.log(`${events.length} eventos cargados`)
    this.showNotification(`${events.length} eventos cargados correctamente`)
  }

  // Manejar autenticación exitosa
  handleAuthSuccess() {
    this.updateConnectionStatus()
    this.showNotification("Conectado con Google Calendar correctamente")
    this.hideModal()
  }

  // Manejar sincronización completada
  handleSyncCompleted(results) {
    const { success, failed, total } = results

    this.updateSyncStatus()

    if (failed.length === 0) {
      this.showNotification(`${success.length} eventos sincronizados correctamente`)
    } else {
      this.showNotification(`${success.length} eventos sincronizados, ${failed.length} fallaron`, "warning")
    }

    console.log("Sincronización completada:", results)
  }

  // Manejar errores
  handleError(message, error) {
    console.error(message, error)

    const errorMessage = error instanceof window.PokemonUtils.PokemonAPIError ? error.message : "Error desconocido"

    this.showNotification(`${message}: ${errorMessage}`, "error")
  }

  // ========== ACTUALIZACIÓN DE UI ==========

  // Renderizar eventos en el DOM
  renderEvents() {
    if (!this.elements.eventsContainer) return

    if (this.events.length === 0) {
      this.elements.eventsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No hay eventos cargados</p>
                    <p class="empty-subtitle">Haz clic en "Extraer Eventos" para comenzar</p>
                </div>
            `
      return
    }

    const eventsHTML = this.events.map((event) => this.createEventCard(event)).join("")
    this.elements.eventsContainer.innerHTML = eventsHTML

    // Agregar animación
    this.elements.eventsContainer.classList.add("fade-in")
  }

  // Crear tarjeta de evento
  createEventCard(event) {
    const formattedDate = window.PokemonUtils.formatDateRange(event.startDate, event.endDate)
    const truncatedDescription = window.PokemonUtils.truncateText(event.description, 150)
    const sanitizedTitle = window.PokemonUtils.sanitizeHTML(event.title)

    return `
            <div class="event-card slide-in">
                <div class="event-title">${sanitizedTitle}</div>
                <div class="event-date">
                    <i class="fas fa-calendar"></i>
                    ${formattedDate}
                </div>
                <div class="event-description">${truncatedDescription}</div>
                <div class="event-actions">
                    <span class="event-badge">${event.category || "Evento"}</span>
                    <a href="${event.sourceUrl}" target="_blank" class="event-link">
                        Ver más <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `
  }

  // Actualizar estado de carga
  setLoadingState(loading) {
    this.isLoading = loading

    if (!this.elements.extractBtn) return

    const btnText = this.elements.extractBtn.querySelector(".btn-text")
    const spinner = this.elements.extractBtn.querySelector(".loading-spinner")

    if (loading) {
      btnText.textContent = "Extrayendo..."
      spinner.style.display = "block"
      this.elements.extractBtn.disabled = true
    } else {
      btnText.textContent = "Extraer Eventos"
      spinner.style.display = "none"
      this.elements.extractBtn.disabled = false
    }
  }

  // Actualizar estado de sincronización
  setSyncingState(syncing) {
    this.isSyncing = syncing

    if (!this.elements.syncBtn) return

    const btnText = this.elements.syncBtn.querySelector(".btn-text")
    const spinner = this.elements.syncBtn.querySelector(".loading-spinner")

    if (syncing) {
      btnText.textContent = "Sincronizando..."
      spinner.style.display = "block"
      this.elements.syncBtn.disabled = true
    } else {
      btnText.textContent = "Sincronizar con Google Calendar"
      spinner.style.display = "none"
      this.elements.syncBtn.disabled = this.events.length === 0
    }
  }

  // Actualizar UI general
  updateUI() {
    // Habilitar/deshabilitar botón de sincronización
    if (this.elements.syncBtn) {
      this.elements.syncBtn.disabled = this.events.length === 0 || !this.calendar.isConnected
    }
  }

  // Actualizar estado de conexión
  updateConnectionStatus() {
    if (!this.elements.authBtn) return

    const isConnected = this.config.get("googleConnected")
    const btnText = this.elements.authBtn.querySelector(".btn-text") || this.elements.authBtn

    if (isConnected) {
      btnText.textContent = "Desconectar de Google"
      this.elements.authBtn.classList.remove("btn-outline")
      this.elements.authBtn.classList.add("btn-secondary")
    } else {
      btnText.textContent = "Conectar con Google"
      this.elements.authBtn.classList.remove("btn-secondary")
      this.elements.authBtn.classList.add("btn-outline")
    }

    this.updateUI()
  }

  // Actualizar estado de sincronización
  updateSyncStatus() {
    const lastSync = this.config.get("lastSync")

    if (lastSync && this.elements.syncStatus && this.elements.syncStatusText) {
      const date = new Date(lastSync)
      this.elements.syncStatusText.textContent = `Última sincronización: ${date.toLocaleString("es-ES")}`
      this.elements.syncStatus.style.display = "flex"
    }
  }

  // ========== MODAL Y NOTIFICACIONES ==========

  // Mostrar modal
  showModal() {
    if (this.elements.configModal) {
      this.elements.configModal.classList.add("show")
    }
  }

  // Ocultar modal
  hideModal() {
    if (this.elements.configModal) {
      this.elements.configModal.classList.remove("show")
    }
  }

  // Mostrar notificación
  showNotification(message, type = "info") {
    console.log(`[${type.toUpperCase()}] ${message}`)

    // Crear elemento de notificación
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `

    // Estilos inline para la notificación
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: this.getNotificationColor(type),
      color: "white",
      padding: "12px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: "10000",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      maxWidth: "400px",
      animation: "slideIn 0.3s ease-out",
    })

    document.body.appendChild(notification)

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.style.animation = "fadeOut 0.3s ease-out"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 5000)
  }

  // Obtener icono de notificación
  getNotificationIcon(type) {
    const icons = {
      info: "info-circle",
      success: "check-circle",
      warning: "exclamation-triangle",
      error: "times-circle",
    }
    return icons[type] || icons.info
  }

  // Obtener color de notificación
  getNotificationColor(type) {
    const colors = {
      info: "#3b82f6",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
    }
    return colors[type] || colors.info
  }

  // ========== MÉTODOS PÚBLICOS ==========

  // Obtener estadísticas de la aplicación
  getAppStats() {
    return {
      eventsLoaded: this.events.length,
      isConnected: this.calendar.isConnected,
      lastSync: this.config.get("lastSync"),
      scrapingStats: this.scraper.getScrapingStats(),
      storageInfo: window.storage.getStorageInfo(),
    }
  }

  // Limpiar todos los datos
  clearAllData() {
    this.events = []
    this.scraper.clearAllData()
    this.config.reset()
    this.renderEvents()
    this.updateUI()
    this.showNotification("Todos los datos han sido limpiados")
  }

  // Exportar eventos como JSON
  exportEvents() {
    if (this.events.length === 0) {
      this.showNotification("No hay eventos para exportar", "warning")
      return
    }

    const dataStr = JSON.stringify(this.events, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `pokemon-go-events-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    this.showNotification("Eventos exportados correctamente")
  }
}

// ========== INICIALIZACIÓN GLOBAL ==========

// Crear instancia global de la aplicación
window.pokemonApp = new PokemonGoCalendarApp()

// Funciones globales para debugging
window.debugApp = {
  getStats: () => window.pokemonApp.getAppStats(),
  clearData: () => window.pokemonApp.clearAllData(),
  exportEvents: () => window.pokemonApp.exportEvents(),
  showNotification: (msg, type) => window.pokemonApp.showNotification(msg, type),
}

// Mostrar mensaje de bienvenida
console.log(`
🎮 Pokémon GO Calendar Sync
📚 Aplicación educativa de JavaScript
🚀 Versión: 1.0.0

Comandos disponibles:
- debugApp.getStats() - Ver estadísticas
- debugApp.clearData() - Limpiar datos
- debugApp.exportEvents() - Exportar eventos
- debugApp.showNotification(msg, type) - Mostrar notificación

¡Disfruta aprendiendo JavaScript!
`)
