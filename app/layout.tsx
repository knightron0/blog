import './global.css'
import type { Metadata } from 'next'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { IBM_Plex_Sans } from 'next/font/google'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Sarthak Mangla',
    template: '%s | Sarthak Mangla',
  },
  icons: {
    icon: [
      { url: '/favicon-tahoe-painted.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon-tahoe-painted-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-tahoe-painted-32.png', type: 'image/png', sizes: '32x32' },
    ],
  },
  description: "",
  openGraph: {
    title: 'Sarthak Mangla',
    description: '',
    url: baseUrl,
    siteName: 'Sarthak Mangla',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx('text-black bg-[#FCF6F1]')}
    >
      <body className={`antialiased max-w-3xl mx-4 mt-8 lg:mx-auto ${ibmPlexSans.className}`}>
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  )
}
