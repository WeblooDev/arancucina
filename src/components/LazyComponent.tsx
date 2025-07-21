'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { useLazyLoad } from '@/hooks/useLazyLoad'

interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 w-full rounded" />,
  threshold = 0.1,
  rootMargin = '100px',
  className,
}) => {
  const { ref, isInView } = useLazyLoad({ threshold, rootMargin })

  return (
    <div ref={ref as any} className={className}>
      {isInView ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyLoadedComponent = (props: P & { lazyThreshold?: number; lazyRootMargin?: string }) => {
    const { lazyThreshold, lazyRootMargin, ...componentProps } = props
    
    return (
      <LazyComponent
        threshold={lazyThreshold}
        rootMargin={lazyRootMargin}
        fallback={fallback}
      >
        <Component {...(componentProps as P)} />
      </LazyComponent>
    )
  }

  LazyLoadedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`
  
  return LazyLoadedComponent
}

export default LazyComponent
