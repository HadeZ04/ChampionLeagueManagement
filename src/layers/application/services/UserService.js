import ApiService from './ApiService'
import APP_CONFIG from '../../../config/app.config'

const ENDPOINTS = APP_CONFIG.API.ENDPOINTS.USERS

const withParams = (template, params = {}) =>
  template.replace(/:([a-zA-Z]+)/g, (_, key) => encodeURIComponent(params[key] ?? `:${key}`))

const normalizeRole = (payload = {}) => ({
  roleId: payload.role_id ?? payload.roleId ?? payload.id ?? null,
  code: payload.code ?? '',
  name: payload.name ?? payload.code ?? '',
  assignedAt: payload.assigned_at ?? payload.assignedAt ?? null
})

const normalizeUser = (payload = {}) => {
  const roles = Array.isArray(payload.roles)
    ? payload.roles.map((role) => normalizeRole(role))
    : []

  return {
    id: payload.user_id ?? payload.id ?? null,
    username: payload.username ?? '',
    email: payload.email ?? '',
    firstName: payload.first_name ?? payload.firstName ?? '',
    lastName: payload.last_name ?? payload.lastName ?? '',
    status: payload.status ?? 'active',
    createdAt: payload.created_at ?? payload.createdAt ?? null,
    lastLoginAt: payload.last_login_at ?? payload.lastLoginAt ?? null,
    mfaEnabled: Boolean(payload.mfa_enabled ?? payload.mfaEnabled ?? false),
    roles
  }
}

class UserService {
  async listUsers(params = {}) {
    const query = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50
    }
    const response = await ApiService.get(ENDPOINTS.LIST, query)
    const data = Array.isArray(response?.data) ? response.data.map(normalizeUser) : []
    return {
      data,
      total: response?.total ?? data.length,
      page: response?.page ?? query.page,
      pageSize: response?.pageSize ?? query.pageSize
    }
  }

  async getUser(userId) {
    const endpoint = withParams(ENDPOINTS.DETAIL, { id: userId })
    const response = await ApiService.get(endpoint)
    return normalizeUser(response)
  }

  async createUser(payload) {
    const response = await ApiService.post(ENDPOINTS.CREATE, payload)
    return response?.userId ?? response?.data?.userId ?? null
  }

  async updateUser(userId, payload) {
    const endpoint = withParams(ENDPOINTS.UPDATE, { id: userId })
    const response = await ApiService.put(endpoint, payload)
    return normalizeUser(response ?? {})
  }

  async deleteUser(userId) {
    const endpoint = withParams(ENDPOINTS.DELETE, { id: userId })
    await ApiService.delete(endpoint)
  }

  async getUserRoles(userId) {
    const endpoint = withParams(ENDPOINTS.ROLES, { id: userId })
    const response = await ApiService.get(endpoint)
    return Array.isArray(response) ? response.map(normalizeRole) : []
  }

  async assignRole(userId, roleId) {
    const endpoint = withParams(ENDPOINTS.ROLES, { id: userId })
    await ApiService.post(endpoint, { roleId })
  }

  async removeRole(userId, roleId) {
    const endpoint = withParams(ENDPOINTS.REMOVE_ROLE, { id: userId, roleId })
    await ApiService.delete(endpoint)
  }
}

export default new UserService()
