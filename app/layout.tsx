import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import SessionCleanup from '@/components/SessionCleanup'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reservasi Lapangan Olahraga',
  description: 'Platform reservasi lapangan olahraga terbaik di Ciledug',
  icons: {
    icon: '/images/logo gor puri beta.png',
    shortcut: '/images/logo gor puri beta.png',
    apple: '/images/logo gor puri beta.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Check if current page is login, register, or admin
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Auto logout saat close tab/browser (tidak saat refresh) */}
        <SessionCleanup />
        {isAuthPage ? (
          <div className="min-h-screen">
            {children}
          </div>
        ) : isAdminPage ? (
          <div className="min-h-screen">
            {children}
          </div>
        ) : (
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  )
}
