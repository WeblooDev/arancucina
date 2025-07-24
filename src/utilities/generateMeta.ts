import type { Metadata } from 'next'

import type { Media, Page, Post, Config, Kitchen } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

/**
 * Get the full URL for an image, with fallback to default OG image
 */
const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null): string => {
  const serverUrl = getServerSideURL()
  const defaultOgImage = `${serverUrl}/website-template-OG.webp`

  // Return default if no image provided
  if (!image) return defaultOgImage

  // Handle object type image with URL
  if (typeof image === 'object' && image !== null && 'url' in image) {
    // Prefer OG size if available
    const ogUrl = image.sizes?.og?.url
    return ogUrl ? `${serverUrl}${ogUrl}` : `${serverUrl}${image.url}`
  }

  return defaultOgImage
}

interface GenerateMetaArgs {
  doc: Partial<Page> | Partial<Post> | Partial<Kitchen> | null
  locale?: string
  path?: string
}

/**
 * Generate metadata for pages, posts, and kitchens including canonical URLs
 */
export const generateMeta = async (args: GenerateMetaArgs): Promise<Metadata> => {
  const { doc, locale = 'en', path } = args

  let metaImage: Media | Config['db']['defaultIDType'] | null | undefined = undefined
  let metaTitle: string | null | undefined = undefined
  let metaDescription: string | null | undefined = undefined
  let slug: string | undefined = undefined

  // Handle Page and Post types
  if (doc && 'meta' in doc) {
    metaImage = doc.meta?.image
    metaTitle = doc.meta?.title
    metaDescription = doc.meta?.description

    // Handle slug safely
    if (doc.slug) {
      if (typeof doc.slug === 'string') {
        slug = doc.slug
      } else if (doc.slug && typeof doc.slug === 'object') {
        // Handle array-like objects safely
        try {
          const slugArray = Array.from(doc.slug as any)
          slug = slugArray.filter(Boolean).join('/')
        } catch (e) {
          // If conversion fails, use string representation or undefined
          slug = String(doc.slug) || undefined
        }
      }
    }
  }
  // Handle Kitchen type
  else if (doc && 'models' in doc) {
    metaImage = doc?.models?.mainImage
    metaTitle = doc?.models?.title
    metaDescription = doc?.models?.title // Using title as description since Kitchen doesn't have a dedicated description field

    // Handle slug for Kitchen type
    if (doc.slug && typeof doc.slug === 'string') {
      slug = doc.slug
    }
  }

  const ogImage = getImageURL(metaImage)

  const title = metaTitle ? `${metaTitle} | Aran Cucine` : 'Aran Cucine'

  // Construct the canonical URL
  const serverUrl = getServerSideURL()

  // Determine the path portion of the URL
  const canonicalPath = path
    ? // If a specific path is provided, use it
      path
    : // Otherwise construct from slug
      slug
      ? slug === 'home'
        ? ''
        : `/${slug}`
      : ''

  // Add locale prefix if not the default locale
  const localePath = locale !== 'en' ? `/${locale}` : ''
  const canonicalUrl = `${serverUrl}${localePath}${canonicalPath}`

  return {
    description: metaDescription,
    openGraph: mergeOpenGraph({
      description: metaDescription || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: canonicalPath,
    }),
    title,
    // Add canonical URL
    alternates: {
      canonical: canonicalUrl,
    },
  }
}
