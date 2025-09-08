/**
 * Utilidades para determinar el estado de los eventos
 */

export type EventStatus = 'past' | 'active' | 'upcoming'

export interface EventStatusInfo {
  status: EventStatus
  label: string
  color: string
  bgColor: string
  icon: string
}

/**
 * Determina el estado de un evento basado en su fecha
 */
export function getEventStatus(eventDate: string): EventStatus {
  const now = new Date()
  const eventDateTime = new Date(eventDate)
  
  // Resetear horas para comparar solo fechas
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(eventDateTime.getFullYear(), eventDateTime.getMonth(), eventDateTime.getDate())
  
  if (eventDay < today) {
    return 'past'
  } else if (eventDay.getTime() === today.getTime()) {
    return 'active'
  } else {
    return 'upcoming'
  }
}

/**
 * Obtiene la información visual del estado del evento
 */
export function getEventStatusInfo(status: EventStatus): EventStatusInfo {
  switch (status) {
    case 'past':
      return {
        status: 'past',
        label: 'Pasado',
        color: 'text-white',
        bgColor: 'bg-red-500',
        icon: '📦'
      }
    case 'active':
      return {
        status: 'active',
        label: 'Activo',
        color: 'text-white',
        bgColor: 'bg-green-500',
        icon: '⭐'
      }
    case 'upcoming':
      return {
        status: 'upcoming',
        label: 'Próximo',
        color: 'text-white',
        bgColor: 'bg-blue-500',
        icon: '🐾'
      }
  }
}
