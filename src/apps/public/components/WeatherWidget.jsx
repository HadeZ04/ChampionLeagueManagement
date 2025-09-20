import React from 'react'
import { Cloud, Sun, CloudRain, Wind, Thermometer } from 'lucide-react'

const WeatherWidget = ({ city, temperature, condition, humidity, windSpeed }) => {
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun size={20} className="text-yellow-500" />
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud size={20} className="text-gray-500" />
      case 'rainy':
      case 'rain':
        return <CloudRain size={20} className="text-blue-500" />
      default:
        return <Cloud size={20} className="text-gray-500" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-uefa-dark text-sm">Weather in {city}</h3>
        {getWeatherIcon(condition)}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Thermometer size={14} className="text-uefa-red" />
            <span className="text-uefa-gray">Temperature:</span>
          </div>
          <span className="font-semibold text-uefa-dark">{temperature}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Cloud size={14} className="text-uefa-blue" />
            <span className="text-uefa-gray">Condition:</span>
          </div>
          <span className="font-semibold text-uefa-dark">{condition}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Wind size={14} className="text-uefa-cyan" />
            <span className="text-uefa-gray">Wind:</span>
          </div>
          <span className="font-semibold text-uefa-dark">{windSpeed}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-uefa-gray">Humidity:</span>
          <span className="font-semibold text-uefa-dark">{humidity}%</span>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget
