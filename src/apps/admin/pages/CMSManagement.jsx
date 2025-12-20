import React from 'react'
import NewsManagement from './NewsManagement'

// Thin wrapper so CMS menu points to a dedicated route while reusing the existing NewsManagement UI.
const CMSManagement = () => {
  return <NewsManagement />
}

export default CMSManagement
