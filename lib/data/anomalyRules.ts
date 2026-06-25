import { ProcessLot, AnomalyEvent } from '@/types/manufacturing'
import { getEquipmentDefectRates, calculateDefectRate } from './metrics'

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stddev(values: number[]): number {
  if (values.length === 0) return 0
  const avg = mean(values)
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2))
  return Math.sqrt(mean(squaredDiffs))
}

export function detectAnomalies(lots: ProcessLot[]): AnomalyEvent[] {
  const events: AnomalyEvent[] = []
  const overallDefectRate = calculateDefectRate(lots)
  const equipmentRates = getEquipmentDefectRates(lots)

  // Rule 1: anomaly_flag === 1 lots
  const flaggedLots = lots.filter((l) => l.anomaly_flag === 1)
  const flaggedByEquipment: Record<string, ProcessLot[]> = {}
  for (const lot of flaggedLots) {
    if (!flaggedByEquipment[lot.equipment_id]) {
      flaggedByEquipment[lot.equipment_id] = []
    }
    flaggedByEquipment[lot.equipment_id].push(lot)
  }

  for (const [equipment_id, eqpLots] of Object.entries(flaggedByEquipment)) {
    const sortedLots = eqpLots.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    events.push({
      severity: 'High',
      equipment_id,
      anomaly_type: 'Flagged Anomaly Detected',
      start_time: sortedLots[0].timestamp,
      end_time: sortedLots[sortedLots.length - 1].timestamp,
      metric_name: 'anomaly_flag',
      current_value: eqpLots.length,
      baseline_value: 0,
      root_cause_candidate: eqpLots[0].root_cause_hint || '공정 이상 감지 - 상세 조사 필요',
      recommended_action:
        eqpLots[0].action_taken ||
        '해당 장비 가동 중단 후 정밀 점검 실시',
      lot_ids: eqpLots.map((l) => l.lot_id),
    })
  }

  // Rule 2: Equipment defect_rate > 1.5x average
  for (const eqpRate of equipmentRates) {
    if (eqpRate.defect_rate > overallDefectRate * 1.5 && overallDefectRate > 0) {
      const eqpLots = lots.filter((l) => l.equipment_id === eqpRate.equipment_id)
      // Avoid duplicating with rule 1
      const alreadyAdded = events.some(
        (e) => e.equipment_id === eqpRate.equipment_id && e.anomaly_type === 'Flagged Anomaly Detected'
      )
      if (!alreadyAdded) {
        const sortedLots = eqpLots.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        events.push({
          severity: 'High',
          equipment_id: eqpRate.equipment_id,
          anomaly_type: 'Equipment Defect Rate Elevated',
          start_time: sortedLots[0].timestamp,
          end_time: sortedLots[sortedLots.length - 1].timestamp,
          metric_name: 'defect_rate',
          current_value: parseFloat((eqpRate.defect_rate * 100).toFixed(2)),
          baseline_value: parseFloat((overallDefectRate * 100).toFixed(2)),
          root_cause_candidate: `${eqpRate.equipment_id} 불량률이 평균 대비 ${((eqpRate.defect_rate / overallDefectRate) * 100 - 100).toFixed(0)}% 초과`,
          recommended_action: '해당 장비 우선 점검 및 공정 파라미터 재검토',
          lot_ids: eqpLots.map((l) => l.lot_id),
        })
      }
    }
  }

  // Rule 3: particle_count > mean + 2*stddev
  const particleCounts = lots.map((l) => l.particle_count)
  const particleMean = mean(particleCounts)
  const particleStd = stddev(particleCounts)
  const particleThreshold = particleMean + 2 * particleStd

  const spikedLots = lots.filter((l) => l.particle_count > particleThreshold)
  const spikedByEquipment: Record<string, ProcessLot[]> = {}
  for (const lot of spikedLots) {
    if (!spikedByEquipment[lot.equipment_id]) {
      spikedByEquipment[lot.equipment_id] = []
    }
    spikedByEquipment[lot.equipment_id].push(lot)
  }

  for (const [equipment_id, eqpLots] of Object.entries(spikedByEquipment)) {
    const sortedLots = eqpLots.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    const avgParticle = mean(eqpLots.map((l) => l.particle_count))
    events.push({
      severity: 'Medium',
      equipment_id,
      anomaly_type: 'Particle Spike',
      start_time: sortedLots[0].timestamp,
      end_time: sortedLots[sortedLots.length - 1].timestamp,
      metric_name: 'particle_count',
      current_value: parseFloat(avgParticle.toFixed(0)),
      baseline_value: parseFloat(particleMean.toFixed(0)),
      root_cause_candidate: '파티클 급증 - 필터 수명 초과 또는 외부 오염 유입 가능성',
      recommended_action: '필터 즉시 교체 및 클린룸 환경 점검',
      lot_ids: eqpLots.map((l) => l.lot_id),
    })
  }

  // Rule 4: ni_contamination_ppb > 10
  const niContaminatedLots = lots.filter((l) => l.ni_contamination_ppb > 10)
  const niByEquipment: Record<string, ProcessLot[]> = {}
  for (const lot of niContaminatedLots) {
    if (!niByEquipment[lot.equipment_id]) {
      niByEquipment[lot.equipment_id] = []
    }
    niByEquipment[lot.equipment_id].push(lot)
  }

  for (const [equipment_id, eqpLots] of Object.entries(niByEquipment)) {
    const sortedLots = eqpLots.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    const maxNi = Math.max(...eqpLots.map((l) => l.ni_contamination_ppb))
    events.push({
      severity: 'High',
      equipment_id,
      anomaly_type: 'Metal Contamination Signal',
      start_time: sortedLots[0].timestamp,
      end_time: sortedLots[sortedLots.length - 1].timestamp,
      metric_name: 'ni_contamination_ppb',
      current_value: parseFloat(maxNi.toFixed(2)),
      baseline_value: 10,
      root_cause_candidate: 'Ni 오염 임계치 초과 - 금속 오염 의심',
      recommended_action: '약액 분석 실시 및 배스 즉시 교체, 해당 LOT 격리 검토',
      lot_ids: eqpLots.map((l) => l.lot_id),
    })
  }

  // Rule 5: bath_temp_c outside [55, 70]
  const tempOutlierLots = lots.filter(
    (l) => l.bath_temp_c < 55 || l.bath_temp_c > 70
  )
  const tempByEquipment: Record<string, ProcessLot[]> = {}
  for (const lot of tempOutlierLots) {
    if (!tempByEquipment[lot.equipment_id]) {
      tempByEquipment[lot.equipment_id] = []
    }
    tempByEquipment[lot.equipment_id].push(lot)
  }

  for (const [equipment_id, eqpLots] of Object.entries(tempByEquipment)) {
    const sortedLots = eqpLots.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    const avgTemp = mean(eqpLots.map((l) => l.bath_temp_c))
    events.push({
      severity: 'Medium',
      equipment_id,
      anomaly_type: 'Bath Temperature Drift',
      start_time: sortedLots[0].timestamp,
      end_time: sortedLots[sortedLots.length - 1].timestamp,
      metric_name: 'bath_temp_c',
      current_value: parseFloat(avgTemp.toFixed(1)),
      baseline_value: 62.5,
      root_cause_candidate: '배스 온도 관리 범위 이탈 - 히터 또는 냉각 시스템 이상',
      recommended_action: '온도 제어 시스템 점검 및 약액 교반 상태 확인',
      lot_ids: eqpLots.map((l) => l.lot_id),
    })
  }

  // Rule 6: EQP-03 + carrier_type B with defect_rate > 0.05
  const eqp03CarrierBLots = lots.filter(
    (l) =>
      l.equipment_id === 'EQP-03' &&
      l.carrier_type === 'B' &&
      l.defect_rate > 0.05
  )

  if (eqp03CarrierBLots.length > 0) {
    const sortedLots = eqp03CarrierBLots.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    const avgDefectRate = mean(eqp03CarrierBLots.map((l) => l.defect_rate))
    events.push({
      severity: 'High',
      equipment_id: 'EQP-03',
      anomaly_type: 'Carrier Contamination Candidate',
      start_time: sortedLots[0].timestamp,
      end_time: sortedLots[sortedLots.length - 1].timestamp,
      metric_name: 'defect_rate (EQP-03 + Carrier-B)',
      current_value: parseFloat((avgDefectRate * 100).toFixed(2)),
      baseline_value: 5.0,
      root_cause_candidate:
        'EQP-03 + 캐리어 타입 B 조합 불량률 급증 - 캐리어 오염 또는 장비-캐리어 간 호환성 문제 의심',
      recommended_action:
        '캐리어 타입 B 즉시 격리 및 세정 실시, EQP-03 전용 캐리어 할당 재검토',
      lot_ids: eqp03CarrierBLots.map((l) => l.lot_id),
    })
  }

  // Deduplicate by equipment_id + anomaly_type
  const seen = new Set<string>()
  return events.filter((e) => {
    const key = `${e.equipment_id}:${e.anomaly_type}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
