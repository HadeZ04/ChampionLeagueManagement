import { useState, useCallback, useRef } from 'react'

/**
 * Custom hook for API calls with timeout and error handling
 * Prevents infinite loading states
 * 
 * @param {number} timeout - Timeout in milliseconds (default: 15000ms)
 * @returns {object} - { loading, error, data, fetchData }
 */
const useApiWithTimeout = (timeout = 15000) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const abortControllerRef = useRef(null)
  const timeoutIdRef = useRef(null)

  const fetchData = useCallback(async (url, options = {}) => {
    // Cleanup previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutIdRef.current = setTimeout(() => {
          abortControllerRef.current?.abort()
          reject(new Error('Request timeout - Server không phản hồi sau 15 giây'))
        }, timeout)
      })

      // Fetch with timeout race
      const fetchPromise = fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      })

      const response = await Promise.race([fetchPromise, timeoutPromise])

      // Clear timeout if request completes
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }

      if (!response.ok) {
        const errorMessage = `Server error: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setData(result)
      setLoading(false)
      return result

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request đã bị hủy hoặc timeout')
      } else {
        setError(err.message || 'Không thể kết nối đến server')
      }
      setData(null)
      setLoading(false)
      throw err
    }
  }, [timeout])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }
  }, [])

  return {
    loading,
    error,
    data,
    fetchData,
    reset,
  }
}

export default useApiWithTimeout
