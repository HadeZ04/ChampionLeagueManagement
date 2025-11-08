import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

const ENDPOINTS = APP_CONFIG.API.ENDPOINTS.SEASONS

const normalizeSeason = (payload = {}) => {
  const id = payload.seasonId ?? payload.season_id ?? payload.id
  return {
    id: Number.isFinite(Number(id)) ? Number(id) : null,
    name: payload.name ?? `Season ${id ?? ''}`.trim(),
    code: payload.code ?? null,
    status: payload.status ?? null,
    startDate: payload.startDate ?? payload.start_date ?? null,
    endDate: payload.endDate ?? payload.end_date ?? null
  }
}

class SeasonService {
  async listSeasons() {
    const response = await ApiService.get(ENDPOINTS.LIST)
    if (!Array.isArray(response)) {
      return []
    }
    return response
      .map(normalizeSeason)
      .filter((season) => Number.isFinite(season.id))
  }
}

export default new SeasonService()
