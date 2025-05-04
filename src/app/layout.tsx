import './globals.css'
import Navbar from './components/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bucket List App',
  description: 'Live intentionally. Track what matters.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#202123] text-white font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  )
}