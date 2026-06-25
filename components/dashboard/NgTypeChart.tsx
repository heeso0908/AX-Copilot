'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { NgTypeCount } from '@/types/manufacturing'

interface NgTypeChartProps {
  data: NgTypeCount[]
}

const COLORS = ['#c07a7a', '#c4895f', '#c4a838', '#7ba7cc', '#9b8ec4', '#5aab8c']

export default function NgTypeChart({ data }: NgTypeChartProps) {
  const chartData = data.map((d) => ({ name: d.ng_type, value: d.count }))
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">불량 유형 분포</h3>
        <p className="text-xs text-slate-400 mt-0.5">NG Type별 발생 건수 비율</p>
      </div>
      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-gray-300 text-sm">
          불량 데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="42%"
              cy="50%"
              innerRadius={55}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${Number(value)}건 (${((Number(value) / total) * 100).toFixed(1)}%)`, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
