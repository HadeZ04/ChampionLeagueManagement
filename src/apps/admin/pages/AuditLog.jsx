import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  Filter,
  AlertTriangle,
  Shield,
  ShieldCheck,
  Download,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import AuditLogService from '../../../layers/application/services/AuditLogService'

const severityFilters = ['All severity', 'info', 'warning', 'critical']
const DEFAULT_PAGE_SIZE = 25

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return '--'
  }
  const date = new Date(timestamp)
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const AuditLog = () => {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('All modules')
  const [severityFilter, setSeverityFilter] = useState('All severity')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [onlyCritical, setOnlyCritical] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
    }, 350)
    return () => clearTimeout(handle)
  }, [searchTerm])

  const normalizedSeverity = useMemo(() => {
    if (onlyCritical) {
      return 'critical'
    }
    return severityFilter === 'All severity' ? null : severityFilter
  }, [onlyCritical, severityFilter])

  const severitySelectValue = onlyCritical ? 'critical' : severityFilter

  const buildQueryPayload = useCallback(
    (pageOverride = 1) => {
      const payload = {
        page: pageOverride,
        pageSize: pagination.pageSize
      }
      if (normalizedSeverity) {
        payload.severity = normalizedSeverity
      }
      if (moduleFilter !== 'All modules') {
        payload.entityType = moduleFilter.toLowerCase()
      }
      if (debouncedSearch) {
        payload.search = debouncedSearch
      }
      if (fromDate) {
        payload.from = `${fromDate}T00:00:00Z`
      }
      if (toDate) {
        payload.to = `${toDate}T23:59:59Z`
      }
      return payload
    },
    [pagination.pageSize, normalizedSeverity, moduleFilter, debouncedSearch, fromDate, toDate]
  )

  const loadLogs = useCallback(async (pageOverride = 1) => {
    setIsLoading(true)
    try {
      const targetPage = pageOverride ?? 1
      const response = await AuditLogService.listEvents(buildQueryPayload(targetPage))
      setLogs(response.data)
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      })
    } catch (error) {
      console.error(error)
      toast.error('Unable to load audit events.')
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }, [buildQueryPayload])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const moduleOptions = useMemo(() => {
    const unique = new Set(logs.map((log) => log.module ?? 'SYSTEM'))
    return ['All modules', ...unique]
  }, [logs])

  const totalPages = useMemo(() => {
    if (!pagination.total || !pagination.pageSize) {
      return 1
    }
    return Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
  }, [pagination.total, pagination.pageSize])

  const paginationSummary = useMemo(() => {
    if (pagination.total === 0 || logs.length === 0) {
      return 'No audit events to display'
    }
    const start = (pagination.page - 1) * pagination.pageSize + 1
    const end = Math.min(pagination.total, start + logs.length - 1)
    return `Showing ${start}-${end} of ${pagination.total} events`
  }, [logs.length, pagination.page, pagination.pageSize, pagination.total])

  const handlePageChange = (direction) => {
    if (direction === 'prev' && pagination.page > 1) {
      loadLogs(pagination.page - 1)
    }
    if (direction === 'next' && pagination.page < totalPages) {
      loadLogs(pagination.page + 1)
    }
  }


  const handleExport = () => {
    toast.success('Export requested. The report will be emailed to you.')
  }

  const renderSeverityIcon = (severity) => {
    if (severity === 'critical') {
      return <AlertTriangle size={18} className="text-red-600" />
    }
    if (severity === 'warning') {
      return <Shield size={18} className="text-yellow-600" />
    }
    return <ShieldCheck size={18} className="text-blue-600" />
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit trail</h1>
          <p className="mt-1 text-sm text-gray-600">
            Trace every governance action for compliance, investigations, and dispute resolution.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => loadLogs(pagination.page)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
          >
            <Download size={16} />
            Export log
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by user, action, or module..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              <Filter size={16} />
              Filters
            </div>

            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {moduleOptions.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>

            <select
              value={severitySelectValue}
              onChange={(event) => setSeverityFilter(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={onlyCritical}
            >
              {severityFilters.map((entry) => (
                <option key={entry} value={entry}>
                  {entry === 'info'
                    ? 'Info'
                    : entry === 'warning'
                    ? 'Warning'
                    : entry === 'critical'
                    ? 'Critical'
                    : entry}
                </option>
              ))}
            </select>
          </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-col text-xs text-gray-500">
            From
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="flex flex-col text-xs text-gray-500">
              To
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={onlyCritical}
                onChange={(event) => setOnlyCritical(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Only high severity
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600">{paginationSummary}</p>
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange('prev')}
              disabled={pagination.page === 1 || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <span className="text-xs font-medium text-gray-500">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange('next')}
              disabled={pagination.page === totalPages || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              Loading audit records...
            </div>
          )}
          {!isLoading && logs.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              No audit records match your filters. Adjust the search criteria or expand the date range.
            </div>
          )}
          {!isLoading &&
            logs.map((log) => (
              <article
                key={log.id}
                className={`rounded-lg border px-4 py-3 ${
                  log.severity === 'critical'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : log.severity === 'warning'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    {renderSeverityIcon(log.severity)}
                    <div>
                      <p className="font-semibold">{log.action}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {log.module} · {log.actor ?? 'System'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>

                <dl className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  {log.entityId && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-gray-600 shadow-sm">
                      <span className="font-semibold uppercase tracking-wide text-gray-400">Entity</span>
                      <span>{log.entityId}</span>
                    </div>
                  )}
                  {Object.entries(log.payload || {}).map(([key, value]) => (
                    <div
                      key={`payload-${log.id}-${key}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-gray-600 shadow-sm"
                    >
                      <span className="font-semibold uppercase tracking-wide text-gray-400">{key}</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                  {Object.entries(log.metadata || {}).map(([key, value]) => (
                    <div
                      key={`metadata-${log.id}-${key}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-gray-600 shadow-sm"
                    >
                      <span className="font-semibold uppercase tracking-wide text-gray-400">{key}</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
        </div>
      </section>
    </div>
  )
}

export default AuditLog
