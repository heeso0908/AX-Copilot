import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { detectAnomalies } from '@/lib/data/anomalyRules'
import { ProcessLot } from '@/types/manufacturing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lots: ProcessLot[] = body.lots || []

    if (lots.length === 0) {
      return NextResponse.json({ error: 'No lots provided' }, { status: 400 })
    }

    const anomalies = detectAnomalies(lots)

    // Save to Supabase if configured
    const supabase = createServerClient()
    if (supabase && body.dataset_upload_id) {
      const { error } = await supabase.from('anomaly_events').insert(
        anomalies.map((a) => ({
          ...a,
          dataset_upload_id: body.dataset_upload_id,
        }))
      )
      if (error) {
        console.error('Error saving anomalies:', error)
      }
    }

    return NextResponse.json({
      success: true,
      anomalies,
      count: anomalies.length,
      highCount: anomalies.filter((a) => a.severity === 'High').length,
      mediumCount: anomalies.filter((a) => a.severity === 'Medium').length,
      lowCount: anomalies.filter((a) => a.severity === 'Low').length,
    })
  } catch (error) {
    console.error('Detect anomalies error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Detection failed' },
      { status: 500 }
    )
  }
}
