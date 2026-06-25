'use client'

import { useState } from 'react'
import { ProcessLot } from '@/types/manufacturing'

interface ProcessDataTableProps {
  lots: ProcessLot[]
  pageSize?: number
}

function formatTs(ts: string): string {
  // "2026-06-22T00:00:00" → "06-22\n00:00"
  try {
    const d = new Date(ts)
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${mo}-${dd}\n${hh}:${mm}`
  } catch {
    return ts
  }
}

const COLS = ['시각', 'LOT ID', '장비', '공정', '교대', '불량률', '파티클', 'NG 유형', '이상'] as const

export default function ProcessDataTable({ lots, pageSize = 25 }: ProcessDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(lots.length / pageSize)
  const startIdx = (currentPage - 1) * pageSize
  const pageData = lots.slice(startIdx, startIdx + pageSize)

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-slate-900">최근 LOT 현황</h3>
        <span className="text-xs text-gray-400">
          {Math.min(startIdx + pageSize, lots.length)} / {lots.length.toLocaleString()}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {COLS.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-300 text-sm">
                  데이터가 없습니다
                </td>
              </tr>
            ) : (
              pageData.map((lot, i) => (
                <tr
                  key={`${lot.lot_id}-${i}`}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* timestamp */}
                  <td className="px-4 py-2.5 text-[11px] text-gray-500 font-mono whitespace-pre-line leading-tight">
                    {formatTs(lot.timestamp)}
                  </td>
                  {/* lot_id */}
                  <td className="px-4 py-2.5 font-mono text-xs text-blue-600 hover:underline cursor-default">
                    {lot.lot_id}
                  </td>
                  {/* equipment_id */}
                  <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">
                    {lot.equipment_id}
                  </td>
                  {/* process_step */}
                  <td className="px-4 py-2.5 text-xs text-gray-500">{lot.process_step}</td>
                  {/* shift */}
                  <td className="px-4 py-2.5 text-xs text-gray-600">{lot.shift}</td>
                  {/* defect_rate */}
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-semibold tabular-nums ${
                      lot.defect_rate > 0.05 ? 'text-rose-500' :
                      lot.defect_rate > 0.02 ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      {(lot.defect_rate * 100).toFixed(2)}%
                    </span>
                  </td>
                  {/* particle */}
                  <td className="px-4 py-2.5 text-xs tabular-nums text-slate-600">
                    {lot.particle_count.toLocaleString()}
                  </td>
                  {/* ng_type */}
                  <td className="px-4 py-2.5 text-xs text-gray-500">
                    {lot.ng_type || <span className="text-gray-300">—</span>}
                  </td>
                  {/* anomaly */}
                  <td className="px-4 py-2.5">
                    {lot.anomaly_flag === 1 ? (
                      <span className="inline-block text-[11px] font-semibold bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-2 py-0.5">
                        이상
</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {startIdx + 1}–{Math.min(startIdx + pageSize, lots.length)} / {lots.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)) }}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            <span className="px-3 text-xs text-gray-500">{currentPage} / {totalPages}</span>
            <button
              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)) }}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
