import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Retirement Planner | Nu Vista Analytics',
  description:
    'Plan your Canadian retirement with RRSP, TFSA, CPP/OAS projections and Monte Carlo simulations. Built by Nu Vista Analytics.',
  keywords: ['retirement calculator', 'RRSP', 'TFSA', 'CPP', 'OAS', 'Canada', 'financial planning'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
