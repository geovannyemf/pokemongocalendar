// ========== INTEGRACIÓN CON GOOGLE CALENDAR ==========

/**
 * Integración con Google Calendar API
 * Demuestra OAuth 2.0, APIs REST y manejo de autenticación
 */

class GoogleCalendarIntegration {
  constructor() {
    this.clientId = "" // Se configurará desde la UI
    this.apiKey = "" // Se configurará desde la UI
    this.discoveryDoc = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
    this.scopes = "https://www.googleapis.com/auth/calendar.events"

    this.gapi = window.gapi // Declare the variable before using it
    this.tokenClient = null
    this.isInitialized = false
    this.isSignedIn = false

    this.eventEmitter = new window.PokemonUtils.EventEmitter()
    this.config = window.config
  }

  // ========== INICIALIZACIÓN Y AUTENTICACIÓN ==========

  // Inicializar Google API
  async initializeGoogleAPI() {
    try {
      console.log("Inicializando Google API...")

      // Cargar Google API Script
      await this.loadGoogleAPIScript()

      // Inicializar GAPI
      await new Promise((resolve, reject) => {
        this.gapi.load("client", {
          callback: resolve,
          onerror: reject,
        })
      })

      await this.gapi.client.init({
        apiKey: this.apiKey,
        discoveryDocs: [this.discoveryDoc],
      })

      // Inicializar Google Identity Services
      const google = window.google // Declare the variable before using it
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes,
        callback: (response) => {
          this.handleAuthResponse(response)
        },
      })

      this.isInitialized = true

      console.log("Google API inicializada correctamente")
      this.eventEmitter.emit("apiInitialized")

      return true
    } catch (error) {
      console.error("Error inicializando Google API:", error)
      this.eventEmitter.emit("apiError", error)
      throw new window.PokemonUtils.PokemonAPIError("Error inicializando Google API", 500, error)
    }
  }

  // Cargar script de Google API
  loadGoogleAPIScript() {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (window.gapi) {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = () => {
        // Cargar también Google Identity Services
        const identityScript = document.createElement("script")
        identityScript.src = "https://accounts.google.com/gsi/client"
        identityScript.onload = resolve
        identityScript.onerror = reject
        document.head.appendChild(identityScript)
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Manejar respuesta de autenticación
  handleAuthResponse(response) {
    if (response.error) {
      console.error("Error de autenticación:", response.error)
      this.eventEmitter.emit("authError", response.error)
      return
    }

    console.log("Autenticación exitosa")
    this.isSignedIn = true
    this.config.set("googleConnected", true)
    this.config.set("lastAuth", new Date().toISOString())

    this.eventEmitter.emit("authSuccess")
  }

  // Iniciar proceso de autenticación
  async authenticate() {
    if (!this.isInitialized) {
      throw new Error("Google API no está inicializada")
    }

    try {
      console.log("Iniciando autenticación...")
      this.tokenClient.requestAccessToken()
    } catch (error) {
      console.error("Error en autenticación:", error)
      throw error
    }
  }

  // Cerrar sesión
  signOut() {
    if (this.gapi && this.gapi.client) {
      window.google.accounts.oauth2.revoke(this.gapi.client.getToken().access_token, () => {
        console.log("Sesión cerrada")
        this.isSignedIn = false
        this.config.set("googleConnected", false)
        this.eventEmitter.emit("signedOut")
      })
    }
  }

  // ========== OPERACIONES CON CALENDARIO ==========

  // Crear evento en Google Calendar
  async createCalendarEvent(event) {
    if (!this.isSignedIn) {
      throw new Error("No está autenticado con Google")
    }

    try {
      const calendarEvent = {
        summary: event.title,
        description: this.formatEventDescription(event),
        start: {
          dateTime: event.startDate,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.endDate,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        source: {
          title: "Pokémon GO",
          url: event.sourceUrl,
        },
        colorId: this.getEventColor(event.category),
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      }

      const request = this.gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: calendarEvent,
      })

      const response = await request
      console.log("Evento creado:", response.result)

      return response.result
    } catch (error) {
      console.error("Error creando evento:", error)
      throw new window.PokemonUtils.PokemonAPIError("Error creando evento en Google Calendar", 500, error)
    }
  }

  // Formatear descripción del evento
  formatEventDescription(event) {
    let description = event.description

    if (event.sourceUrl) {
      description += `\n\nMás información: ${event.sourceUrl}`
    }

    description += `\n\nCreado automáticamente por Pokémon GO Calendar Sync`
    description += `\nFecha de extracción: ${new Date(event.scrapedAt || Date.now()).toLocaleString("es-ES")}`

    if (event.category) {
      description += `\nCategoría: ${event.category}`
    }

    return description
  }

  // Obtener color del evento según categoría
  getEventColor(category) {
    const colorMap = {
      legendary: "11", // Rojo
      festival: "9", // Azul
      community: "10", // Verde
      spotlight: "5", // Amarillo
      raids: "6", // Naranja
      other: "1", // Lavanda
    }

    return colorMap[category] || colorMap["other"]
  }

  // Sincronizar múltiples eventos
  async syncEvents(events) {
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error("No hay eventos para sincronizar")
    }

    console.log(`Sincronizando ${events.length} eventos...`)
    this.eventEmitter.emit("syncStarted", { count: events.length })

    const results = {
      success: [],
      failed: [],
      total: events.length,
    }

    try {
      // Procesar eventos en lotes para evitar límites de API
      const batchSize = 5
      const batches = window.PokemonUtils.batchProcessor(events, batchSize)

      for (const batch of batches) {
        const batchPromises = batch.map(async (event) => {
          try {
            const result = await this.createCalendarEvent(event)
            results.success.push({ event, result })
            this.eventEmitter.emit("eventSynced", { event, result })
            return result
          } catch (error) {
            console.error(`Error sincronizando evento ${event.title}:`, error)
            results.failed.push({ event, error })
            this.eventEmitter.emit("eventSyncFailed", { event, error })
            throw error
          }
        })

        // Esperar que termine el lote actual
        await Promise.allSettled(batchPromises)

        // Pausa entre lotes para respetar límites de API
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Actualizar configuración
      this.config.set("lastSync", new Date().toISOString())

      console.log(`Sincronización completada: ${results.success.length} exitosos, ${results.failed.length} fallidos`)
      this.eventEmitter.emit("syncCompleted", results)

      return results
    } catch (error) {
      console.error("Error en sincronización:", error)
      this.eventEmitter.emit("syncError", error)
      throw error
    }
  }

  // ========== MÉTODOS DE UTILIDAD ==========

  // Verificar estado de conexión
  isConnected() {
    return this.isInitialized && this.isSignedIn
  }

  // Obtener información del usuario
  async getUserInfo() {
    if (!this.isSignedIn) {
      return null
    }

    try {
      const response = await this.gapi.client.calendar.calendarList.list()
      const calendars = response.result.items
      const primaryCalendar = calendars.find((cal) => cal.primary)

      return {
        email: primaryCalendar?.id,
        calendars: calendars.length,
        primaryCalendar: primaryCalendar?.summary,
      }
    } catch (error) {
      console.error("Error obteniendo info del usuario:", error)
      return null
    }
  }

  // Configurar credenciales
  setCredentials(clientId, apiKey) {
    this.clientId = clientId
    this.apiKey = apiKey

    // Guardar en configuración
    this.config.set("googleClientId", clientId)
    this.config.set("googleApiKey", apiKey)
  }

  // Cargar credenciales guardadas
  loadSavedCredentials() {
    const clientId = this.config.get("googleClientId")
    const apiKey = this.config.get("googleApiKey")

    if (clientId && apiKey) {
      this.setCredentials(clientId, apiKey)
      return true
    }

    return false
  }
}

// ========== SIMULACIÓN PARA DESARROLLO ==========

class MockGoogleCalendarIntegration {
  constructor() {
    this.eventEmitter = new window.PokemonUtils.EventEmitter()
    this.config = window.config
    this.isConnected = false
  }

  // Simular autenticación
  async authenticate() {
    console.log("Simulando autenticación con Google...")

    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 2000))

    this.isConnected = true
    this.config.set("googleConnected", true)
    this.config.set("lastAuth", new Date().toISOString())

    this.eventEmitter.emit("authSuccess")
    console.log("Autenticación simulada exitosa")
  }

  // Simular sincronización
  async syncEvents(events) {
    if (!this.isConnected) {
      throw new Error("No está conectado con Google (simulado)")
    }

    console.log(`Simulando sincronización de ${events.length} eventos...`)
    this.eventEmitter.emit("syncStarted", { count: events.length })

    const results = {
      success: [],
      failed: [],
      total: events.length,
    }

    // Simular procesamiento de eventos
    for (let i = 0; i < events.length; i++) {
      const event = events[i]

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simular 90% de éxito
      if (Math.random() > 0.1) {
        const mockResult = {
          id: `mock_${Date.now()}_${i}`,
          htmlLink: `https://calendar.google.com/event?eid=mock_${i}`,
          created: new Date().toISOString(),
        }

        results.success.push({ event, result: mockResult })
        this.eventEmitter.emit("eventSynced", { event, result: mockResult })
      } else {
        const mockError = new Error("Error simulado de API")
        results.failed.push({ event, error: mockError })
        this.eventEmitter.emit("eventSyncFailed", { event, error: mockError })
      }
    }

    this.config.set("lastSync", new Date().toISOString())

    console.log(
      `Sincronización simulada completada: ${results.success.length} exitosos, ${results.failed.length} fallidos`,
    )
    this.eventEmitter.emit("syncCompleted", results)

    return results
  }

  signOut() {
    this.isConnected = false
    this.config.set("googleConnected", false)
    this.eventEmitter.emit("signedOut")
    console.log("Sesión simulada cerrada")
  }

  async getUserInfo() {
    if (!this.isConnected) {
      return null
    }

    return {
      email: "usuario@ejemplo.com",
      calendars: 3,
      primaryCalendar: "Mi Calendario",
    }
  }
}

// Crear instancia global (usar mock por defecto para desarrollo)
window.googleCalendar = new MockGoogleCalendarIntegration()

// Función para cambiar a integración real
window.enableRealGoogleIntegration = () => {
  window.googleCalendar = new GoogleCalendarIntegration()
  console.log("Integración real de Google Calendar habilitada")
}
