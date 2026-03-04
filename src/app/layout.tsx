import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Community Tax Partner Portal',
  description: 'Partner portal for Community Tax referral program',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
