import { getCachedGlobal } from '@/utilities/getGlobals'
import { Link } from '@/i18n/routing'
import React from 'react'

import type { Footer } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import Image from 'next/image'
import { Media } from '@/payload-types'
import { TypedLocale } from 'payload'

export async function Footer({ locale }: { locale: TypedLocale }) {
  const footerData: Footer = await getCachedGlobal('footer', 1, locale)()

  const navItems = footerData?.navItems || []

  return (
    <footer 
      className="mt-auto border-t border-border bg-black dark:bg-card text-white flex flex-col justify-center items-center py-8" 
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container py-8 gap-8 flex flex-col lg:flex-row md:justify-between">
        <div className="flex flex-col justify-center items-start gap-6">
          <Link 
            className="flex items-center" 
            href="/" 
            aria-label="Go to homepage"
          >
            <Logo className="w-[19rem] h-20 max-w-none aspect-auto" />
          </Link>

          {/* <div className="flex flex-row justify-center items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-white hover:underline hover:opacity-90 transition-all duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookie-policy"
              className="text-white hover:underline hover:opacity-90 transition-all duration-300"
            >
              Cookie Policy
            </Link>
          </div> */}
        </div>
        <div className="flex flex-col items-start md:flex-row gap-4 md:items-center">
          <div className="flex flex-col justify-center items-start gap-7">
            <div className="flex flex-col justify-center items-start gap-6">
              <h2 className="text-white uppercase font-semibold text-base">Contacts</h2>

              <address className="flex flex-col justify-center items-start gap-1 not-italic">
                <p className="text-white max-w-[20rem]">
                  RABAT-Agdal, 457, Avenue Hassan II, Résidence Mariam, Magasin n° 11
                </p>
                <a href="tel:01444880676" className="text-white hover:underline focus:underline focus:outline-offset-4" aria-label="Call us at 0 1 4 4 4 8 8 0 6 7 6">01444880676</a>
              </address>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between items-start gap-7">
          <div className="flex flex-col justify-between items-start gap-7">
            <h2 className="text-white uppercase font-semibold text-base">Follow Us</h2>

            <nav aria-label="Social media links" className="grid grid-cols-3 gap-y-4 gap-x-10">
              {footerData?.socials?.map(({ link, icon }, i) => {
                const socialName = (icon as Media)?.alt || `Social link ${i + 1}`;
                return (
                  <Link
                    href={link?.url || ''}
                    key={i}
                    className="hover:scale-110 transition-all duration-300 focus:outline-offset-4"
                    aria-label={`Visit our ${socialName} page`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Image
                      src={(icon as Media)?.url || ''}
                      width={24}
                      height={24}
                      alt={socialName}
                      className="invert"
                    />
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
      <p className="text-white p-4 text-center">
        © {new Date().getFullYear()} Copyright, all rights reserved. Powered by{' '}
        <Link 
          href={'https://webloo.com/'} 
          className="underline cursor-pointer hover:opacity-80 focus:outline-offset-4"
          aria-label="Visit Webloo website"
          rel="noopener noreferrer"
          target="_blank"
        >
          Webloo
        </Link>
      </p>
    </footer>
  )
}
