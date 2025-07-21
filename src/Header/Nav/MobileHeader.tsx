'use client'

import type React from 'react'
import { useState } from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Media } from '@/components/Media'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'
import { Link } from '@/i18n/routing'
import { LocaleSwitcher } from '../Component.client'

export const MobileHeaderNav: React.FC<{
  data: HeaderType
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  isScrolled: boolean
}> = ({ data, isOpen, setIsOpen, isScrolled }) => {
  const navItems = data?.navItems || []
  const path = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedSubItems, setExpandedSubItems] = useState<Set<string>>(new Set())

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const toggleSubItem = (key: string) => {
    const newExpanded = new Set(expandedSubItems)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSubItems(newExpanded)
  }

  return (
    <div className="z-30 md:hidden">
      <div className="container flex items-center justify-between fixed top-0 left-0 right-0 z-40 bg-white py-8 px-6">
        <Link href="/" className="z-40" aria-label="Home page">
          <Logo
            loading="eager"
            priority="high"
            className={cn(' !z-40 aspect-auto w-20', {
              invert: path !== '/' || isScrolled,
              'invert-0': isOpen,
            })}
          />
        </Link>
        <button
          className={cn('top-12 right-8 z-40 p-2 focus:outline-none focus:ring-2 focus:ring-primary rounded', {
            '!right-[2.5rem]': isOpen,
          })}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? (
            <X width={24} height={24} className="w-5 text-black transition-all duration-300" />
          ) : (
            <Image
              src="/images/hamMenu.svg"
              alt="Menu"
              width={24}
              height={24}
              className={cn('w-5 text-primary transition-all duration-300', {
                invert: (!isScrolled && !isOpen && path === '/') || path === '/',
                'invert-0': isScrolled || isOpen || path !== '/',
              })}
            />
          )}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className={cn(
          'fixed top-0 h-screen w-full bg-white transition-all duration-300 overflow-y-auto',
          {
            'right-0': isOpen,
            'right-full': !isOpen,
          },
        )}
        aria-hidden={!isOpen}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="pt-20 pb-8 px-6">
          {navItems.map(({ link, sublinks }, i) => {
            const hasSublinks = sublinks && sublinks.length > 0
            const isExpanded = expandedItems.has(i)

            return (
              <div key={i} className="border-b border-gray-100 last:border-b-0">
                {hasSublinks ? (
                  <div
                    className="flex items-center justify-between py-4 cursor-pointer"
                    onClick={() => toggleItem(i)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleItem(i);
                      }
                    }}
                  >
                    <p
                      className={cn('text-lg flex-1 font-medium', {
                        'text-black font-medium': path === link.url,
                        'text-gray-700': path !== link.url,
                      })}
                      id={`nav-item-${i}`}
                    >
                      {link.label}
                    </p>
                    {hasSublinks && (
                      <button onClick={() => toggleItem(i)} className="p-2 -mr-2">
                        <ChevronDown
                          className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', {
                            'rotate-180': isExpanded,
                          })}
                        />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between py-4"
                    onClick={() => setIsOpen(false)}
                  >
                    <CMSLink
                      {...link}
                      appearance="link"
                      className={cn('text-lg font-medium flex-1', {
                        'text-black': path === link.url,
                        'text-gray-600': path !== link.url,
                      })}
                      onClick={() => !hasSublinks && setIsOpen(false)}
                    />
                    {hasSublinks && (
                      <button onClick={() => toggleItem(i)} className="p-2 -mr-2">
                        <ChevronDown
                          className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', {
                            'rotate-180': isExpanded,
                          })}
                        />
                      </button>
                    )}
                  </div>
                )}

                {hasSublinks && (
                  <div
                    className={cn('overflow-hidden transition-all duration-300', {
                      'max-h-0': !isExpanded,
                      'max-h-[1000px]': isExpanded,
                    })}
                  >
                    <div className="pl-4 pb-4">
                      {sublinks?.map(({ link: subLink, types }, j) => {
                        const hasTypes = types && types.length > 0
                        const subKey = `${i}-${j}`
                        const isSubExpanded = expandedSubItems.has(subKey)

                        return (
                          <div key={j} className="mb-3 last:mb-0">
                            {hasTypes ? (
                              <div
                                className="flex items-center justify-between py-2"
                                onClick={() => toggleSubItem(subKey)}
                              >
                                <p
                                  className={cn('text-lg flex-1 font-medium', {
                                    'text-black font-medium': path === subLink.url,
                                    'text-gray-500': path !== subLink.url,
                                  })}
                                >
                                  {subLink.label}
                                </p>
                                {hasTypes && (
                                  <button
                                    onClick={() => toggleSubItem(subKey)}
                                    className="p-1 -mr-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                                    aria-label={isSubExpanded ? `Collapse submenu` : `Expand submenu`}
                                    aria-expanded={isSubExpanded}
                                  >
                                    <ChevronRight
                                      className={cn(
                                        'w-3 h-3 text-gray-400 transition-transform duration-200',
                                        {
                                          'rotate-90': isSubExpanded,
                                        },
                                      )}
                                    />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div
                                className="flex items-center justify-between py-2"
                                onClick={() => setIsOpen(false)}
                              >
                                <CMSLink
                                  {...subLink}
                                  appearance="link"
                                  className={cn('text-lg flex-1 font-medium', {
                                    'text-black font-medium': path === subLink.url,
                                    'text-gray-500': path !== subLink.url,
                                  })}
                                  onClick={() => setIsOpen(false)}
                                />
                              </div>
                            )}

                            {hasTypes && (
                              <div
                                className={cn('overflow-hidden transition-all duration-300', {
                                  'max-h-0': !isSubExpanded,
                                  'max-h-[500px]': isSubExpanded,
                                })}
                              >
                                <div className="pl-4 space-y-3">
                                  {types.map((type, k) => (
                                    <Link
                                      href={type.link.url!}
                                      key={k}
                                      className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
                                      aria-label={`View ${type.link.label}`}
                                    >
                                      {type.image && (
                                        <div className="w-12 h-12 rounded-lg relative overflow-hidden flex-shrink-0">
                                          <Media
                                            resource={type.image}
                                            imgClassName="object-cover w-full h-full"
                                            fill
                                            alt={`${type.link.label} thumbnail`}
                                            aria-hidden={true}
                                          />
                                        </div>
                                      )}
                                      <CMSLink
                                        {...type.link}
                                        appearance="link"
                                        className={cn('text-lg flex-1 font-medium', {
                                          'text-black font-medium': path === type.link.url,
                                          'text-gray-500': path !== type.link.url,
                                        })}
                                        onClick={() => setIsOpen(false)}
                                      />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="px-6">
          <LocaleSwitcher />
        </div>
      </nav>
    </div>
  )
}
