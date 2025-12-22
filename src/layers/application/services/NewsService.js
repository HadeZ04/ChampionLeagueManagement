import ApiService from './ApiService'

class NewsService {
  async listNews(params = {}) {
    const response = await ApiService.get('/news', params)
    const data = Array.isArray(response?.data) ? response.data : []
    return {
      data,
      total: response?.total ?? data.length,
      page: response?.page ?? 1,
      pageSize: response?.pageSize ?? data.length
    }
  }

  async listCategories() {
    const response = await ApiService.get('/news/categories')
    return Array.isArray(response?.data) ? response.data : []
  }

  async createArticle(payload) {
    const response = await ApiService.post('/news', payload)
    return response?.data ?? null
  }

  async updateArticle(id, payload) {
    const response = await ApiService.put(`/news/${encodeURIComponent(id)}`, payload)
    return response?.data ?? null
  }

  async deleteArticle(id) {
    await ApiService.delete(`/news/${encodeURIComponent(id)}`)
  }
}

export default new NewsService()

