import { useState, useMemo } from 'react';
import { DiscrepancyItem, TransitStockItem, StorageLocationItem, SavedReason } from '../types';
import { Search, AlertTriangle, Truck, Layers, Info, CheckCircle2, ChevronRight, CornerDownRight, History } from 'lucide-react';

interface SplitQuadrantViewProps {
  discrepancies: DiscrepancyItem[];
  transitStock: TransitStockItem[];
  slocDiscrepancies: StorageLocationItem[];
  onViewDetail: (item: DiscrepancyItem) => void;
  savedReasons: SavedReason[];
  onApplySavedReason: (itemId: string, status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED', comment: string, assignee: string) => void;
}

export default function SplitQuadrantView({
  discrepancies,
  transitStock,
  slocDiscrepancies,
  onViewDetail,
  savedReasons,
  onApplySavedReason
}: SplitQuadrantViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // Filter items based on search
  const filteredDiscrepancies = useMemo(() => {
    return discrepancies.filter(
      (d) =>
        d.diffQty !== 0 &&
        (d.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.lotNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [discrepancies, searchTerm]);

  // Set the first item as default selected material to drive details in the other 3 quadrants
  const activeItem = useMemo(() => {
    if (selectedMaterial) {
      const match = discrepancies.find(d => `${d.material}-${d.lotNo}` === selectedMaterial);
      if (match) return match;
    }
    return filteredDiscrepancies[0] || null;
  }, [filteredDiscrepancies, selectedMaterial, discrepancies]);

  // Find related transit packages for the active item
  const relatedTransit = useMemo(() => {
    if (!activeItem) return [];
    return transitStock.filter(
      (t) =>
        t.material.toLowerCase() === activeItem.material.toLowerCase() &&
        t.lotNo.toLowerCase() === activeItem.lotNo.toLowerCase()
    );
  }, [activeItem, transitStock]);

  // Find related sloc mismatches
  const relatedSloc = useMemo(() => {
    if (!activeItem) return [];
    return slocDiscrepancies.filter(
      (s) => s.material.toLowerCase() === activeItem.material.toLowerCase()
    );
  }, [activeItem, slocDiscrepancies]);

  // Auto-lookup matching past comments for active item
  const matchedPastReason = useMemo(() => {
    if (!activeItem) return null;
    return savedReasons.find(
      (r) =>
        r.material.toLowerCase() === activeItem.material.toLowerCase() &&
        r.lotNo.toLowerCase() === activeItem.lotNo.toLowerCase()
    );
  }, [activeItem, savedReasons]);

  return (
    <div className="space-y-6" id="split-quadrant-view">
      {/* Top Controller */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">실시간 4분할 원인 추적 대조판</h3>
          <p className="text-[11px] text-slate-400">재고 수량, 상태, 창고 오매칭, 이송중 바코드 대조를 한 화면에서 분석합니다.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="자재코드 또는 LOT 번호 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/30"
          />
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Quadrant 1: 재고수량 차이 리스트 (WMS vs ERP Qty) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[320px] overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
              <h4 className="text-xs font-bold text-slate-700">1. WMS vs ERP 실물 수량 차이 대사</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              총 {filteredDiscrepancies.length}건 발생
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredDiscrepancies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4">
                <p className="text-xs">일치하지 않는 재고 수량이 존재하지 않습니다.</p>
              </div>
            ) : (
              filteredDiscrepancies.map((item) => {
                const isSelected = activeItem && activeItem.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMaterial(`${item.material}-${item.lotNo}`)}
                    className={`p-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-50 border-l-4 border-slate-900 pl-1.5 font-bold' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{item.material}</span>
                        <span className="text-[10px] px-1 bg-slate-100 text-slate-500 rounded">LOT: {item.lotNo}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        공장 {item.plant} • 저장위치 {item.sloc} • {item.wmsStrategy || 'MTS'}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="font-extrabold text-slate-900">
                          WMS: {item.wmsQty.toLocaleString()} / ERP: {item.erpQty.toLocaleString()}
                        </div>
                        <div className={`text-[10px] font-bold ${item.diffQty > 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                          차이: {item.diffQty > 0 ? '+' : ''}{item.diffQty.toLocaleString()} {item.unit}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quadrant 2: 재고 품질상태 차이 ( 가용/보류/검사대기 ) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[320px] overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <h4 className="text-xs font-bold text-slate-700">2. 재고 세부 품질 상태 (가용/보류/품질) 대조</h4>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-100 rounded font-bold">
              품질정합성 진단
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {activeItem ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">{activeItem.material}</span>
                    <span className="text-[10px] text-slate-400 block">LOT: {activeItem.lotNo}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">
                    단위: {activeItem.unit}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-slate-50/50 border border-slate-150 rounded-lg">
                    <div className="text-[10px] font-bold text-slate-400">가용재고 (Unrestricted)</div>
                    <div className="mt-1 text-[11px] text-slate-700 font-medium">WMS: <span className="font-bold">{(activeItem.wmsUnrestricted || 0).toLocaleString()}</span></div>
                    <div className="text-[11px] text-slate-700 font-medium">ERP: <span className="font-bold">{(activeItem.erpUnrestricted || 0).toLocaleString()}</span></div>
                    <div className="text-[10px] text-rose-500 font-bold border-t border-slate-100 mt-1 pt-0.5">
                      차이: {((activeItem.wmsUnrestricted || 0) - (activeItem.erpUnrestricted || 0)).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50/50 border border-slate-150 rounded-lg">
                    <div className="text-[10px] font-bold text-slate-400">보류재고 (Blocked)</div>
                    <div className="mt-1 text-[11px] text-slate-700 font-medium">WMS: <span className="font-bold">{(activeItem.wmsBlocked || 0).toLocaleString()}</span></div>
                    <div className="text-[11px] text-slate-700 font-medium">ERP: <span className="font-bold">{(activeItem.erpBlocked || 0).toLocaleString()}</span></div>
                    <div className="text-[10px] text-rose-500 font-bold border-t border-slate-100 mt-1 pt-0.5">
                      차이: {((activeItem.wmsBlocked || 0) - (activeItem.erpBlocked || 0)).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50/50 border border-slate-150 rounded-lg">
                    <div className="text-[10px] font-bold text-slate-400">검사대기 (Quality Inspection)</div>
                    <div className="mt-1 text-[11px] text-slate-700 font-medium">WMS: <span className="font-bold">{(activeItem.wmsQuality || 0).toLocaleString()}</span></div>
                    <div className="text-[11px] text-slate-700 font-medium">ERP: <span className="font-bold">{(activeItem.erpQuality || 0).toLocaleString()}</span></div>
                    <div className="text-[10px] text-rose-500 font-bold border-t border-slate-100 mt-1 pt-0.5">
                      차이: {((activeItem.wmsQuality || 0) - (activeItem.erpQuality || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 space-y-1 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    상태 불일치 원인 분석
                  </div>
                  <p className="leading-relaxed text-slate-500">
                    {Math.abs((activeItem.wmsBlocked || 0) - (activeItem.erpBlocked || 0)) > 0
                      ? '양쪽 시스템 간 보류(Blocked) 재고의 오차가 존재합니다. WMS 현장 적치 보류 지정 타이밍과 ERP 회계 분개 처리의 선행 여부를 현장 사무원과 확인해주십시오.'
                      : '총 수량 차이에 기인하며 상태(가용/보류) 상의 심각한 전산 지연은 식별되지 않았습니다.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p className="text-xs">상태를 대조할 자재를 좌측에서 선택해주십시오.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quadrant 3: 재고 분류 대사 (MTO / MTS & 창고 위치) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[320px] overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
              <h4 className="text-xs font-bold text-slate-700">3. 재고분류(MTO/MTS) 및 저장위치(SLOC) 오매칭</h4>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded font-bold">
              전산 전략 매칭
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {activeItem ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Strategy Info */}
                  <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg space-y-1.5">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">전산 관리구분 (Strategy)</h5>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">WMS 관리:</span>
                      <span className="font-extrabold text-slate-800">{activeItem.wmsStrategy || 'MTS (계획 생산)'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">ERP 장부:</span>
                      <span className="font-extrabold text-slate-800">{activeItem.erpStrategy || 'MTS (계획 생산)'}</span>
                    </div>
                    {(activeItem.wmsOrderNo || activeItem.erpOrderNo) && (
                      <div className="mt-1 pt-1 border-t border-slate-150 text-[10px] text-slate-500">
                        수주번호: <span className="font-bold font-mono">{activeItem.wmsOrderNo || activeItem.erpOrderNo}</span>
                      </div>
                    )}
                  </div>

                  {/* SLOC Mapping */}
                  <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg space-y-1.5">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">저장위치 불일치 점검</h5>
                    <div className="text-xs text-slate-600">
                      현재 관측 위치: <span className="font-bold text-slate-800">{activeItem.sloc} 창고</span>
                    </div>
                    {relatedSloc.length > 0 ? (
                      <div className="text-[10px] text-cyan-600 font-bold bg-cyan-50 p-1 border border-cyan-100 rounded text-center">
                        위치 오발생 {relatedSloc.length}건 관측됨
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 leading-normal">
                        창고 간 이동 지연으로 인한 실물 불일치가 주로 발생 중입니다.
                      </p>
                    )}
                  </div>
                </div>

                {/* SLOC Detail grid if matched */}
                {relatedSloc.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400">연관 오발생 SLOC 매칭</span>
                    <div className="border border-slate-200 rounded-lg overflow-hidden text-[10px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="p-1.5">WMS 창고</th>
                            <th className="p-1.5 text-right">수량</th>
                            <th className="p-1.5">ERP 창고</th>
                            <th className="p-1.5 text-right">수량</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {relatedSloc.map((s, idx) => (
                            <tr key={idx}>
                              <td className="p-1.5 font-bold">{s.wmsSloc || 'N/A'}</td>
                              <td className="p-1.5 text-right">{s.wmsQty.toLocaleString()}</td>
                              <td className="p-1.5 font-bold text-indigo-600">{s.erpSloc || 'N/A'}</td>
                              <td className="p-1.5 text-right font-semibold">{s.erpQty.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Historical auto-reason suggestion panel (동일 차이 사유 자동찾기) */}
                <div className="p-2.5 bg-indigo-50 border border-indigo-150 rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-indigo-800">
                    <span className="flex items-center gap-1">
                      <History className="w-3.5 h-3.5" />
                      동일 품목 과거 파악사유 자동완성
                    </span>
                    {matchedPastReason && (
                      <span className="text-[9px] px-1 py-0.2 bg-indigo-100 rounded text-indigo-700 font-extrabold animate-pulse">
                        과거 내역 매칭됨!
                      </span>
                    )}
                  </div>
                  {matchedPastReason ? (
                    <div className="text-[11px] text-indigo-700 space-y-1.5">
                      <p className="bg-white p-1.5 border border-indigo-100 rounded text-slate-600 leading-relaxed font-medium">
                        "{matchedPastReason.comment}" <span className="text-[9px] text-slate-400">({matchedPastReason.assignee || '담당자미정'})</span>
                      </p>
                      <button
                        onClick={() => onApplySavedReason(
                          activeItem.id,
                          matchedPastReason.status,
                          matchedPastReason.comment,
                          matchedPastReason.assignee
                        )}
                        className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-1 rounded hover:bg-indigo-700 transition-colors"
                      >
                        과거 사유 자동 적용하기
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      이 품목에 대해 이전에 등록된 동일 사유가 아직 데이터베이스에 없습니다. 우측 상세창에서 사유를 등록하면 다음 대사부터 자동으로 추천해 줍니다.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p className="text-xs">자재를 대조할 행을 선택해주십시오.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quadrant 4: 이송중 재고 상세 추적 (바코드, 박스번호) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[320px] overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
              <h4 className="text-xs font-bold text-slate-700">4. 연계 이송중 재고 및 운송 바코드 (Stock in Transit)</h4>
            </div>
            <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
              이송 자동 소거
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {activeItem ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>실물 추적 박스 목록</span>
                  <span className="text-indigo-600 font-extrabold">이송 물량: {relatedTransit.reduce((sum, r) => sum + r.qty, 0).toLocaleString()} {activeItem.unit}</span>
                </div>

                {relatedTransit.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg text-center text-xs text-slate-400">
                    <p className="leading-relaxed">이 자재와 Lot 번호에 연동된 이송중인 재고가 목록에 확인되지 않습니다.</p>
                    <p className="text-[10px] text-slate-400 mt-1">창고 실물 수입 검사 확인이 필요합니다.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border border-slate-150 rounded-lg overflow-hidden text-[10px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-150">
                          <tr>
                            <th className="p-1.5">박스 일련번호(바코드)</th>
                            <th className="p-1.5">출발지 → 도착지</th>
                            <th className="p-1.5 text-right">이송량</th>
                            <th className="p-1.5">상태</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                          {relatedTransit.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/40">
                              <td className="p-1.5 font-bold text-slate-800">{t.packageNo}</td>
                              <td className="p-1.5 text-slate-500 font-sans">{t.outSloc} → {t.inSloc}</td>
                              <td className="p-1.5 text-right font-bold">{t.qty.toLocaleString()}</td>
                              <td className="p-1.5 font-sans">
                                <span className="px-1 py-0.2 bg-blue-50 border border-blue-100 text-blue-700 rounded text-[9px] font-bold">
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="p-2.5 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-lg text-[11px] leading-relaxed">
                      <span className="font-bold flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        수량 자동 대차 검증 성공
                      </span>
                      이송중인 총 {relatedTransit.reduce((sum, r) => sum + r.qty, 0).toLocaleString()} {activeItem.unit} 물량이 ERP 회계 이송 전표에 기재되어 있습니다. 입고 적치 완료 후 WMS에 반영되면 차이값은 자동으로 0으로 해소됩니다.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p className="text-xs">바코드를 추적할 자재를 선택해주십시오.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Manual details option link */}
      {activeItem && (
        <div className="bg-slate-900/5 hover:bg-slate-900/10 p-3 rounded-lg flex justify-between items-center text-xs text-slate-600 transition-colors">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-500" />
            <span>선택된 <strong className="text-slate-900">{activeItem.material} ({activeItem.lotNo})</strong>에 대해 세부 조치 일지 또는 담당자를 수정하시겠습니까?</span>
          </div>
          <button
            onClick={() => onViewDetail(activeItem)}
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-0.5"
          >
            정밀 분석 서랍식 창 열기
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
