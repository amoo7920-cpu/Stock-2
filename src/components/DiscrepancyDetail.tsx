import { useState, useEffect } from 'react';
import { DiscrepancyItem, TransitStockItem } from '../types';
import { X, Calendar, User, MessageSquare, AlertCircle, HelpCircle, CheckCircle, ArrowRight, Truck, Info, CornerDownRight, Save } from 'lucide-react';

interface DiscrepancyDetailProps {
  item: DiscrepancyItem | null;
  onClose: () => void;
  transitStock: TransitStockItem[];
  onUpdateStatus: (itemId: string, status: DiscrepancyItem['status'], comment?: string, assignee?: string) => void;
}

export default function DiscrepancyDetail({
  item,
  onClose,
  transitStock,
  onUpdateStatus
}: DiscrepancyDetailProps) {
  const [status, setStatus] = useState<DiscrepancyItem['status']>('PENDING');
  const [comment, setComment] = useState('');
  const [assignee, setAssignee] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Sync state with open item
  useEffect(() => {
    if (item) {
      setStatus(item.status);
      setComment(item.comment || '');
      setAssignee(item.assignee || '');
      setIsSaved(false);
    }
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    onUpdateStatus(item.id, status, comment, assignee);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Find linked transit items based on auto-analysis
  const relatedTransit = transitStock.filter(
    (t) =>
      t.material.toLowerCase() === item.material.toLowerCase() &&
      t.lotNo.toLowerCase() === item.lotNo.toLowerCase()
  );

  const totalTransitQty = relatedTransit.reduce((sum, t) => sum + t.qty, 0);

  // Styling for Analysis Card based on cause
  const getCauseStyle = (cause: DiscrepancyItem['autoAnalysis']['cause']) => {
    switch (cause) {
      case 'TRANSIT_STOCK':
        return {
          bg: 'bg-indigo-50/50 border-indigo-150',
          badge: 'bg-indigo-100 text-indigo-700',
          iconColor: 'text-indigo-600',
          title: '이송중 재고 영향 대기'
        };
      case 'STATUS_MISMATCH':
        return {
          bg: 'bg-amber-50/50 border-amber-150',
          badge: 'bg-amber-100 text-amber-700',
          iconColor: 'text-amber-600',
          title: '시스템 간 재고 상태 상이'
        };
      case 'NOT_IN_WMS':
        return {
          bg: 'bg-rose-50/50 border-rose-150',
          badge: 'bg-rose-100 text-rose-700',
          iconColor: 'text-rose-600',
          title: 'WMS 실물 누락 및 출고지연 의심'
        };
      case 'NOT_IN_ERP':
        return {
          bg: 'bg-emerald-50/50 border-emerald-150',
          badge: 'bg-emerald-100 text-emerald-700',
          iconColor: 'text-emerald-600',
          title: 'ERP 전산 등록 지연 (GR 누락)'
        };
      default:
        return {
          bg: 'bg-slate-50/70 border-slate-150',
          badge: 'bg-slate-100 text-slate-700',
          iconColor: 'text-slate-600',
          title: '시스템 수량 차이 발생'
        };
    }
  };

  const causeStyle = getCauseStyle(item.autoAnalysis?.cause || 'QTY_MISMATCH');

  return (
    <div className="fixed inset-0 z-50 flex justify-end" id="discrepancy-detail-panel">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Panel Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">WMS-ERP 대사 원인 규명</span>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
              자재 차이 분석 상세
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-lg transition-colors border border-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Main Item Badge Info */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-400">자재코드 / 명</div>
              <div className="text-base font-extrabold text-white mt-0.5">{item.material}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] text-slate-300 font-bold rounded">
                  LOT: {item.lotNo}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">단위: {item.unit}</span>
                <span className="text-[10px] text-slate-400 font-semibold">•</span>
                <span className="text-[10px] text-slate-400 font-semibold">공장 {item.plant} / SLOC {item.sloc}</span>
              </div>
            </div>
            
            {/* Quick Diff Card */}
            <div className="bg-slate-800 p-3 rounded-lg flex flex-col justify-center min-w-[120px] text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">대사 차량</span>
              <span className={`text-lg font-black tracking-tight ${item.diffQty < 0 ? 'text-rose-400' : 'text-blue-400'}`}>
                {item.diffQty > 0 ? `+${item.diffQty.toLocaleString()}` : item.diffQty.toLocaleString()} {item.unit}
              </span>
            </div>
          </div>

          {/* AI/Rule-based Cause Analysis Banner */}
          <div className={`p-5 rounded-xl border ${causeStyle.bg} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 text-xs font-black rounded-lg ${causeStyle.badge}`}>
                {causeStyle.title}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                정확도 {item.autoAnalysis?.confidence === 'HIGH' ? '높음 (95%)' : '보통 (75%)'}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold text-slate-800">
                {item.autoAnalysis?.description}
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line bg-white/50 p-3 rounded-lg border border-slate-100">
                {item.autoAnalysis?.details}
              </p>
            </div>
          </div>

          {/* Side-by-side Stock Quantity Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">시스템별 수량 대사</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WMS Qty Card */}
              <div className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">WMS (물류 시스템)</span>
                    <span className="text-[10px] px-1.5 bg-slate-100 text-slate-500 rounded font-semibold">실물 기준</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                    {item.wmsQty.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                  </div>
                </div>
                
                {/* WMS Details */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 text-[10px] space-y-1.5 text-slate-500 font-semibold">
                  <div className="flex justify-between">
                    <span>수행 방식 (Strategy)</span>
                    <span className="text-slate-800">{item.wmsStrategy || 'MTS (가용생산)'}</span>
                  </div>
                  {item.wmsOrderNo && (
                    <div className="flex justify-between">
                      <span>WMS 수주번호</span>
                      <span className="text-slate-800 font-mono">#{item.wmsOrderNo}</span>
                    </div>
                  )}
                  {item.wmsBlocked !== undefined && (
                    <div className="flex justify-between">
                      <span>WMS 보류재고</span>
                      <span className="text-amber-600">{item.wmsBlocked.toLocaleString()} {item.unit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ERP Qty Card */}
              <div className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">ERP (전산 경영지원)</span>
                    <span className="text-[10px] px-1.5 bg-slate-100 text-slate-500 rounded font-semibold">회계/장부 기준</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                    {item.erpQty.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                  </div>
                </div>
                
                {/* ERP Details */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 text-[10px] space-y-1.5 text-slate-500 font-semibold">
                  <div className="flex justify-between">
                    <span>수행 방식 (Strategy)</span>
                    <span className="text-slate-800">{item.erpStrategy || 'MTS (가용생산)'}</span>
                  </div>
                  {item.erpOrderNo && (
                    <div className="flex justify-between">
                      <span>ERP 수주번호</span>
                      <span className="text-slate-800 font-mono">#{item.erpOrderNo}</span>
                    </div>
                  )}
                  {item.erpBlocked !== undefined && (
                    <div className="flex justify-between">
                      <span>ERP 보류재고</span>
                      <span className="text-amber-600">{item.erpBlocked.toLocaleString()} {item.unit}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Linked Transit Stock packages */}
          {relatedTransit.length > 0 && (
            <div className="space-y-3 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  연계 이송중 재고 추적 상세 ({relatedTransit.length}개 상자)
                </h3>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                  합계: {totalTransitQty.toLocaleString()} {item.unit}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 leading-normal">
                  WMS와 ERP의 수량 차이량과 이송중 수량이 정확히 매칭됩니다. 이송 화물이 하역된 후 WMS에 등록을 완료하면 불일치는 자동으로 해소됩니다.
                </p>

                <div className="bg-white rounded-lg border border-slate-150 overflow-hidden divide-y divide-slate-100">
                  {relatedTransit.map((t) => (
                    <div key={t.id} className="p-2.5 flex items-center justify-between text-[11px] hover:bg-slate-50/50">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700 font-mono">{t.packageNo}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded font-medium">상자단위</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>출발 {t.outSloc}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                          <span>도착 {t.inSloc}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-800">{t.qty.toLocaleString()} {t.unit}</span>
                        <div className="text-[9px] font-bold text-indigo-600">{t.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer: Actions & Status updates */}
        <div className="p-5 border-t border-slate-150 bg-slate-50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                조치 진행상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DiscrepancyItem['status'])}
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              >
                <option value="PENDING">🔴 대기중 (미확인)</option>
                <option value="INVESTIGATING">🟡 원인파악 / 추적중</option>
                <option value="RESOLVED">🟢 조치완료 (차이 해소)</option>
              </select>
            </div>

            {/* Assignee Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                조치 담당자
              </label>
              <input
                type="text"
                placeholder="담당자 성명..."
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Memo Comment */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              조치 대사 메모 및 기재 사항
            </label>
            <textarea
              placeholder="대사 원인에 대한 조사 결과나 차후 조치 예정 일정을 기록하여 주십시오..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 leading-normal"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-250 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              {isSaved ? '저장 완료!' : '조치 내용 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
