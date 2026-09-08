import { useState, useMemo } from 'react';
import { DiscrepancyItem } from '../types';
import { Search, Filter, AlertTriangle, ArrowDown, ArrowUp, CheckCircle, HelpCircle, Calendar, RefreshCcw, Eye, SlidersHorizontal, MessageSquare } from 'lucide-react';

interface DiscrepancyListProps {
  discrepancies: DiscrepancyItem[];
  onViewDetail: (item: DiscrepancyItem) => void;
  onUpdateStatus: (itemId: string, status: DiscrepancyItem['status'], comment?: string) => void;
}

export default function DiscrepancyList({
  discrepancies,
  onViewDetail,
  onUpdateStatus
}: DiscrepancyListProps) {
  const [search, setSearch] = useState('');
  const [plantFilter, setPlantFilter] = useState('ALL');
  const [slocFilter, setSlocFilter] = useState('ALL');
  const [causeFilter, setCauseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showDiffsOnly, setShowDiffsOnly] = useState(true);

  // Available unique plants and slocs
  const uniquePlants = useMemo(() => {
    const plants = new Set(discrepancies.map((d) => d.plant));
    return ['ALL', ...Array.from(plants)];
  }, [discrepancies]);

  const uniqueSlocs = useMemo(() => {
    const filteredSlocs = plantFilter === 'ALL' 
      ? discrepancies 
      : discrepancies.filter((d) => d.plant === plantFilter);
    const slocs = new Set(filteredSlocs.map((d) => d.sloc).filter(Boolean));
    return ['ALL', ...Array.from(slocs)];
  }, [discrepancies, plantFilter]);

  // Unique causes
  const uniqueCauses = [
    { value: 'ALL', label: '모든 원인' },
    { value: 'TRANSIT_STOCK', label: '이송중 재고 영향' },
    { value: 'STATUS_MISMATCH', label: '재고 상태 불일치' },
    { value: 'NOT_IN_WMS', label: 'WMS 누락' },
    { value: 'NOT_IN_ERP', label: 'ERP 누락' },
    { value: 'QTY_MISMATCH', label: '수량 불일치' }
  ];

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return discrepancies.filter((item) => {
      // Search
      const searchLower = search.toLowerCase();
      const matchesSearch =
        item.material.toLowerCase().includes(searchLower) ||
        item.lotNo.toLowerCase().includes(searchLower) ||
        (item.wmsOrderNo && item.wmsOrderNo.toLowerCase().includes(searchLower)) ||
        (item.erpOrderNo && item.erpOrderNo.toLowerCase().includes(searchLower));

      // Plant
      const matchesPlant = plantFilter === 'ALL' || item.plant === plantFilter;

      // SLoc
      const matchesSloc = slocFilter === 'ALL' || item.sloc === slocFilter;

      // Cause
      const matchesCause =
        causeFilter === 'ALL' || item.autoAnalysis?.cause === causeFilter;

      // Status
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      // Diff check
      const matchesDiff = !showDiffsOnly || item.diffQty !== 0;

      return matchesSearch && matchesPlant && matchesSloc && matchesCause && matchesStatus && matchesDiff;
    });
  }, [discrepancies, search, plantFilter, slocFilter, causeFilter, statusFilter, showDiffsOnly]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setPlantFilter('ALL');
    setSlocFilter('ALL');
    setCauseFilter('ALL');
    setStatusFilter('ALL');
    setShowDiffsOnly(true);
  };

  const getCauseBadge = (cause: DiscrepancyItem['autoAnalysis']['cause']) => {
    switch (cause) {
      case 'TRANSIT_STOCK':
        return (
          <span className="px-2 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-lg flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            이송중 재고
          </span>
        );
      case 'STATUS_MISMATCH':
        return (
          <span className="px-2 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-150 rounded-lg flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            상태 불일치
          </span>
        );
      case 'NOT_IN_WMS':
        return (
          <span className="px-2 py-1 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-150 rounded-lg flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            WMS 누락
          </span>
        );
      case 'NOT_IN_ERP':
        return (
          <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ERP 누락
          </span>
        );
      case 'SLOC_MISMATCH':
        return (
          <span className="px-2 py-1 text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-150 rounded-lg flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            저장위치 상이
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-bold bg-slate-50 text-slate-700 border border-slate-150 rounded-lg flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            수량 불일치
          </span>
        );
    }
  };

  const getStatusBadge = (status: DiscrepancyItem['status']) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            조치완료
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            분석/추적중
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            대기중
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-150 shadow-sm" id="discrepancy-list-view">
      {/* Header and Quick Summary */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">대사 결과 및 원인분석 리스트</h3>
          <p className="text-xs text-slate-400 mt-1">
            WMS와 ERP 데이터 일치율: <span className="font-bold text-slate-800">{(((discrepancies.length - discrepancies.filter(d => d.diffQty !== 0).length) / (discrepancies.length || 1)) * 100).toFixed(1)}%</span>
            (전체 {discrepancies.length} 품목 중 {filteredItems.length}개 필터링됨)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 cursor-pointer flex items-center gap-1.5 select-none bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showDiffsOnly}
              onChange={(e) => setShowDiffsOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>재고 차이 발생건만 보기</span>
          </label>
          
          {(plantFilter !== 'ALL' || slocFilter !== 'ALL' || causeFilter !== 'ALL' || statusFilter !== 'ALL' || search !== '') && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5 flex items-center gap-1 hover:bg-rose-100 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="자재코드, LOT번호 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Plant Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">공장</span>
          <select
            value={plantFilter}
            onChange={(e) => {
              setPlantFilter(e.target.value);
              setSlocFilter('ALL'); // Reset dependent sloc
            }}
            className="w-full py-1.5 text-xs bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer text-slate-700 font-medium"
          >
            {uniquePlants.map((plant) => (
              <option key={plant} value={plant}>
                {plant === 'ALL' ? '전체 공장' : `${plant}`}
              </option>
            ))}
          </select>
        </div>

        {/* Storage Location Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">위치</span>
          <select
            value={slocFilter}
            onChange={(e) => setSlocFilter(e.target.value)}
            className="w-full py-1.5 text-xs bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer text-slate-700 font-medium"
            disabled={plantFilter === 'ALL' && uniqueSlocs.length <= 1}
          >
            {uniqueSlocs.map((sloc) => (
              <option key={sloc} value={sloc}>
                {sloc === 'ALL' ? '전체 저장위치' : `${sloc}`}
              </option>
            ))}
          </select>
        </div>

        {/* Cause Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">원인</span>
          <select
            value={causeFilter}
            onChange={(e) => setCauseFilter(e.target.value)}
            className="w-full py-1.5 text-xs bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer text-slate-700 font-medium"
          >
            {uniqueCauses.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">조치</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-1.5 text-xs bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer text-slate-700 font-medium"
          >
            <option value="ALL">전체 조치상태</option>
            <option value="PENDING">대기중</option>
            <option value="INVESTIGATING">분석/추적중</option>
            <option value="RESOLVED">조치완료</option>
          </select>
        </div>
      </div>

      {/* Main Grid Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 text-center w-12">No</th>
              <th className="py-3 px-4">자재정보</th>
              <th className="py-3 px-4">위치 (공장/SLOC)</th>
              <th className="py-3 px-4">조달/수주번호</th>
              <th className="py-3 px-4 text-right">WMS 수량</th>
              <th className="py-3 px-4 text-right">ERP 수량</th>
              <th className="py-3 px-4 text-right">차이 수량</th>
              <th className="py-3 px-4">자동 차이 원인분석</th>
              <th className="py-3 px-4 text-center">조치상태</th>
              <th className="py-3 px-4 text-center w-20">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="font-bold">조건에 맞는 대사 차이 내역이 없습니다.</p>
                  <p className="text-[11px] text-slate-400 mt-1">필터 또는 검색어를 조정하여 주십시오.</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const diffValue = item.diffQty;
                const hasDiff = diffValue !== 0;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/75 transition-colors cursor-pointer group ${
                      hasDiff ? 'bg-white' : 'bg-slate-50/20 text-slate-400'
                    }`}
                    onClick={() => onViewDetail(item)}
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    {/* Material Info */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {item.material}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-slate-100 border border-slate-150 text-[10px] text-slate-500 rounded font-medium">
                            LOT: {item.lotNo}
                          </span>
                          <span className="text-[10px] text-slate-300 font-semibold">{item.materialType}</span>
                        </div>
                      </div>
                    </td>

                    {/* Plant & SLOC */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">공장 {item.plant}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">저장위치: {item.sloc}</div>
                    </td>

                    {/* Order Information */}
                    <td className="py-3 px-4">
                      {item.wmsStrategy || item.erpStrategy ? (
                        <div>
                          <span className="font-medium text-slate-600 bg-slate-100 text-[10px] px-1 rounded">
                            {item.wmsStrategy || item.erpStrategy}
                          </span>
                          {(item.wmsOrderNo || item.erpOrderNo) && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              #{item.wmsOrderNo || item.erpOrderNo}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-medium">-</span>
                      )}
                    </td>

                    {/* WMS Qty */}
                    <td className="py-3 px-4 text-right font-semibold text-slate-800 font-mono">
                      {item.wmsQty.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                    </td>

                    {/* ERP Qty */}
                    <td className="py-3 px-4 text-right font-semibold text-slate-800 font-mono">
                      {item.erpQty.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                    </td>

                    {/* Diff Qty */}
                    <td className="py-3 px-4 text-right font-bold font-mono">
                      {diffValue === 0 ? (
                        <span className="text-slate-400">0</span>
                      ) : diffValue < 0 ? (
                        <span className="text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded text-[11px] flex items-center justify-end gap-0.5 w-fit ml-auto">
                          <ArrowDown className="w-3 h-3" />
                          {Math.abs(diffValue).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[11px] flex items-center justify-end gap-0.5 w-fit ml-auto">
                          <ArrowUp className="w-3 h-3" />
                          {diffValue.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Auto Analysis */}
                    <td className="py-3 px-4">
                      {hasDiff ? (
                        <div className="space-y-0.5">
                          {getCauseBadge(item.autoAnalysis?.cause)}
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]" title={item.autoAnalysis?.description}>
                            {item.autoAnalysis?.description}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[11px]">차이 없음</span>
                      )}
                    </td>

                    {/* Status badge and quick update indicator */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(item.status)}
                        {item.comment && (
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5" title={item.comment}>
                            <MessageSquare className="w-3 h-3 text-slate-300" />
                            메모 있음
                          </span>
                        )}
                      </div>
                    </td>

                    {/* View Button */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onViewDetail(item)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-500 rounded-lg transition-all"
                        title="분석 상세"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
