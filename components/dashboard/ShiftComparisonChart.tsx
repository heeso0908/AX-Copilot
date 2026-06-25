'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ShiftComparison } from '@/types/manufacturing'

interface ShiftComparisonChartProps {
  data: ShiftComparison[]
}

const SHIFT_COLORS: Record<string, string> = {
  A: '#7ba7cc',
  B: '#5aab8c',
  C: '#c4895f',
}

export default function ShiftComparisonChart({ data }: ShiftComparisonChartProps) {
  const chartData = data.map((d) => ({
    교대: `${d.shift}조`,
    불량률: parseFloat((d.defect_rate * 100).toFixed(3)),
    lot_count: d.lot_count,
    shiftKey: d.shift,
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">교대별 불량률 비교</h3>
        <p className="text-xs text-slate-400 mt-0.5">A / B / C 조별 불량률 현황</p>
      </div>
      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-gray-300 text-sm">
          데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="교대" tick={{ fontSize: 13, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(value, _, props) => [
                `${Number(value).toFixed(3)}% (${props.payload?.lot_count}건)`,
                '불량률',
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
              labelStyle={{ color: '#475569', fontWeight: 600 }}
            />
            <Bar dataKey="불량률" radius={[5, 5, 0, 0]} maxBarSize={72}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={SHIFT_COLORS[entry.shiftKey] || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
