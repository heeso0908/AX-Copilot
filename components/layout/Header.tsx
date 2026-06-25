'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/anomalies', label: '이상 탐지' },
    { href: '/reports', label: '분석 리포트' },
    { href: '/upload', label: '데이터 업로드' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-14 items-center px-6">
        <div className="flex items-center gap-2 mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900 hidden sm:block">
            Manufacturing AX
          </span>
          <span className="text-sm font-bold text-blue-600 hidden sm:block">Quality Copilot</span>
        </div>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden md:block">
            로컬 데이터 모드
          </span>
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
        </div>
      </div>
    </header>
  )
}
