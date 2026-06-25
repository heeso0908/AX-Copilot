'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

interface DefectTrendChartProps {
  data: { label: string; 불량률: number; lot_count: number }[]
}

export default function DefectTrendChart({ data }: DefectTrendChartProps) {
  // X축 레이블: 6포인트마다만 표시해 겹침 방지
  const tickInterval = Math.max(1, Math.floor(data.length / 8))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-1">
        <h3 className="text-base font-bold text-slate-900">불량률 추이</h3>
        <p className="text-xs text-slate-400 mt-0.5">시간 단위 집계 불량률</p>
      </div>
      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-gray-300 text-sm">데이터가 없습니다</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: -4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
              tickFormatter={(v: string) => v.slice(5)} // "06-22 09:00"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(3)}%`, '불량률']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.05)' }}
              labelStyle={{ color: '#475569', fontWeight: 600, fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="불량률"
              stroke="#7ba7cc"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#5d8fb8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
