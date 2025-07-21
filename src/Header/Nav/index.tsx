'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Media } from '@/components/Media'
import { X } from 'lucide-react'

export const HeaderNav: React.FC<{
  data: HeaderType
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  isScrolled: boolean
}> = ({ data, isOpen, setIsOpen, isScrolled }) => {
  const navItems = data?.navItems || []
  const path = usePathname()

  return (
    <div className="z-30" role="navigation" aria-label="Main navigation">
      <button
        className={cn('absolute top-12 right-8 md:right-24 z-40', {
          '!right-[5.5rem] md:right-24': isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="main-navigation"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        {isOpen ? (
          <X
            width={24}
            height={24}
            className={cn('w-5 text-black transition-all duration-300', {})}
            aria-hidden="true"
          />
        ) : (
          <Image
            src="/images/hamMenu.svg"
            alt="Menu"
            width={24}
            height={24}
            className={cn('w-5 text-primary transition-all duration-300', {
              'invert ':
                (!isScrolled && !isOpen && (path === '/en' || path === '/fr')) ||
                path === '/en' ||
                path === '/fr',
              'invert-0': isScrolled || isOpen || (path !== '/en' && path !== '/fr'),
            })}
          />
        )}
      </button>
      <nav
        id="main-navigation"
        className={cn(
          'flex flex-col h-screen w-fit py-12 bg-white absolute top-0 gap-12 items-center justify-center transition-all duration-300 overflow-visible ',
          {
            '-right-0': isOpen,
            '-right-full': !isOpen,
          },
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex-1 flex flex-col justify-center items-center">
          {navItems.map(({ link, sublinks }, i) => {
            return (
              <div key={i} className="group z-20 py-6 w-full relative">
                <CMSLink
                  key={i}
                  {...link}
                  appearance="link"
                  className={cn('text-md hover:text-black px-16', {
                    'text-black font-medium': path === link.url,
                    'text-gray-700': path !== link.url, /* Improved contrast from gray-500 */
                  })}
                  aria-current={path === link.url ? 'page' : undefined}
                />
                {sublinks && sublinks?.length > 0 && (
                  <div 
                    className="absolute h-screen w-full hidden group-hover:right-full right-0 top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:flex flex-col justify-center items-end gap-6 bg-black text-white z-0 p-16 focus-within:opacity-100 focus-within:right-full"
                    role="menu"
                    aria-label={`${link.label} submenu`}
                  >
                    {sublinks?.map(({ link, types }, j) => (
                      <div
                        key={j}
                        className="group/sublink flex flex-col justify-center items-end" // Add relative here
                      >
                        <CMSLink
                          {...link}
                          appearance="link"
                          className={cn('text-base hover:text-white whitespace-nowrap block mb-1', {
                            'text-white font-medium': path === link.url,
                            'text-gray-200': path !== link.url, /* Improved contrast from gray-300 */
                          })}
                          aria-current={path === link.url ? 'page' : undefined}
                          role="menuitem"
                        />
                        {types && types.length > 0 && (
                          <div
                            className="
                               opacity-0 
                              group-hover/sublink:opacity-100
                              transition-all duration-300 ease-in-out 
                              mt-2 invisible group-hover/sublink:visible pl-4 h-0 group-hover/sublink:h-auto flex flex-col justify-center items-end !static
                            "
                          >
                            {types.map((type, k) => {
                              return (
                                <div key={k} className="group/sublink-link">
                                  <CMSLink
                                    {...type.link}
                                    appearance="link"
                                    className={cn(
                                      'text-xs hover:text-white whitespace-nowrap block mb-1 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1 focus:rounded',
                                      {
                                        'text-white font-medium': path === type.link.url,
                                        'text-gray-200': path !== type.link.url, /* Improved contrast from gray-300 */
                                      },
                                    )}
                                    aria-current={path === type.link.url ? 'page' : undefined}
                                    role="menuitem"
                                  />
                                  <div
                                    className="absolute top-0 right-0 group-hover/sublink-link:right-full focus-within:right-full"
                                    style={{ position: 'absolute' }}
                                  >
                                    <div className="h-screen w-[30vw] hidden relative right-0 top-0 opacity-0 group-hover/sublink-link:opacity-100 transition-all duration-300 group-hover/sublink-link:flex flex-col justify-end items-start gap-6 bg-black text-white z-0 p-12 focus-within:opacity-100 focus-within:flex">
                                      <Media
                                        resource={type.image}
                                        imgClassName="object-cover"
                                        fill
                                        alt={`${type.link.label} category image`}
                                        aria-hidden={true}
                                      />
                                      <div className="absolute inset-0 bg-black/30 z-20 h-full w-full" aria-hidden="true" />
                                      <p className="text-2xl font-bodoni text-white z-50" id={`category-title-${k}`}>
                                        {type.link.label}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
