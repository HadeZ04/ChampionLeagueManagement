import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Calendar,
  Tag,
  Download,
  Upload,
  Send
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import NewsService from '../../../layers/application/services/NewsService'

const NewsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [formValues, setFormValues] = useState({
    title: '',
    summary: '',
    category: 'matches',
    status: 'draft',
    author: '',
    publishDate: '',
    featured: false
  })
  const [saving, setSaving] = useState(false)

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'matches', name: 'Matches' },
    { id: 'teams', name: 'Teams' },
    { id: 'players', name: 'Players' },
    { id: 'draws', name: 'Draws' },
    { id: 'awards', name: 'Awards' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'draft', name: 'Draft' },
    { id: 'published', name: 'Published' },
    { id: 'archived', name: 'Archived' }
  ]

  const loadArticles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await NewsService.listNews({
        search: searchTerm.trim(),
        category: selectedCategory === 'all' ? '' : selectedCategory,
        status: selectedStatus === 'all' ? '' : selectedStatus,
        page: 1,
        pageSize: 200
      })
      setArticles(response.data ?? [])
    } catch (err) {
      console.error(err)
      setError(err?.message ?? 'Unable to load news articles.')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedStatus])

  useEffect(() => {
    const handle = setTimeout(() => {
      loadArticles()
    }, 300)
    return () => clearTimeout(handle)
  }, [loadArticles])

  const filteredNews = useMemo(() => articles, [articles])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Published</span>
      case 'draft':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Draft</span>
      case 'archived':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Archived</span>
      default:
        return null
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'matches':
        return 'bg-green-500'
      case 'teams':
        return 'bg-blue-500'
      case 'players':
        return 'bg-purple-500'
      case 'draws':
        return 'bg-yellow-500'
      case 'awards':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const openCreateModal = () => {
    setEditingArticle(null)
    setFormValues({
      title: '',
      summary: '',
      category: selectedCategory !== 'all' ? selectedCategory : 'matches',
      status: 'draft',
      author: '',
      publishDate: '',
      featured: false
    })
    setIsModalOpen(true)
  }

  const openEditModal = (article) => {
    setEditingArticle(article)
    setFormValues({
      title: article.title ?? '',
      summary: article.summary ?? '',
      category: article.category ?? 'matches',
      status: article.status ?? 'draft',
      author: article.author ?? '',
      publishDate: article.publishDate ?? '',
      featured: Boolean(article.featured ?? false)
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingArticle(null)
  }

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: formValues.title.trim(),
        summary: formValues.summary.trim(),
        category: formValues.category,
        status: formValues.status,
        author: formValues.author.trim(),
        publishDate: formValues.publishDate ? formValues.publishDate : null,
        featured: Boolean(formValues.featured)
      }

      if (editingArticle?.id) {
        await NewsService.updateArticle(editingArticle.id, payload)
        toast.success('Article updated.')
      } else {
        await NewsService.createArticle(payload)
        toast.success('Article created.')
      }

      closeModal()
      await loadArticles()
    } catch (err) {
      console.error(err)
      toast.error(err?.message ?? 'Unable to save article.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (article) => {
    const confirmed = window.confirm(`Delete article "${article.title}"?`)
    if (!confirmed) return

    try {
      await NewsService.deleteArticle(article.id)
      toast.success('Article deleted.')
      await loadArticles()
    } catch (err) {
      console.error(err)
      toast.error(err?.message ?? 'Unable to delete article.')
    }
  }

  const handlePublish = async (article) => {
    try {
      await NewsService.updateArticle(article.id, {
        status: 'published',
        publishDate: article.publishDate ?? new Date().toISOString().slice(0, 10)
      })
      toast.success('Article published.')
      await loadArticles()
    } catch (err) {
      console.error(err)
      toast.error(err?.message ?? 'Unable to publish article.')
    }
  }

  return (
    <div>
      <Toaster position="top-right" />
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
            <p className="text-gray-600 mt-2">Create and manage news articles and content</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => toast.success('Export job queued.')}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <button 
              onClick={openCreateModal}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Create Article</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Articles ({filteredNews.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading articles...
                  </td>
                </tr>
              ) : filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No articles match your filters.
                  </td>
                </tr>
              ) : (
                filteredNews.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText size={20} className="text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">{article.title}</div>
                          <div className="text-gray-500 text-sm line-clamp-2">{article.summary}</div>
                          {article.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.publishDate || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(article.views || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => window.alert(`${article.title}\n\n${article.summary}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(article)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {article.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handlePublish(article)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Publish"
                          >
                            <Send size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(article)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingArticle ? 'Edit article' : 'Create article'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  name="summary"
                  value={formValues.summary}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formValues.category}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formValues.status}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses
                      .filter((s) => s.id !== 'all')
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    name="author"
                    value={formValues.author}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publish date</label>
                  <input
                    type="date"
                    name="publishDate"
                    value={formValues.publishDate || ''}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="featured"
                  checked={Boolean(formValues.featured)}
                  onChange={handleFormChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Featured
              </label>

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsManagement
