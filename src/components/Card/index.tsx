'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import { Link } from '@/i18n/routing'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer focus-within:ring-2 focus-within:ring-primary',
        className,
      )}
      ref={card.ref}
      aria-labelledby={`card-title-${slug}`}
    >
      <div className="relative w-full">
        {!metaImage && <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground" aria-hidden="true">No image</div>}
        {metaImage && typeof metaImage !== 'string' && 
          <Media 
            resource={metaImage} 
            size="33vw" 
            alt={`Featured image for ${titleToUse || 'article'}`}
            role="img"
          />
        }
      </div>
      <div className="p-4">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { title: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3 id={`card-title-${slug}`}>
              <Link 
                className="not-prose text-foreground hover:text-primary focus:outline-none focus:underline" 
                href={href} 
                ref={link.ref}
                aria-label={`Read more about ${titleToUse}`}
              >
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && 
          <div className="mt-2">
            <p className="text-muted-foreground text-sm">{sanitizedDescription}</p>
          </div>
        }
      </div>
    </article>
  )
}
