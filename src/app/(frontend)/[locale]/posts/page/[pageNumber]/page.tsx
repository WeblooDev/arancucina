import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import PageClient from './page.client'

export const revalidate = 600

interface PageParams {
  pageNumber: string
  locale: string
}

type Args = {
  params: Promise<PageParams>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber, locale } = await paramsPromise
  const { getServerSideURL } = await import('@/utilities/getURL')
  
  // Construct the canonical URL for paginated posts page
  const serverUrl = getServerSideURL()
  const localePath = locale !== 'en' ? `/${locale}` : ''
  const canonicalUrl = `${serverUrl}${localePath}/posts/page/${pageNumber}`
  
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ''}`,
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)
  
  // Use Array.from with mapping function instead of manual array building
  return Array.from({ length: totalPages }, (_, i) => ({
    pageNumber: String(i + 1)
  }))
}
