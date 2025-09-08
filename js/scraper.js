// ========== WEB SCRAPING Y EXTRACCIÓN DE DATOS ==========

/**
 * Scraper para extraer información de Pokémon GO
 * Demuestra conceptos de web scraping, CORS, y APIs
 */

class PokemonGoScraper {
  constructor() {
    this.baseUrl = "https://pokemongo.com/es"
    this.proxyUrl = "https://api.allorigins.win/raw?url="
    this.eventEmitter = new window.PokemonUtils.EventEmitter()
    this.cache = window.cache
    this.cacheKey = "scraped_events"
    this.cacheTTL = 30 * 60 * 1000 // 30 minutos
  }

  // ========== CONCEPTOS BÁSICOS - FETCH API ==========

  // Función básica para hacer peticiones HTTP
  async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PokemonGoBot/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new window.PokemonUtils.PokemonAPIError(
          `HTTP Error: ${response.status} ${response.statusText}`,
          response.status,
        )
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === "AbortError") {
        throw new window.PokemonUtils.PokemonAPIError("Request timeout", 408)
      }

      throw error
    }
  }

  // ========== MANEJO DE CORS ==========

  // Intentar diferentes métodos para evitar CORS
  async fetchWithCORSHandling(url) {
    const methods = [
      // Método 1: Directo (funcionará si no hay CORS)
      () => this.fetchWithTimeout(url),

      // Método 2: Con proxy CORS
      () => this.fetchWithTimeout(this.proxyUrl + encodeURIComponent(url)),

      // Método 3: Con diferentes headers
      () =>
        this.fetchWithTimeout(url, {
          mode: "no-cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }),
    ]

    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`Intentando método ${i + 1} para obtener datos...`)
        const response = await methods[i]()
        console.log(`Método ${i + 1} exitoso`)
        return response
      } catch (error) {
        console.warn(`Método ${i + 1} falló:`, error.message)

        if (i === methods.length - 1) {
          throw new window.PokemonUtils.PokemonAPIError("Todos los métodos de obtención de datos fallaron", 500, error)
        }
      }
    }
  }

  // ========== EXTRACCIÓN DE DATOS ==========

  // Simular extracción de eventos (por limitaciones de CORS)
  generateMockEvents() {
    const mockEvents = [
      {
        id: window.PokemonUtils.generateUniqueId(),
        title: "Zacian Espada Suprema y Zamazenta Escudo Supremo llegan a Pokémon GO",
        description:
          "Atención a las futuras informaciones sobre cómo los Entrenadores que se unan al Festival de Pokémon GO 2025 van a poder transformar sus Zacian o Zamazenta en estas formas por primera vez en Pokémon GO!",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "/placeholder.svg?height=200&width=400&text=Zacian+Zamazenta",
        sourceUrl: "https://pokemongo.com/es",
        category: "legendary",
        priority: "high",
      },
      {
        id: window.PokemonUtils.generateUniqueId(),
        title: "Festival de Pokémon GO 2025",
        description:
          "Únete al mayor evento del año con actividades especiales, Pokémon exclusivos y recompensas increíbles. Disfruta de bonificaciones de experiencia, encuentros especiales y mucho más.",
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "/placeholder.svg?height=200&width=400&text=Festival+2025",
        sourceUrl: "https://pokemongo.com/es",
        category: "festival",
        priority: "high",
      },
      {
        id: window.PokemonUtils.generateUniqueId(),
        title: "Día de la Comunidad - Enero 2025",
        description:
          "Evento mensual con un Pokémon destacado, bonificaciones especiales y movimiento exclusivo. No te pierdas esta oportunidad única de capturar Pokémon con habilidades especiales.",
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
        imageUrl: "/placeholder.svg?height=200&width=400&text=Community+Day",
        sourceUrl: "https://pokemongo.com/es",
        category: "community",
        priority: "medium",
      },
      {
        id: window.PokemonUtils.generateUniqueId(),
        title: "Hora del Foco Semanal",
        description:
          "Cada martes, disfruta de una hora especial con bonificaciones de captura y un Pokémon destacado. Perfecto para completar tu Pokédex y obtener caramelos extra.",
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        imageUrl: "/placeholder.svg?height=200&width=400&text=Spotlight+Hour",
        sourceUrl: "https://pokemongo.com/es",
        category: "spotlight",
        priority: "low",
      },
      {
        id: window.PokemonUtils.generateUniqueId(),
        title: "Incursiones de 5 Estrellas - Pokémon Legendario",
        description:
          "Enfréntate a poderosos Pokémon legendarios en incursiones de máximo nivel. Reúne a tu equipo y prepárate para el desafío más grande.",
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "/placeholder.svg?height=200&width=400&text=5+Star+Raids",
        sourceUrl: "https://pokemongo.com/es",
        category: "raids",
        priority: "medium",
      },
    ]

    return mockEvents.map((event) => ({
      ...event,
      scrapedAt: new Date().toISOString(),
      source: "mock_data",
    }))
  }

  // Función principal para extraer eventos
  async scrapeEvents(useCache = true) {
    try {
      // Intentar cargar desde cache primero
      if (useCache) {
        const cached = this.cache.loadWithTTL(this.cacheKey)
        if (cached && Array.isArray(cached)) {
          console.log("Eventos cargados desde cache")
          this.eventEmitter.emit("eventsLoaded", {
            events: cached,
            source: "cache",
          })
          return cached
        }
      }

      console.log("Iniciando extracción de eventos...")
      this.eventEmitter.emit("scrapingStarted")

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Por limitaciones de CORS, usamos datos simulados
      // En un entorno real, aquí harías el scraping real
      const events = await this.performRealScraping()

      // Validar eventos
      const validEvents = events.filter((event) => window.PokemonUtils.validateEvent(event))

      console.log(`Extraídos ${validEvents.length} eventos válidos`)

      // Guardar en cache
      this.cache.saveWithTTL(this.cacheKey, validEvents, this.cacheTTL)

      // Guardar en historial
      validEvents.forEach((event) => {
        window.eventHistory.addToHistory(event)
      })

      this.eventEmitter.emit("eventsLoaded", {
        events: validEvents,
        source: "scraping",
      })

      return validEvents
    } catch (error) {
      console.error("Error en scraping:", error)
      this.eventEmitter.emit("scrapingError", error)
      throw error
    }
  }

  // Función que simula el scraping real
  async performRealScraping() {
    // Aquí iría el código real de scraping
    const realScrapingExample = `
        // Ejemplo de scraping real (requiere proxy o backend)
        try {
            const response = await this.fetchWithCORSHandling(this.baseUrl);
            const html = await response.text();
            
            // Crear un parser DOM temporal
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const events = [];
            
            // Buscar elementos de eventos
            const eventElements = doc.querySelectorAll('.event-card, .news-item, .announcement');
            
            eventElements.forEach((element, index) => {
                const title = element.querySelector('h2, h3, .title')?.textContent?.trim();
                const description = element.querySelector('p, .description')?.textContent?.trim();
                const imageUrl = element.querySelector('img')?.src;
                const link = element.querySelector('a')?.href;
                
                if (title && description) {
                    events.push({
                        id: window.PokemonUtils.generateUniqueId(),
                        title: window.PokemonUtils.formatEventTitle(title),
                        description: window.PokemonUtils.truncateText(description, 200),
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        imageUrl: imageUrl || '/placeholder.svg?height=200&width=400&text=Pokemon+Event',
                        sourceUrl: link || this.baseUrl,
                        scrapedAt: new Date().toISOString(),
                        source: 'real_scraping'
                    });
                }
            });
            
            return events;
        } catch (error) {
            console.warn('Scraping real falló, usando datos simulados');
            return this.generateMockEvents();
        }
        `

    console.log("Código de scraping real:", realScrapingExample)

    // Por ahora, retornamos datos simulados
    return this.generateMockEvents()
  }

  // ========== MÉTODOS AVANZADOS ==========

  // Scraping incremental (solo nuevos eventos)
  async scrapeNewEvents() {
    const allEvents = await this.scrapeEvents(false)
    const history = window.eventHistory.getHistory()
    const existingIds = new Set(history.map((event) => event.id))

    const newEvents = allEvents.filter((event) => !existingIds.has(event.id))

    console.log(`Encontrados ${newEvents.length} eventos nuevos`)
    return newEvents
  }

  // Programar scraping automático
  scheduleAutoScraping(intervalMinutes = 60) {
    const interval = intervalMinutes * 60 * 1000

    const intervalId = setInterval(async () => {
      try {
        console.log("Ejecutando scraping automático...")
        const newEvents = await this.scrapeNewEvents()

        if (newEvents.length > 0) {
          this.eventEmitter.emit("newEventsFound", newEvents)
        }
      } catch (error) {
        console.error("Error en scraping automático:", error)
      }
    }, interval)

    // Retornar función para cancelar
    return () => clearInterval(intervalId)
  }

  // Obtener estadísticas de scraping
  getScrapingStats() {
    const history = window.eventHistory.getHistory()
    const cacheInfo = this.cache.getStorageInfo()

    return {
      totalEventsScraped: history.length,
      cacheInfo: cacheInfo,
      lastScraping: history.length > 0 ? history[0].scrapedAt : null,
      eventsByCategory: this.groupEventsByCategory(history),
    }
  }

  // Agrupar eventos por categoría
  groupEventsByCategory(events) {
    return events.reduce((groups, event) => {
      const category = event.category || "other"
      groups[category] = (groups[category] || 0) + 1
      return groups
    }, {})
  }

  // Limpiar cache y datos
  clearAllData() {
    this.cache.clear()
    window.eventHistory.clearHistory()
    console.log("Todos los datos de scraping han sido limpiados")
  }
}

// Crear instancia global
window.pokemonScraper = new PokemonGoScraper()

// Configurar listeners de eventos
window.pokemonScraper.eventEmitter.on("eventsLoaded", (data) => {
  console.log(`Eventos cargados desde ${data.source}:`, data.events.length)
})

window.pokemonScraper.eventEmitter.on("newEventsFound", (events) => {
  console.log("Nuevos eventos encontrados:", events.length)

  // Mostrar notificación si está habilitada
  if (window.config.get("notifications") && "Notification" in window) {
    new Notification("Pokémon GO Calendar", {
      body: `Se encontraron ${events.length} eventos nuevos`,
      icon: "/favicon.ico",
    })
  }
})

window.pokemonScraper.eventEmitter.on("scrapingError", (error) => {
  console.error("Error en scraping:", error)
})
