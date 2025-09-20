import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

const BreadcrumbNav = ({ items }) => {
  return (
    <nav className="uefa-breadcrumb">
      <div className="flex items-center space-x-2">
        <Home size={14} className="text-uefa-gray" />
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={14} className="text-uefa-gray" />}
            {item.href ? (
              <a href={item.href} className="uefa-breadcrumb-item hover:text-uefa-blue transition-colors">
                {item.name}
              </a>
            ) : (
              <span className="text-uefa-dark font-semibold">{item.name}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  )
}

export default BreadcrumbNav
