import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import withBundleAnalyzer from '@next/bundle-analyzer'

const withNextIntl = createNextIntlPlugin()

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable lazy loading by default
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable experimental features for better performance
  experimental: {
    // Enable optimized CSS loading
    optimizeCss: true,
  },
  // Optimize JavaScript bundles
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable compression
  compress: true,
  reactStrictMode: true,
  redirects,

  // Security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://connect.facebook.net https://www.facebook.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com https://www.facebook.com https://*.facebook.com ${NEXT_PUBLIC_SERVER_URL};
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.facebook.com https://*.facebook.com https://connect.facebook.net;
              frame-src 'self' https://www.facebook.com https://*.facebook.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self' https://www.facebook.com https://*.facebook.com;
              upgrade-insecure-requests;
            `
              .replace(/\s{2,}/g, ' ')
              .trim(),
          },
        ],
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias.canvas = false

    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      }
    }

    return config
  },
}

// Enable bundle analyzer when ANALYZE env variable is set
const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withNextIntl(analyzeBundles(withPayload(nextConfig)), {
  devBundleServerPackages: false,
})
