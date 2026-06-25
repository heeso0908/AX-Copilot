'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Papa from 'papaparse'

interface ParsedRow { [key: string]: string }
type UploadResult = { success: boolean; message: string; rowCount?: number }

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [seedResult, setSeedResult] = useState<UploadResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setUploadResult(null)
    setParseError(null)
    Papa.parse<ParsedRow>(selected, {
      header: true,
      skipEmptyLines: true,
      preview: 10,
      complete: (results) => {
        if (results.errors.length > 0) { setParseError(results.errors[0].message); return }
        setHeaders(results.meta.fields || [])
        setPreview(results.data)
      },
      error: (err: Error) => setParseError(err.message),
    })
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setUploadResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      setUploadResult(res.ok
        ? { success: true, message: data.message || '업로드 완료', rowCount: data.rowCount }
        : { success: false, message: data.error || '업로드 실패' })
    } catch (err) {
      setUploadResult({ success: false, message: err instanceof Error ? err.message : '업로드 실패' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSeed() {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      setSeedResult(res.ok
        ? { success: true, message: data.message || '시드 완료', rowCount: data.rowCount }
        : { success: false, message: data.error || '시드 실패' })
    } catch (err) {
      setSeedResult({ success: false, message: err instanceof Error ? err.message : '시드 실패' })
    } finally {
      setSeeding(false)
    }
  }

  function handleReset() {
    setFile(null); setPreview([]); setHeaders([])
    setUploadResult(null); setParseError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">데이터 업로드</h1>
        <p className="text-sm text-slate-500 mt-1">CSV 파일 업로드 · Supabase 연동 시 DB에 자동 저장</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CSV 다운로드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <h3 className="text-sm font-bold text-slate-900">샘플 CSV 다운로드</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            가상 제조 공정 3일치 데이터(200건)를<br />CSV로 다운로드합니다.
          </p>
          <a
            href="/api/export-csv"
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV 다운로드
          </a>
        </div>

        {/* Supabase 시드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <h3 className="text-sm font-bold text-slate-900">Supabase 시드 삽입</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            로컬 JSON 데이터를 Supabase DB에<br />직접 삽입합니다. (환경변수 설정 필요)
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {seeding ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                삽입 중...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                시드 삽입
              </>
            )}
          </button>
          {seedResult && (
            <div className={`mt-3 rounded-lg border p-3 text-xs ${
              seedResult.success
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <p className="font-semibold">{seedResult.success ? '성공' : '실패'}</p>
              <p className="mt-0.5">{seedResult.message}</p>
              {seedResult.rowCount !== undefined && <p>{seedResult.rowCount.toLocaleString()}건 삽입됨</p>}
            </div>
          )}
        </div>
      </div>

      {/* CSV Upload drop zone */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">CSV 파일 직접 업로드</h3>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
        >
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {file ? (
            <div>
              <p className="text-sm font-semibold text-slate-700">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-500">클릭하여 CSV 파일 선택</p>
              <p className="text-xs text-gray-300 mt-1">위에서 샘플 CSV를 다운로드한 후 여기에 업로드하세요</p>
            </div>
          )}
        </div>

        {parseError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            파싱 오류: {parseError}
          </div>
        )}

        {file && (
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  업로드 중...
                </>
              ) : 'Supabase에 업로드'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-200 text-sm text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              초기화
            </button>
          </div>
        )}

        {uploadResult && (
          <div className={`rounded-lg border p-4 text-sm ${
            uploadResult.success
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <p className="font-semibold">{uploadResult.success ? '업로드 성공' : '업로드 실패'}</p>
            <p className="mt-0.5 text-xs">{uploadResult.message}</p>
            {uploadResult.rowCount !== undefined && (
              <p className="mt-0.5 text-xs">{uploadResult.rowCount.toLocaleString()}건 처리됨</p>
            )}
          </div>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-slate-900">데이터 미리보기</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{headers.length}개 컬럼</span>
              <span>처음 10행</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[120px] truncate">
                        {row[h] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Column guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">CSV 컬럼 형식 안내</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {[
            'timestamp', 'date', 'hour', 'shift', 'lot_id', 'product_id',
            'process_step', 'equipment_id', 'cleaning_bath', 'carrier_id',
            'carrier_type', 'bath_temp_c', 'chemical_concentration_pct',
            'flow_rate_lpm', 'filter_life_day', 'particle_count',
            'ni_contamination_ppb', 'inspection_count', 'defect_count',
            'defect_rate', 'ng_type', 'rework_required', 'anomaly_flag',
          ].map((col) => (
            <code key={col} className="text-[11px] bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-500 font-mono">
              {col}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}
