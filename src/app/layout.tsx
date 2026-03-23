import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'

const sarabun = Sarabun({
  subsets: ['latin', 'thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'Zabb AI',
  description: 'AI Application powered by Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} antialiased`}>{children}</body>
    </html>
  )
}
