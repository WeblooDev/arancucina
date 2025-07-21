# Performance Optimizations

This document outlines the performance optimizations implemented in the Arancucina project to improve loading speed, user experience, and SEO.

## JavaScript Bundle Optimizations

### Bundle Analysis
- Added bundle analysis tools to identify large dependencies
- Run `pnpm analyze` to see a breakdown of bundle sizes
- Run `pnpm build:analyze` for a visual webpack bundle analyzer report

### Code Splitting
- Implemented dynamic imports for heavy components
- Added utility `dynamicImport.tsx` for easy dynamic component loading
- Configured webpack to optimize chunk splitting in production builds

### Console Removal
- Configured Next.js to automatically remove console logs in production

## Image Optimizations

### Deferred Loading
- Created `DeferredImage.tsx` component that defers offscreen images
- Implemented intersection observer for smart lazy loading
- Added loading placeholders for better UX during image loading

### Format Optimization
- Added script to convert images to WebP format (`pnpm optimize-images`)
- Created responsive image versions at different sizes
- Configured Next.js to support AVIF and WebP formats

## Font Optimizations

### Preloading Critical Fonts
- Added preload links for Geist Sans and Geist Mono fonts
- Implemented font display swap for better perceived performance
- Added DNS prefetch for external font providers

### Resource Hints
- Added preconnect hints for third-party domains
- Implemented DNS prefetching for critical resources
- Added appropriate meta tags for viewport and compatibility

## Performance Monitoring

### Web Vitals Tracking
- Added `WebVitals.tsx` component to track Core Web Vitals
- Implemented reporting for CLS, FID, FCP, LCP, and TTFB metrics
- Set up for easy integration with analytics services

## Lazy Loading Components

### Intersection Observer
- Created `useLazyLoad.ts` hook for component-level lazy loading
- Added `LazyComponent.tsx` wrapper for heavy components
- Implemented HOC pattern with `withLazyLoading` for easy integration

## Usage Examples

### Optimized Images
```tsx
import { DeferredImage } from '@/components/DeferredImage'

// For critical above-the-fold images
<DeferredImage 
  src="/path/to/image.jpg" 
  alt="Description" 
  width={800} 
  height={600} 
  priority={true} 
/>

// For below-the-fold images that can be deferred
<DeferredImage 
  src="/path/to/image.jpg" 
  alt="Description" 
  width={800} 
  height={600} 
/>
```

### Lazy Loading Components
```tsx
import { LazyComponent } from '@/components/LazyComponent'
import { dynamicImport } from '@/utilities/dynamicImport'

// Using LazyComponent wrapper
<LazyComponent>
  <HeavyComponent />
</LazyComponent>

// Using dynamic import utility
const DynamicHeavyComponent = dynamicImport(() => import('@/components/HeavyComponent'))

// Later in your JSX
<DynamicHeavyComponent />
```

## Next Steps

1. **Bundle Size Reduction**: Review the bundle analysis report and identify opportunities to reduce bundle size further
2. **Image CDN**: Consider using a CDN for image delivery with automatic optimization
3. **Service Worker**: Implement service worker for offline support and caching
4. **Server Components**: Convert more components to React Server Components where applicable
5. **Streaming SSR**: Implement streaming for large pages to improve TTFB
