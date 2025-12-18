import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
import Script from 'next/script'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { WebVitals } from '@/components/WebVitals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { TypedLocale } from 'payload'
import localization from '@/i18n/localization'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{
    locale: TypedLocale
  }>
}) {
  const { locale } = await params
  const currentLocale = localization.locales.find((loc) => loc.code === locale)

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }
  const { isEnabled } = await draftMode()
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-5866535s" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5866535S');`}
        </Script>
        {/* End Google Tag Manager */}

        {/* Meta Pixel Code - with fallback for blocked scripts */}
        <Script id="meta-pixel-4248031788788352" strategy="afterInteractive">
          {`(function() {
  try {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;
    t.onerror=function(){
      console.info('[Meta Pixel] Script blocked, using image beacon fallback');
    };
    s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    // Initialize pixel and track PageView
    if(typeof fbq === 'function') {
      fbq('init', '4248031788788352');
      fbq('track', 'PageView');
    }
  } catch(e) {
    console.info('[Meta Pixel] Initialization error:', e.message);
  }
})();`}
        </Script>
        <noscript>
          {/* Fallback for users with JavaScript disabled or blocked scripts */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=4248031788788352&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        {/* Geist fonts are loaded automatically by the geist package - no manual preload needed */}

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Resource hints for better performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body className="overflow-x-hidden">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5866535S"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <Providers>
          <WebVitals />
          {/* <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          /> */}
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
