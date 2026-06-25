'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { ParticleCountPoint } from '@/types/manufacturing'

interface Props { data: ParticleCountPoint[] }

export default function ParticleCountChart({ data }: Props) {
  const sampled = data.filter((_, i) => i % 2 === 0) // 200점 → 100점
  const chartData = sampled.map((d) => ({
    label: d.timestamp.slice(5, 16).replace('T', ' '),
    파티클: d.particle_count,
  }))
  const tickInterval = Math.max(1, Math.floor(chartData.length / 6))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-1">
        <h3 className="text-base font-bold text-slate-900">파티클 수 추이</h3>
        <p className="text-xs text-slate-400 mt-0.5">단위: 개</p>
      </div>
      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-gray-300 text-sm">데이터가 없습니다</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 12, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="particleFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4b5563" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#4b5563" stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(v) => [Number(v).toLocaleString(), '파티클 수']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              labelStyle={{ color: '#475569', fontWeight: 600, fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="파티클"
              stroke="#c07a7a"
              strokeWidth={1.5}
              fill="url(#particleFill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
