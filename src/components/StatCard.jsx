import React from 'react'

const StatCard = ({ title, value, icon: Icon, description, trend, color = 'uefa-blue' }) => {
  return (
    <div className="uefa-stats-card group hover:scale-105 transition-all duration-300">
      <div className={`uefa-stats-icon bg-${color} group-hover:shadow-lg transition-all duration-300`}>
        <Icon size={24} />
      </div>
      <div className="uefa-stats-number group-hover:text-uefa-blue transition-colors">
        {value}
        {trend && (
          <span className={`text-sm ml-2 ${trend > 0 ? 'text-uefa-green' : trend < 0 ? 'text-uefa-red' : 'text-uefa-gray'}`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
          </span>
        )}
      </div>
      <div className="uefa-stats-label">{title}</div>
      {description && (
        <p className="text-uefa-gray text-xs mt-2 leading-relaxed">{description}</p>
      )}
    </div>
  )
}

export default StatCard
