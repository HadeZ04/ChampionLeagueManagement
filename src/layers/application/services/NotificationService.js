import AuditLogService from './AuditLogService'

class NotificationService {
  /**
   * Get recent notifications from audit events (same data as audit-log page)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.pageSize - Items per page (default: 10)
   * @param {string} params.severity - Filter by severity (info, warning, critical)
   * @returns {Promise<Array>} Array of notifications
   */
  async getNotifications(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        ...(params.severity && { severity: params.severity })
      }

      // Use AuditLogService to get the same data as audit-log page
      const response = await AuditLogService.listEvents(queryParams)
      const events = response?.data || []

      // Map audit events to notification format (same format as audit-log page)
      return events.map(event => {
        const action = event.action || event.eventType || 'Unknown action'
        const severity = event.severity || 'info'
        
        // Use action as title (same as audit-log page)
        const title = action
        
        // Map severity to notification type
        let type = 'info'
        if (severity === 'critical') type = 'error'
        else if (severity === 'warning') type = 'warning'
        else if (severity === 'info') type = 'info'

        // Calculate time ago
        const timestamp = event.timestamp || event.createdAt || event.created_at
        if (!timestamp) {
          return {
            id: event.id || event.audit_event_id,
            title,
            time: 'Không xác định',
            type,
            severity,
            action: event.action,
            module: event.module,
            actor: event.actor,
            timestamp
          }
        }

        const createdAt = new Date(timestamp)
        const now = new Date()
        const diffMs = now - createdAt
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        let timeAgo = 'Vừa xong'
        if (diffMins < 1) {
          timeAgo = 'Vừa xong'
        } else if (diffMins < 60) {
          timeAgo = `${diffMins} phút trước`
        } else if (diffHours < 24) {
          timeAgo = `${diffHours} giờ trước`
        } else {
          timeAgo = `${diffDays} ngày trước`
        }

        return {
          id: event.id || event.audit_event_id,
          title,
          time: timeAgo,
          type,
          severity,
          action: event.action,
          module: event.module,
          actor: event.actor,
          timestamp
        }
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Return empty array on error, don't throw
      return []
    }
  }

  /**
   * Get unread notification count
   * @returns {Promise<number>} Count of unread notifications
   */
  async getUnreadCount() {
    try {
      const notifications = await this.getNotifications({ pageSize: 100 })
      // For now, consider all recent notifications as "unread"
      // In the future, you can add a read/unread status field
      return notifications.length
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  }
}

export default new NotificationService()

