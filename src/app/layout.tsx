import type { Metadata } from 'next'
import { Montserrat, Playfair_Display, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import BackgroundMusic from '@/components/BackgroundMusic'

// Gotham family requested; Gotham is licensed/not on Google Fonts, so we use
// Montserrat — the closest free geometric match. Keeps the --font-plus-jakarta
// CSS var name so existing globals.css references keep working.
const plusJakarta = Montserrat({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
})

const notoDevanagari = Noto_Sans_Devanagari({
  variable: '--font-devanagari',
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BookMyTabarruk — बुकमाई तबरुक',
  description: 'Book Tabarruk for your Majlis with ease. Niyaz · Barkat · Ibaadat.',
  icons: { icon: '/new-logo.jpeg', apple: '/new-logo.jpeg' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0e3d2a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${playfair.variable} ${notoDevanagari.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black">
        <Providers>
          {children}
          <BackgroundMusic />
          <Toaster richColors position="bottom-center" duration={1500} />
        </Providers>
      </body>
    </html>
  )
}