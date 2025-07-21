'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import type { ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'loading'> {
  loading?: 'lazy' | 'eager'
  threshold?: number
  rootMargin?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  loading = 'lazy',
  threshold = 0.1,
  rootMargin = '50px',
  className,
  ...props
}) => {
  const [isInView, setIsInView] = useState(loading === 'eager')
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading === 'eager') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [loading, threshold, rootMargin])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <>
          <Image
            {...props}
            onLoad={handleLoad}
            loading={loading}
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
          {!isLoaded && (
            <div
              className="animate-pulse bg-gray-200 dark:bg-gray-700"
              style={{
                width: props.width || '100%',
                height: props.height || '100%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default OptimizedImage
