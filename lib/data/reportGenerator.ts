import { ProcessLot, AnomalyEvent, AiReport } from '@/types/manufacturing'
import {
  getDashboardMetrics,
  getEquipmentDefectRates,
  getNgTypeDistribution,
  getShiftComparison,
} from './metrics'

export function generateRuleBasedReport(
  lots: ProcessLot[],
  anomalies: AnomalyEvent[]
): AiReport {
  const metrics = getDashboardMetrics(lots)
  const equipmentRates = getEquipmentDefectRates(lots)
  const ngDist = getNgTypeDistribution(lots)
  const shiftComp = getShiftComparison(lots)

  const dates = [...new Set(lots.map((l) => l.date))].sort()
  const dateRange =
    dates.length > 0 ? `${dates[0]} ~ ${dates[dates.length - 1]}` : '분석 기간 미확인'

  const highAnomalies = anomalies.filter((a) => a.severity === 'High')
  const mediumAnomalies = anomalies.filter((a) => a.severity === 'Medium')

  const worstEquipment = equipmentRates[0]
  const topNgType = ngDist[0]
  const worstShift = shiftComp.sort((a, b) => b.defect_rate - a.defect_rate)[0]

  const title = `제조 공정 품질 분석 보고서 (${dateRange})`

  const summary =
    `분석 기간 ${dateRange} 동안 총 ${metrics.totalLots}개 LOT을 처리하였습니다. ` +
    `전체 불량률은 ${(metrics.overallDefectRate * 100).toFixed(2)}%이며, ` +
    `총 ${metrics.anomalyCount}건의 이상 징후가 감지되었습니다. ` +
    `${highAnomalies.length}건의 High severity 이상이 발생하여 즉각적인 조치가 필요합니다.`

  const situation =
    `[현황 요약]\n` +
    `• 분석 기간: ${dateRange}\n` +
    `• 총 처리 LOT 수: ${metrics.totalLots}개\n` +
    `• 전체 불량률: ${(metrics.overallDefectRate * 100).toFixed(2)}%\n` +
    `• 재작업 필요 LOT: ${metrics.reworkCount}개\n` +
    `• 이상 감지 건수: ${metrics.anomalyCount}건\n` +
    `• 최다 불량 유형: ${metrics.topNgType}\n\n` +
    `[장비별 불량 현황]\n` +
    equipmentRates
      .map(
        (e) =>
          `• ${e.equipment_id}: 불량률 ${(e.defect_rate * 100).toFixed(2)}% (${e.lot_count} LOTs)`
      )
      .join('\n') +
    `\n\n[교대별 불량 현황]\n` +
    shiftComp
      .map((s) => `• ${s.shift}조: 불량률 ${(s.defect_rate * 100).toFixed(2)}% (${s.lot_count} LOTs)`)
      .join('\n')

  const key_metrics: Record<string, string | number> = {
    '총 LOT 수': metrics.totalLots,
    '전체 불량률 (%)': parseFloat((metrics.overallDefectRate * 100).toFixed(2)),
    '재작업 필요 (건)': metrics.reworkCount,
    '이상 감지 (건)': metrics.anomalyCount,
    'High Severity 이상': highAnomalies.length,
    'Medium Severity 이상': mediumAnomalies.length,
    '최고 불량률 장비': worstEquipment?.equipment_id || 'N/A',
    '최고 불량률 (%)': worstEquipment
      ? parseFloat((worstEquipment.defect_rate * 100).toFixed(2))
      : 0,
    '최다 NG 유형': topNgType?.ng_type || 'N/A',
    '최다 NG 발생 교대': worstShift?.shift || 'N/A',
  }

  const root_cause_candidates: string[] = []

  if (worstEquipment && worstEquipment.defect_rate > 0.05) {
    root_cause_candidates.push(
      `[설비 이상] ${worstEquipment.equipment_id} 불량률 ${(worstEquipment.defect_rate * 100).toFixed(1)}% - 설비 내부 오염 또는 파라미터 드리프트 의심`
    )
  }

  const eqp03Anomaly = anomalies.find((a) => a.anomaly_type === 'Carrier Contamination Candidate')
  if (eqp03Anomaly) {
    root_cause_candidates.push(
      `[캐리어 오염] EQP-03 + 캐리어 B 타입 조합에서 집중적 불량 발생 - 캐리어 세정 불량 또는 재질 호환성 문제`
    )
  }

  const niAnomaly = anomalies.find((a) => a.anomaly_type === 'Metal Contamination Signal')
  if (niAnomaly) {
    root_cause_candidates.push(
      `[약액 오염] Ni(니켈) 오염 농도 임계치 ${niAnomaly.current_value} ppb 초과 - 배스 약액 열화 또는 외부 금속 유입`
    )
  }

  const particleAnomaly = anomalies.find((a) => a.anomaly_type === 'Particle Spike')
  if (particleAnomaly) {
    root_cause_candidates.push(
      `[파티클] 파티클 카운트 급증 (평균 ${particleAnomaly.baseline_value} → ${particleAnomaly.current_value}) - 필터 수명 초과 또는 환경 오염`
    )
  }

  const tempAnomaly = anomalies.find((a) => a.anomaly_type === 'Bath Temperature Drift')
  if (tempAnomaly) {
    root_cause_candidates.push(
      `[온도 이탈] 배스 온도 관리 범위 이탈 감지 - 히터/냉각 시스템 점검 필요`
    )
  }

  if (root_cause_candidates.length === 0) {
    root_cause_candidates.push('공정 파라미터 전반적 재검토 필요')
  }

  const verification_items = [
    `${worstEquipment?.equipment_id || 'EQP-03'} 최근 PM(예방정비) 이력 확인`,
    'EQP-03 캐리어 타입 B 최근 세정 이력 및 육안 검사',
    '약액 배스 Ni 함량 정밀 분석 (ICP-MS)',
    '클린룸 파티클 모니터링 데이터 검토',
    `${worstShift?.shift || 'A'}조 작업 표준 준수 여부 확인`,
    '필터 교체 이력 및 잔여 수명 확인',
    '온도 제어 시스템 캘리브레이션 기록 확인',
    `최근 3일간 ${metrics.topNgType} 불량 집중 발생 LOT 상세 분석`,
  ]

  const recommended_actions = [
    `[즉시] ${worstEquipment?.equipment_id || 'EQP-03'} 가동 중단 및 정밀 점검 실시`,
    '[즉시] 캐리어 타입 B 격리 및 전수 세정/검사',
    '[즉시] 이상 이벤트 관련 LOT 출하 보류 및 추가 검사',
    '[24시간 내] 약액 배스 전량 교체 및 Ni 오염 분석',
    '[48시간 내] 전체 필터 점검 및 수명 초과 필터 교체',
    '[1주일 내] 공정 파라미터 관리 범위 재설정 및 알람 임계치 조정',
    '[1주일 내] 캐리어 관리 절차 강화 및 전용 캐리어 할당 정책 수립',
  ]

  const prevention_checklist = [
    '일일 파티클 카운트 모니터링 및 이상시 자동 알람 설정',
    '캐리어 타입별 전용 장비 할당 원칙 수립',
    '약액 배스 교체 주기 단축 (현행 → -20%) 검토',
    'EQP-03 전용 예방정비 주기 단축 적용',
    '불량률 실시간 모니터링 대시보드 운영',
    'Ni 오염 인라인 센서 도입 검토',
    '교대별 품질 편차 원인 분석 및 작업 표준 통일',
    '이상 발생시 자동 LOT 격리 시스템 구축 검토',
  ]

  return {
    report_type: 'rule_based',
    title,
    summary,
    situation,
    key_metrics,
    root_cause_candidates,
    verification_items,
    recommended_actions,
    prevention_checklist,
  }
}
