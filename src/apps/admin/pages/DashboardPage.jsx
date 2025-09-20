import React from 'react'
import { 
  Users, 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  User,
  FileText
} from 'lucide-react'

const DashboardPage = () => {
  const stats = [
    {
      title: 'Total Teams',
      value: '36',
      change: '+0',
      changeType: 'neutral',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Matches Played',
      value: '108',
      change: '+16',
      changeType: 'positive',
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Total Goals',
      value: '312',
      change: '+47',
      changeType: 'positive',
      icon: Target,
      color: 'purple'
    },
    {
      title: 'Active Players',
      value: '828',
      change: '+12',
      changeType: 'positive',
      icon: Trophy,
      color: 'yellow'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'match_result',
      title: 'Match result updated',
      description: 'Liverpool 2-1 Lille - Result confirmed',
      time: '5 minutes ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'team_update',
      title: 'Team information updated',
      description: 'Barcelona squad list modified',
      time: '15 minutes ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'news_published',
      title: 'News article published',
      description: 'Champions League knockout phase draw scheduled',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'user_login',
      title: 'Admin user logged in',
      description: 'Content Manager accessed the system',
      time: '2 hours ago',
      status: 'info'
    }
  ]

  const pendingTasks = [
    {
      id: 1,
      title: 'Approve match officials for Matchday 8',
      priority: 'high',
      dueDate: '2025-01-23',
      assignee: 'Match Operations'
    },
    {
      id: 2,
      title: 'Review player eligibility documents',
      priority: 'medium',
      dueDate: '2025-01-24',
      assignee: 'Registration Team'
    },
    {
      id: 3,
      title: 'Update website content for knockout phase',
      priority: 'medium',
      dueDate: '2025-01-25',
      assignee: 'Content Team'
    },
    {
      id: 4,
      title: 'Prepare financial fair play reports',
      priority: 'low',
      dueDate: '2025-01-30',
      assignee: 'Finance Team'
    }
  ]

  const upcomingMatches = [
    {
      id: 1,
      homeTeam: 'Liverpool',
      awayTeam: 'Lille',
      date: '2025-01-22',
      time: '21:00',
      venue: 'Anfield',
      status: 'confirmed'
    },
    {
      id: 2,
      homeTeam: 'Barcelona',
      awayTeam: 'Atalanta',
      date: '2025-01-22',
      time: '21:00',
      venue: 'Spotify Camp Nou',
      status: 'confirmed'
    },
    {
      id: 3,
      homeTeam: 'Bayern Munich',
      awayTeam: 'Slovan Bratislava',
      date: '2025-01-22',
      time: '18:45',
      venue: 'Allianz Arena',
      status: 'confirmed'
    }
  ]

  const getStatColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    }
    return colors[color] || colors.blue
  }

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp size={16} className="text-green-500" />
      case 'negative':
        return <TrendingDown size={16} className="text-red-500" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'match_result':
        return <Trophy size={16} className="text-green-500" />
      case 'team_update':
        return <Users size={16} className="text-blue-500" />
      case 'news_published':
        return <FileText size={16} className="text-purple-500" />
      case 'user_login':
        return <User size={16} className="text-gray-500" />
      default:
        return <AlertCircle size={16} className="text-gray-500" />
    }
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the UEFA Champions League Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                {stat.change !== '+0' && (
                  <div className="flex items-center mt-2">
                    {getChangeIcon(stat.changeType)}
                    <span className={`text-sm ml-1 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change} from last week
                    </span>
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 ${getStatColor(stat.color)} rounded-lg flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        {activity.time}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {activity.status === 'completed' ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <AlertCircle size={16} className="text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Pending Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs">{task.dueDate}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{task.title}</h3>
                    <p className="text-gray-600 text-xs">Assigned to: {task.assignee}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Today's Matches</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-600 font-medium text-sm">{match.time}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {match.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {match.homeTeam} vs {match.awayTeam}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1">{match.venue}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors text-left">
          <Calendar size={24} className="mb-3" />
          <h3 className="font-semibold mb-1">Schedule New Match</h3>
          <p className="text-blue-100 text-sm">Add fixtures to the tournament</p>
        </button>
        
        <button className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors text-left">
          <Users size={24} className="mb-3" />
          <h3 className="font-semibold mb-1">Manage Teams</h3>
          <p className="text-green-100 text-sm">Update team information and rosters</p>
        </button>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition-colors text-left">
          <FileText size={24} className="mb-3" />
          <h3 className="font-semibold mb-1">Generate Reports</h3>
          <p className="text-purple-100 text-sm">Create tournament statistics and reports</p>
        </button>
      </div>
    </div>
  )
}

export default DashboardPage
