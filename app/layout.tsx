import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Manufacturing AX Quality Copilot',
  description: 'AI-powered manufacturing quality analysis and anomaly detection',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white">
          {children}
        </main>
      </body>
    </html>
  )
}
