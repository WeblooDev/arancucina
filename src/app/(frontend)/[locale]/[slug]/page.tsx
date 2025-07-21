import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, TypedLocale, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { cn } from '@/utilities/ui'

export async function generateStaticParams() {
  const locales = ['en', 'fr'] as const
  const payload = await getPayload({ config: configPromise })
  
  // Get pages for each locale
  const allParams = await Promise.all(
    locales.map(async (locale) => {
      const pages = await payload.find({
        collection: 'pages',
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
          params: { locale, slug: slug! }
        }))
    })
  )

  // Flatten the array of arrays
  return allParams.flat()
}

interface PageParams {
  slug?: string
  locale: TypedLocale
}

type Args = {
  params: Promise<PageParams>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home', locale } = await paramsPromise
  const url = '/' + slug

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug,
    locale,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero: rawHero, layout } = page

  // Transform hero to match expected type
  const hero = rawHero
    ? {
        ...rawHero,
        type: (rawHero.type || 'none') as
          | 'none'
          | 'highImpact'
          | 'mediumImpact'
          | 'lowImpact'
          | 'productHero',
        images: rawHero.images?.map(({ image }) => ({ image })) || undefined,
        richText: rawHero.richText || undefined,
      }
    : { type: 'none' as const }

  return (
    <article
      className={cn('pt-16', {
        'pt-0': hero,
      })}
    >
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} locale={locale} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home', locale } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
    locale,
  })

  // Construct the path for this page
  // For home page, use root path; otherwise use the slug
  const path = slug === 'home' ? '/' : `/${slug}`

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
    collection: 'pages',
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
