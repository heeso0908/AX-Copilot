import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateRuleBasedReport } from '@/lib/data/reportGenerator'
import { ProcessLot, AnomalyEvent, AiReport } from '@/types/manufacturing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lots: ProcessLot[] = body.lots || []
    const anomalies: AnomalyEvent[] = body.anomalies || []

    if (lots.length === 0) {
      return NextResponse.json({ error: 'No lots provided' }, { status: 400 })
    }

    let report: AiReport

    // Try OpenAI if API key is configured
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      try {
        const ruleReport = generateRuleBasedReport(lots, anomalies)

        const prompt = `당신은 반도체/전자 제조 공정 품질 전문가입니다.
아래 공정 데이터 분석 결과를 바탕으로 상세한 품질 분석 보고서를 작성해주세요.

[분석 데이터 요약]
${ruleReport.situation}

[이상 감지 결과]
${anomalies.map((a) => `- ${a.severity}: ${a.anomaly_type} (${a.equipment_id}) - ${a.root_cause_candidate}`).join('\n')}

[원인 후보]
${ruleReport.root_cause_candidates.join('\n')}

위 내용을 바탕으로 전문가 관점에서 더 심층적인 분석을 제공하고,
JSON 형식으로 응답해주세요:
{
  "title": "보고서 제목",
  "summary": "요약 (2-3문장)",
  "root_cause_candidates": ["원인1", "원인2", ...],
  "verification_items": ["확인항목1", ...],
  "recommended_actions": ["조치1", ...],
  "prevention_checklist": ["체크리스트1", ...]
}`

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3,
          }),
        })

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json()
          const content = JSON.parse(openaiData.choices[0].message.content)
          report = {
            report_type: 'ai_generated',
            title: content.title || ruleReport.title,
            summary: content.summary || ruleReport.summary,
            situation: ruleReport.situation,
            key_metrics: ruleReport.key_metrics,
            root_cause_candidates: content.root_cause_candidates || ruleReport.root_cause_candidates,
            verification_items: content.verification_items || ruleReport.verification_items,
            recommended_actions: content.recommended_actions || ruleReport.recommended_actions,
            prevention_checklist: content.prevention_checklist || ruleReport.prevention_checklist,
            model_used: 'gpt-4o-mini',
          }
        } else {
          report = ruleReport
        }
      } catch (aiError) {
        console.error('OpenAI error:', aiError)
        report = generateRuleBasedReport(lots, anomalies)
      }
    } else {
      report = generateRuleBasedReport(lots, anomalies)
    }

    // Save to Supabase if configured
    const supabase = createServerClient()
    if (supabase) {
      const { error } = await supabase.from('ai_reports').insert({
        ...report,
        dataset_upload_id: body.dataset_upload_id,
        raw_content: JSON.stringify(report),
      })
      if (error) {
        console.error('Error saving report:', error)
      }
    }

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Report generation failed' },
      { status: 500 }
    )
  }
}
