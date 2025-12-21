import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Trophy,
  Target,
  FileText,
  Loader2,
  Hash,
  Goal,
  GitCommitHorizontal,
  UserCheck,
  Award,
  Handshake,
  ShieldCheck,
  Shirt
} from 'lucide-react'
import StatsService from '../../../layers/application/services/StatsService'

const reportTypes = [
  { id: 'tournament-overview', name: 'Tournament Overview', description: 'High-level stats & standings insights.', icon: Trophy },
  { id: 'match-statistics', name: 'Match Statistics', description: 'Detailed match performance indicators.', icon: BarChart3 },
  { id: 'player-performance', name: 'Player Performance', description: 'Ranking and performance breakdown by player.', icon: Users },
  { id: 'team-analysis', name: 'Team Analysis', description: 'Tactical and effectiveness analysis.', icon: Target },
  { id: 'attendance-revenue', name: 'Attendance & Revenue', description: 'Finance and attendance reporting.', icon: TrendingUp },
  { id: 'media-coverage', name: 'Media Coverage', description: 'News & engagement signals.', icon: FileText }
]

const STAT_THEME = {
  blue: {
    border: 'border-blue-500/20',
    iconWrap: 'bg-blue-500/10 border-blue-500/20',
    icon: 'text-cyan-300'
  },
  green: {
    border: 'border-emerald-500/20',
    iconWrap: 'bg-emerald-500/10 border-emerald-500/20',
    icon: 'text-emerald-300'
  },
  purple: {
    border: 'border-indigo-500/20',
    iconWrap: 'bg-indigo-500/10 border-indigo-500/20',
    icon: 'text-indigo-300'
  },
  yellow: {
    border: 'border-amber-500/20',
    iconWrap: 'bg-amber-500/10 border-amber-500/20',
    icon: 'text-amber-300'
  }
}

const StatCard = ({ icon: Icon, title, value, color }) => {
  const theme = STAT_THEME[color] || STAT_THEME.blue
  return (
    <div className={`admin-surface-soft p-4 flex items-center gap-4 ${theme.border}`}>
      <div className={`p-3 rounded-xl border ${theme.iconWrap}`}>
        <Icon size={24} className={theme.icon} />
      </div>
      <div>
        <div className="text-blue-200/40 text-sm font-medium">{title}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
      </div>
    </div>
  )
}

const TopPerformerCard = ({ icon: Icon, category, name, team, value, label }) => (
  <div className="admin-surface-soft rounded-lg p-5 hover:bg-white/5 transition-colors">
    <div className="flex items-center space-x-3 mb-3">
      <Icon className="text-blue-200/50" size={20} />
      <h4 className="font-semibold text-slate-100">{category}</h4>
    </div>
    <p className="text-2xl font-bold text-white">{name}</p>
    <p className="text-sm text-blue-200/40 mb-3">{team}</p>
    <p className="text-3xl font-extrabold text-cyan-300">
      {value} <span className="text-base font-medium text-blue-200/40">{label}</span>
    </p>
  </div>
)

const PlaceholderReport = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-96 bg-white/5 rounded-lg border-2 border-dashed border-white/15">
    <BarChart3 size={48} className="text-blue-200/30 mb-4" />
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    <p className="text-blue-200/40 mt-2 text-center max-w-xl">
      Detailed content for this report will appear here.
    </p>
  </div>
)

const TournamentOverviewReport = ({ overview }) => {
  const totals = overview?.totals ?? {}
  const top = overview?.topPerformers ?? {}
  const formatNumber = (value) => (value || value === 0 ? value : '--')

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Hash} title="Total Matches" value={formatNumber(totals.matches)} color="blue" />
        <StatCard icon={Goal} title="Total Goals" value={formatNumber(totals.goals)} color="green" />
        <StatCard
          icon={GitCommitHorizontal}
          title="Goals / Match"
          value={totals.matches ? (totals.goals / totals.matches).toFixed(2) : '--'}
          color="purple"
        />
        <StatCard icon={UserCheck} title="Players" value={formatNumber(totals.players)} color="yellow" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Top Performers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {top.topScorer ? (
            <TopPerformerCard
              icon={Award}
              category="Top Scorer"
              name={top.topScorer.name}
              team={top.topScorer.team}
              value={top.topScorer.value}
              label={top.topScorer.label || 'goals'}
            />
          ) : (
            <PlaceholderReport title="Top Scorer" />
          )}
          {top.topAssists ? (
            <TopPerformerCard
              icon={Handshake}
              category="Top Assists"
              name={top.topAssists.name}
              team={top.topAssists.team}
              value={top.topAssists.value}
              label={top.topAssists.label || 'assists'}
            />
          ) : (
            <PlaceholderReport title="Top Assists" />
          )}
          {top.mostApps ? (
            <TopPerformerCard
              icon={Shirt}
              category="Most Appearances"
              name={top.mostApps.name}
              team={top.mostApps.team}
              value={top.mostApps.value}
              label={top.mostApps.label || 'apps'}
            />
          ) : (
            <PlaceholderReport title="Appearances" />
          )}
          {top.cleanSheets ? (
            <TopPerformerCard
              icon={ShieldCheck}
              category="Clean Sheets"
              name={top.cleanSheets.name}
              team={top.cleanSheets.team}
              value={top.cleanSheets.value}
              label={top.cleanSheets.label || 'clean sheets'}
            />
          ) : (
            <PlaceholderReport title="Clean Sheets" />
          )}
        </div>
      </div>
    </div>
  )
}

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState('tournament-overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: '2024-09-01',
    end: '2025-01-22'
  })
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadOverview = async (params = {}) => {
    setLoading(true)
    setError('')
    try {
      const data = await StatsService.getOverview(params)
      setOverview(data)
    } catch (err) {
      console.error(err)
      setError('Không thể tải dữ liệu báo cáo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOverview({ start: dateRange.start, end: dateRange.end })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateReport = async () => {
    setIsGenerating(true)
    await loadOverview({ start: dateRange.start, end: dateRange.end, report: selectedReport })
    setIsGenerating(false)
  }

  const renderReportContent = () => {
    const reportName = reportTypes.find((r) => r.id === selectedReport)?.name || ''
    switch (selectedReport) {
      case 'tournament-overview':
        return <TournamentOverviewReport overview={overview} />
      default:
        return <PlaceholderReport title={reportName} />
    }
  }

  const selectedReportName = useMemo(
    () => reportTypes.find((r) => r.id === selectedReport)?.name,
    [selectedReport]
  )

  return (
    <div className="admin-page p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-wider text-white">Reports & Analytics</h1>
            <p className="text-blue-200/40 mt-2">Generate consistent insights across tournament operations.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button onClick={generateReport} disabled={isGenerating} className="admin-btn-primary w-44 justify-center">
              <span>
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isGenerating ? 'Generating...' : 'Generate'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="admin-surface p-4 sticky top-8">
            <h3 className="font-semibold text-white mb-4 px-3">Report Types</h3>
            <div className="space-y-1">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    selectedReport === report.id
                      ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-white shadow-[0_0_24px_-12px_rgba(34,211,238,0.7)]'
                      : 'hover:bg-white/5 text-blue-100/80'
                  }`}
                >
                  <report.icon size={18} />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className={`text-xs ${selectedReport === report.id ? 'text-white/80' : 'text-blue-200/40'}`}>
                      {report.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="admin-surface p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white mb-3 md:mb-0">{selectedReportName}</h2>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-blue-200/40" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="admin-input px-3 py-2 text-sm"
                />
                <span className="text-blue-200/40">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="admin-input px-3 py-2 text-sm"
                />
              </div>
            </div>

            {error && <div className="mb-4 rounded border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-blue-200/40">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading data...
              </div>
            ) : (
              renderReportContent()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
