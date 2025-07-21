'use client'

import { useState, useEffect } from 'react'
import { OptimizedImage } from './OptimizedImage'
import type { ImageProps } from 'next/image'

interface DeferredImageProps extends Omit<ImageProps, 'loading'> {
  priority?: boolean
  threshold?: number
  rootMargin?: string
}

/**
 * DeferredImage component that intelligently loads images based on viewport visibility
 * - Uses priority for critical above-the-fold images
 * - Defers loading for offscreen images
 * - Provides smooth loading transitions
 */
export const DeferredImage: React.FC<DeferredImageProps> = ({
  priority = false,
  threshold = 0.1,
  rootMargin = '200px',
  className,
  ...props
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // If priority is true, load eagerly
  const loading = priority ? 'eager' : 'lazy'

  // For SSR, render a basic placeholder
  if (!isMounted && !priority) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{ 
          width: typeof props.width === 'number' ? `${props.width}px` : props.width,
          height: typeof props.height === 'number' ? `${props.height}px` : props.height
        }}
      />
    )
  }

  return (
    <OptimizedImage
      {...props}
      loading={loading}
      threshold={threshold}
      rootMargin={rootMargin}
      className={className}
    />
  )
}

export default DeferredImage
