import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import path from 'path'
import fs from 'fs'

export async function GET() {
  const supabase = createServerClient()

  if (supabase) {
    const { data, error } = await supabase
      .from('process_lots')
      .select('*')
      .order('timestamp', { ascending: true })
      .limit(2000)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [], {
      headers: { 'X-Data-Source': 'supabase' },
    })
  }

  // Supabase 미설정 → 로컬 JSON 폴백
  try {
    const dataPath = path.join(process.cwd(), 'data', 'synthetic_manufacturing_process_3days.json')
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    return NextResponse.json(data, {
      headers: { 'X-Data-Source': 'local' },
    })
  } catch {
    return NextResponse.json({ error: '로컬 데이터 로드 실패' }, { status: 500 })
  }
}
