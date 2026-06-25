import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createServerClient } from '@/lib/supabase/server'
import { transformRawData } from '@/lib/data/transform'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const csvText = await file.text()

    // Parse CSV
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: `CSV parse error: ${parsed.errors[0].message}` },
        { status: 400 }
      )
    }

    const lots = transformRawData(parsed.data)

    // Try Supabase upload
    const supabase = createServerClient()
    if (supabase) {
      const { data: upload, error: uploadError } = await supabase
        .from('dataset_uploads')
        .insert({
          file_name: file.name,
          file_size: file.size,
          row_count: lots.length,
          status: 'processing',
        })
        .select()
        .single()

      if (uploadError) throw uploadError

      const batchSize = 50
      for (let i = 0; i < lots.length; i += batchSize) {
        const batch = lots.slice(i, i + batchSize).map((lot) => ({
          ...lot,
          dataset_upload_id: upload.id,
        }))
        const { error: insertError } = await supabase.from('process_lots').insert(batch)
        if (insertError) throw insertError
      }

      await supabase
        .from('dataset_uploads')
        .update({ status: 'completed' })
        .eq('id', upload.id)

      return NextResponse.json({
        success: true,
        message: `${lots.length}건을 Supabase에 업로드했습니다`,
        rowCount: lots.length,
        uploadId: upload.id,
      })
    }

    // No Supabase - just return parse result
    return NextResponse.json({
      success: true,
      message: `${lots.length}건 파싱 완료 (Supabase 미설정 - 로컬 모드)`,
      rowCount: lots.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
