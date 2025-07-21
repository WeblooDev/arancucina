'use client'

import dynamic from 'next/dynamic'
import { Suspense, ComponentType } from 'react'

interface DynamicImportOptions {
  ssr?: boolean
  loading?: React.ReactNode
}

/**
 * Utility for dynamically importing components to reduce initial bundle size
 * @param importFn Function that returns a dynamic import
 * @param options Configuration options
 * @returns Dynamically loaded component
 */
export function dynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {},
) {
  const { ssr = false, loading } = options

  const LoadingFallback = () => {
    return (
      loading || <div className="w-full h-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
    )
  }

  const DynamicComponent = dynamic(importFn, {
    ssr,
    loading: LoadingFallback,
  })

  const DynamicComponentWrapper = (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingFallback />}>
      <DynamicComponent {...props} />
    </Suspense>
  )
  
  DynamicComponentWrapper.displayName = 'DynamicComponentWrapper'
  
  return DynamicComponentWrapper
}

dynamicImport.displayName = 'DynamicImport'

export default dynamicImport
