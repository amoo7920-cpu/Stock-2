import { DiscrepancyItem, TransitStockItem } from '../types';

export function analyzeDiscrepancy(
  item: DiscrepancyItem,
  transitStock: TransitStockItem[]
): DiscrepancyItem['autoAnalysis'] {
  // Find related transit stock by Material and Lot No
  const relatedTransit = transitStock.filter(
    (t) =>
      t.material.toLowerCase() === item.material.toLowerCase() &&
      t.lotNo.toLowerCase() === item.lotNo.toLowerCase()
  );

  const transitTotalQty = relatedTransit.reduce((sum, t) => sum + t.qty, 0);

  // 1. Transit Stock Match (이송중 재고)
  if (relatedTransit.length > 0) {
    const diffAbs = Math.abs(item.diffQty);
    if (Math.abs(transitTotalQty - diffAbs) < 0.1 || transitTotalQty > 0) {
      const packageDetail = relatedTransit
        .map((t) => `${t.packageNo}(${t.qty.toLocaleString()}${t.unit})`)
        .slice(0, 3)
        .join(', ');
      
      const moreText = relatedTransit.length > 3 ? ` 외 ${relatedTransit.length - 3}건` : '';

      return {
        cause: 'TRANSIT_STOCK',
        confidence: 'HIGH',
        description: '이송중 재고 영향 가능성 매우 높음',
        details: `ERP에서 송출창고(${relatedTransit[0].outSloc})에서 입고창고(${relatedTransit[0].inSloc})로 이송중인 재고가 확인됩니다. WMS에는 아직 입고 처리가 되지 않아 일시적인 차이가 발생하고 있습니다.\n\n• 이송 총 수량: ${transitTotalQty.toLocaleString()} ${item.unit}\n• 관련 박스 일련번호: ${packageDetail}${moreText}`,
        relatedTransitIds: relatedTransit.map((t) => t.id)
      };
    }
  }

  // 2. Storage Location Mismatch (저장위치 상이)
  // Check if we have total Qty equal across different rows but locations differ
  // In our case, we can look at the item itself:
  if (item.wmsQty > 0 && item.erpQty > 0 && item.diffQty !== 0) {
    // If both have stock, but they are different
    return {
      cause: 'QTY_MISMATCH',
      confidence: 'MEDIUM',
      description: '수량 불일치 (재고 조정 필요)',
      details: `동일한 자재코드 및 LOT 번호로 양측에 모두 재고가 존재하나 수량이 상이합니다.\n\n• WMS 수량: ${item.wmsQty.toLocaleString()} ${item.unit}\n• ERP 수량: ${item.erpQty.toLocaleString()} ${item.unit}\n• 차이 수량: ${item.diffQty.toLocaleString()} ${item.unit}\n\n실물 실사를 통해 WMS/ERP 상의 입출고 누락 여부를 확인해야 합니다.`
    };
  }

  // 3. Not in WMS (WMS 누락 / ERP에만 존재)
  if (item.wmsQty === 0 && item.erpQty > 0) {
    return {
      cause: 'NOT_IN_WMS',
      confidence: 'HIGH',
      description: 'WMS 재고 누락 (입고 미반영 또는 출고 지연)',
      details: `ERP에는 가용 또는 보류 재고(${item.erpQty.toLocaleString()} ${item.unit})가 등록되어 있으나, WMS에는 전혀 기록이 없습니다.\n\n이송중인 재고 리스트에도 존재하지 않는다면, WMS 수입 검사 후 입고 처리가 누락되었거나 ERP에서 먼저 실물 출고 전에 선행 전산 처리를 했을 가능성이 높습니다.`
    };
  }

  // 4. Not in ERP (ERP 재고 누락 / WMS에만 존재)
  if (item.wmsQty > 0 && item.erpQty === 0) {
    return {
      cause: 'NOT_IN_ERP',
      confidence: 'HIGH',
      description: 'ERP 재고 누락 (ERP 전산 미반영)',
      details: `WMS 실물 재고(${item.wmsQty.toLocaleString()} ${item.unit})는 잡혀있으나 ERP 시스템에는 재고가 존재하지 않습니다.\n\nWMS에서 먼저 임의 입고 처리되었거나, ERP 생산 실적 등록(GR) 또는 구매 입고 처리가 지연되고 있을 수 있습니다.`
    };
  }

  // Default Fallback
  return {
    cause: 'QTY_MISMATCH',
    confidence: 'LOW',
    description: '원인 파악 요망 (추가 대사 필요)',
    details: '시스템 간의 차이 수량이 존재하지만 일반적인 이송이나 상태Mismatch 패턴에 포함되지 않습니다. 수동 실사 및 전산 대조가 필요합니다.'
  };
}

export function analyzeAllDiscrepancies(
  discrepancies: DiscrepancyItem[],
  transitStock: TransitStockItem[]
): DiscrepancyItem[] {
  return discrepancies.map((item) => {
    const autoAnalysis = analyzeDiscrepancy(item, transitStock);
    return {
      ...item,
      autoAnalysis
    };
  });
}
