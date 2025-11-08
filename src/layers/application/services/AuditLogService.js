import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

const ENDPOINTS = APP_CONFIG.API.ENDPOINTS.AUDIT

const normalizeEventType = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const parseJsonSafe = (value) => {
  if (!value) {
    return null
  }
  if (typeof value === 'object') {
    return value
  }
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const normalizeAuditEvent = (payload = {}) => {
  const severity = (payload.severity ?? 'info').toLowerCase()
  return {
    id: payload.audit_event_id ?? payload.id ?? null,
    eventType: payload.event_type ?? '',
    action: normalizeEventType(payload.event_type ?? ''),
    severity,
    actor: payload.actor_username ?? payload.actor ?? 'System',
    actorRole: payload.actor_role ?? null,
    module: payload.entity_type ?? 'SYSTEM',
    entityId: payload.entity_id ?? '',
    payload: parseJsonSafe(payload.payload),
    metadata: parseJsonSafe(payload.metadata),
    timestamp: payload.created_at ?? payload.createdAt ?? null
  }
}

class AuditLogService {
  async listEvents(params = {}) {
    const response = await ApiService.get(ENDPOINTS.LIST, params)
    const collection = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
      ? response
      : []

    const events = collection.map(normalizeAuditEvent)
    return {
      data: events,
      total: response?.total ?? events.length,
      page: response?.page ?? params.page ?? 1,
      pageSize: response?.pageSize ?? params.pageSize ?? (events.length || 1)
    }
  }
}

export default new AuditLogService()
