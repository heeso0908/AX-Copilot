import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { createServerClient } from '@/lib/supabase/server'
import { transformRawData } from '@/lib/data/transform'

export async function POST() {
  const supabase = createServerClient()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 }
    )
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'synthetic_manufacturing_process_3days.json')
    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    const lots = transformRawData(raw)

    // Create a dataset upload record
    const { data: upload, error: uploadError } = await supabase
      .from('dataset_uploads')
      .insert({
        file_name: 'synthetic_manufacturing_process_3days.json',
        file_size: fs.statSync(dataPath).size,
        row_count: lots.length,
        status: 'processing',
      })
      .select()
      .single()

    if (uploadError) throw uploadError

    // Insert lots in batches
    const batchSize = 50
    for (let i = 0; i < lots.length; i += batchSize) {
      const batch = lots.slice(i, i + batchSize).map((lot) => ({
        ...lot,
        dataset_upload_id: upload.id,
      }))

      const { error: insertError } = await supabase.from('process_lots').insert(batch)
      if (insertError) throw insertError
    }

    // Update upload status
    await supabase
      .from('dataset_uploads')
      .update({ status: 'completed' })
      .eq('id', upload.id)

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${lots.length} records`,
      rowCount: lots.length,
      uploadId: upload.id,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seed failed' },
      { status: 500 }
    )
  }
}
