import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'synthetic_manufacturing_process_3days.json')
    const raw = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to read local data:', error)
    return NextResponse.json({ error: 'Failed to load local data' }, { status: 500 })
  }
}
