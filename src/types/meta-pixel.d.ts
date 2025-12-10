// Meta (Facebook) Pixel type declarations
declare global {
  interface Window {
    fbq: (
      type: 'track' | 'trackCustom' | 'init',
      eventName: string,
      params?: Record<string, unknown>,
    ) => void
    _fbq: typeof fbq
  }
}

export {}
