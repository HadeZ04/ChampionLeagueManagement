import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

const REGISTER_ENDPOINT = APP_CONFIG.API.ENDPOINTS.AUTH.REGISTER

class RegistrationService {
  async register(payload) {
    const response = await ApiService.post(REGISTER_ENDPOINT, payload)
    return {
      userId: response?.userId ?? response?.data?.userId ?? null
    }
  }
}

export default new RegistrationService()
