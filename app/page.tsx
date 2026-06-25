import Link from 'next/link'

const features = [
  {
    href: '/dashboard',
    icon: (
      <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: '대시보드',
    desc: 'KPI · 시간대/장비/교대별 불량률 추이',
  },
  {
    href: '/anomalies',
    icon: (
      <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    title: '이상 탐지',
    desc: '룰 기반 이상 탐지 · 원인 후보 · 권장 조치',
  },
  {
    href: '/reports',
    icon: (
      <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: '분석 리포트',
    desc: '발생 현황 / 원인 / 조치 / 재발 방지 체크리스트',
  },
  {
    href: '/upload',
    icon: (
      <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: '데이터 업로드',
    desc: 'CSV 업로드 미리보기 · Supabase 연동 준비',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col p-10 max-w-4xl">
      {/* breadcrumb */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
          Portfolio · Manufacturing AX
        </span>
      </div>

      {/* hero */}
      <h1 className="text-5xl font-extrabold leading-tight text-slate-900 mb-2">
        Manufacturing AX
      </h1>
      <h1 className="text-5xl font-extrabold leading-tight text-blue-600 mb-6">
        Quality Copilot
      </h1>
      <p className="text-base text-slate-500 leading-relaxed max-w-xl mb-8">
        가상 제조 공정 LOT 데이터를 기반으로 불량률, 장비별 이상, 공정 조건별 위험도를 시각화하고,<br />
        룰 기반 또는 AI 리포트로 원인 후보와 권장 조치를 자동 정리합니다.
      </p>

      {/* CTA buttons */}
      <div className="flex items-center gap-3 mb-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          대시보드 열기 →
        </Link>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          샘플 리포트 보기
        </Link>
      </div>

      {/* feature cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="mb-3">{f.icon}</div>
            <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">
              {f.title}
            </div>
            <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
          </Link>
        ))}
      </div>

      {/* info bar */}
      <div className="rounded-xl border border-gray-200 px-5 py-3.5">
        <p className="text-xs text-gray-500">
          현재 모드:{' '}
          <code className="font-mono font-semibold text-slate-700 bg-gray-100 px-1.5 py-0.5 rounded">LOCAL JSON</code>
          {' · '}Supabase 환경변수 설정 시 DB 모드로 전환됩니다.
        </p>
      </div>
    </div>
  )
}
