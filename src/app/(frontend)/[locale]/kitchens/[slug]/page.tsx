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
import PageClient from './page.client'
import { Media } from '@/components/Media'

import { Product } from '@/payload-types'
import { Link } from '@/i18n/routing'

export async function generateStaticParams() {
  const locales = ['en', 'fr'] as const
  const payload = await getPayload({ config: configPromise })

  // Get pages for each locale
  const allParams = await Promise.all(
    locales.map(async (locale) => {
      const pages = await payload.find({
        collection: 'kitchens',
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
  const { slug = 'home' } = await paramsPromise
  const url = '/kitchens' + slug

  const page: RequiredDataFromCollectionSlug<'kitchens'> | null = await queryPageBySlug({
    slug,
  })

  // We don't use homeStatic here since it's a Page type and not a Kitchen type
  if (!page) {
    return <PayloadRedirects url={url} />
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { title, products } = page

  return (
    <article
      className={cn('pt-16  mt-[6.4rem]', {
        'pt-0': title,
      })}
    >
      {/* <PageClient /> */}
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="w-full heading-bg flex flex-col justify-center items-center containe px-16 py-8 gap-4 textured">
        <h1 className="text-5xl font-bodoni font-normal text-white">{title}</h1>
      </div>
      <div className="flex flex-col gap-16 justify-center items-center my-16">
        {products.map((product) => {
          if (typeof product === 'string') return null
          return (
            <Link
              href={`/products/${product.slug}`}
              key={product.id}
              className="w-full h-[50vh] relative flex flex-col justify-end items-end container p-0 group"
            >
              <div className="w-[90%] bg-black px-16 py-6 translate-y-5 flex justify-start items-center z-[4]">
                <h2 className="text-3xl font-bodoni font-normal text-white">{product.title}</h2>
              </div>
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <Media
                  imgClassName="object-cover z-0 group-hover:scale-110 transition-all duration-300"
                  resource={product.mainImage}
                  fill
                />
              </div>
              <div className="inset-0 absolute z-[3] bg-black opacity-0 group-hover:opacity-30 transition-all duration-300 m-3"></div>
              <p className="text-white text-2xl font-bold w-full h-full inset-0 absolute z-[3] flex justify-center items-center uppercase opacity-0 group-hover:opacity-100 transition-all duration-300">
                {product.title}
              </p>
            </Link>
          )
        })}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home', locale } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  // Construct the path for this page
  const path = `/kitchens/${slug}`

  return generateMeta({ 
    doc: page,
    locale,
    path
  })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'kitchens',
    draft,
    depth: 2,
    limit: 2,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
