# Meta (Facebook) Pixel Conversion Tracking

This document explains how to implement Meta Pixel conversion tracking in a Next.js application.

## Implementation

### 1. Create the MetaPixel Component

Create a new file at `src/components/MetaPixel.tsx`:

```typescript
'use client'

import Script from 'next/script'

const PIXEL_ID = 'YOUR_PIXEL_ID_HERE' // Replace with your Meta Pixel ID

export const MetaPixel = () => {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
```

### 2. Add to Root Layout

Add the component to your root layout file (`src/app/(frontend)/layout.tsx`):

```tsx
import { MetaPixel } from '@/components/MetaPixel'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <MetaPixel />
          {/* rest of your components */}
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

## Configuration

| Setting               | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| **PIXEL_ID**          | Your unique Meta Pixel ID from Facebook Business Manager                         |
| **Script Strategy**   | `afterInteractive` - loads after page becomes interactive for better performance |
| **NoScript Fallback** | 1x1 pixel image for users with JavaScript disabled                               |

## Tracking Custom Events

### Standard Events

```typescript
// Track a lead/form submission
fbq('track', 'Lead')

// Track a purchase
fbq('track', 'Purchase', { value: 100.0, currency: 'USD' })

// Track add to cart
fbq('track', 'AddToCart', { value: 50.0, currency: 'USD' })

// Track registration
fbq('track', 'CompleteRegistration')

// Track contact
fbq('track', 'Contact')

// Track search
fbq('track', 'Search', { search_string: 'product name' })
```

### Custom Events

```typescript
// Track custom events
fbq('trackCustom', 'ContactFormSubmitted')
fbq('trackCustom', 'NewsletterSignup')
fbq('trackCustom', 'VideoWatched', { video_name: 'Product Demo' })
```

## TypeScript Support

Add type declarations for the `fbq` function:

```typescript
// src/types/meta-pixel.d.ts
declare global {
  interface Window {
    fbq: (...args: any[]) => void
  }
}

export {}
```

Then use it in your components:

```typescript
'use client'

const handleFormSubmit = () => {
  // Your form logic...

  // Track the conversion
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead')
  }
}
```

## Environment Variable (Optional)

For better security and flexibility, store the Pixel ID in environment variables:

```bash
# .env.local
NEXT_PUBLIC_META_PIXEL_ID=1212292087294812
```

Then update the component:

```typescript
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
```

## Getting Your Pixel ID

1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to **Events Manager**
3. Click **Connect Data Sources** → **Web**
4. Select **Meta Pixel** and follow the setup wizard
5. Copy your Pixel ID (a 15-16 digit number)

## Verifying Installation

1. Install the [Meta Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/meta-pixel-helper/)
2. Visit your website
3. Click the extension icon to verify the pixel is firing correctly

---

**Note:** Ensure you comply with GDPR/CCPA regulations by obtaining user consent before tracking in regions where required.
