import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, TypedLocale, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { cn } from '@/utilities/ui'

export async function generateStaticParams() {
  const locales = ['en', 'fr'] as const
  const payload = await getPayload({ config: configPromise })

  // Get pages for each locale
  const allParams = await Promise.all(
    locales.map(async (locale) => {
      const pages = await payload.find({
        collection: 'products',
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        select: {
          slug: true,
        },
        locale,
      })

      return pages.docs
        ?.filter((doc: { slug?: string | null }) => {
          return doc.slug && doc.slug !== 'home'
        })
        .map(({ slug }) => ({
          params: { locale, slug: slug! },
        }))
    }),
  )

  // Flatten the array of arrays
  return allParams.flat()
}

interface PageParams {
  slug?: string
  locale?: TypedLocale
}

type Args = {
  params: Promise<PageParams>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home', locale } = await paramsPromise
  const url = '/products' + slug

  const page: RequiredDataFromCollectionSlug<'products'> | null = await queryPageBySlug({
    slug,
    locale: locale || 'en', // Provide default locale
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article
      className={cn('pt-16', {
        'pt-0': hero,
      })}
    >
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} locale={locale as TypedLocale} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home', locale } = await paramsPromise
  if (!locale) {
    throw new Error('Locale is required')
  }
  const page = await queryPageBySlug({
    slug,
    locale,
  })

  // Construct the path for this product
  const path = `/products/${slug}`

  return generateMeta({
    doc: page,
    locale,
    path,
  })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: TypedLocale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
    locale,
  })

  return result.docs?.[0] || null
})
