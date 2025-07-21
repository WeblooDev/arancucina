'use client'

import { useEffect } from 'react'

/**
 * Web Vitals metric structure from web-vitals library
 */
interface WebVitalsMetric {
  id: string
  name: string
  value: number
  delta?: number
  entries: PerformanceEntry[]
}

/**
 * Component that registers and reports Web Vitals metrics
 */
export const WebVitals = (): null => {
  useEffect(() => {
    // Skip in development or SSR
    if (typeof window === 'undefined') return

    try {
      // Import web-vitals dynamically to avoid bundling in development
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        /**
         * Reports a Web Vitals metric to analytics and/or local storage
         */
        const reportWebVital = (metric: WebVitalsMetric): void => {
          // Log to console in development
          if (process.env.NODE_ENV !== 'production') {
            console.log(`Web Vital: ${metric.name} = ${metric.value}`)
            return
          }

          // In production, send to analytics services
          try {
            // Send to Google Analytics if available
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'web-vitals', {
                event_category: 'Web Vitals',
                event_label: metric.id,
                // CLS needs to be multiplied by 1000 for proper reporting
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                non_interaction: true,
              })
            }
            
            // Store in localStorage for debugging and local analytics
            try {
              const storedVitals = localStorage.getItem('web-vitals') || '{}'
              const vitals = JSON.parse(storedVitals)
              vitals[metric.name] = metric.value
              localStorage.setItem('web-vitals', JSON.stringify(vitals))
            } catch (storageErr) {
              // Silently fail if localStorage isn't available
              console.debug('Failed to store web vitals in localStorage:', storageErr)
            }
          } catch (analyticsErr) {
            // Silently fail if analytics isn't available
            console.debug('Failed to report web vitals to analytics:', analyticsErr)
          }
        }

        // Register all web vitals
        onCLS(reportWebVital)
        onINP(reportWebVital)
        onFCP(reportWebVital)
        onLCP(reportWebVital)
        onTTFB(reportWebVital)
      }).catch(err => {
        // Silently fail if web-vitals fails to load
        console.debug('Failed to load web-vitals:', err)
      })
    } catch (err) {
      // Catch any unexpected errors
      console.debug('Error in WebVitals component:', err)
    }
  }, [])

  return null
}

// Add window.gtag type for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void
  }
}

export default WebVitals
