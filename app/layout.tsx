import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Canadian Retirement Planner | Nu Vista Analytics',
  description:
    'Plan your Canadian retirement with RRSP, TFSA, CPP/OAS projections and Monte Carlo simulations. Built by Nu Vista Analytics.',
  keywords: ['retirement calculator', 'RRSP', 'TFSA', 'CPP', 'OAS', 'Canada', 'financial planning'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
