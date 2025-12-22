import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Trash2, Upload } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import ApiService from '../../../layers/application/services/ApiService'

const MediaLibrary = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const loadMedia = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ApiService.get('/media')
      const rows = Array.isArray(response?.data) ? response.data : []
      setItems(rows)
    } catch (error) {
      console.error(error)
      toast.error('Unable to load media library.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    try {
      await ApiService.upload('/media/upload', file)
      toast.success('Uploaded successfully.')
      await loadMedia()
    } catch (error) {
      console.error(error)
      toast.error(error?.message ?? 'Upload failed.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this media asset?')
    if (!confirmed) {
      return
    }
    setDeletingId(id)
    try {
      await ApiService.delete(`/media/${encodeURIComponent(id)}`)
      toast.success('Deleted.')
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error(error)
      toast.error(error?.message ?? 'Delete failed.')
    } finally {
      setDeletingId(null)
    }
  }

  const totalSize = useMemo(() => items.reduce((sum, item) => sum + (item.size || 0), 0), [items])

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media library</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload and manage shared assets used across the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={16} />}
            <span>{uploading ? 'Uploading…' : 'Upload'}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <button
            type="button"
            onClick={loadMedia}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            {items.length} assets • {(totalSize / (1024 * 1024)).toFixed(2)} MB
          </div>
          <div className="text-xs text-gray-500">Served from `/uploads/media/*`</div>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            No media uploaded yet.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">File</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-right">Size</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{item.filename}</span>
                        <a
                          className="text-xs text-blue-600 hover:underline"
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {typeof item.size === 'number' ? `${(item.size / 1024).toFixed(1)} KB` : '--'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={item.url}
                          download
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-100"
                          title="Download"
                        >
                          <Download size={14} />
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-red-700 hover:bg-red-50 disabled:opacity-60"
                          disabled={deletingId === item.id}
                          title="Delete"
                        >
                          {deletingId === item.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default MediaLibrary

