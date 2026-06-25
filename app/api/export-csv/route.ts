import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import Papa from 'papaparse'

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'synthetic_manufacturing_process_3days.json')
    const data: Record<string, unknown>[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    const csv = Papa.unparse(data)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="synthetic_manufacturing_process_3days.csv"',
      },
    })
  } catch {
    return NextResponse.json({ error: '파일 읽기 실패' }, { status: 500 })
  }
}
