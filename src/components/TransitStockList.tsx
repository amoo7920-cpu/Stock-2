import { useState, useMemo } from 'react';
import { TransitStockItem } from '../types';
import { Search, Truck, MapPin, Box, ArrowRight, HelpCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface TransitStockListProps {
  transitStock: TransitStockItem[];
}

export default function TransitStockList({ transitStock }: TransitStockListProps) {
  const [search, setSearch] = useState('');
  const [outSlocFilter, setOutSlocFilter] = useState('ALL');
  const [inSlocFilter, setInSlocFilter] = useState('ALL');

  // Filter unique locations
  const outSlocs = useMemo(() => {
    const slocs = new Set(transitStock.map((t) => t.outSloc));
    return ['ALL', ...Array.from(slocs)];
  }, [transitStock]);

  const inSlocs = useMemo(() => {
    const slocs = new Set(transitStock.map((t) => t.inSloc));
    return ['ALL', ...Array.from(slocs)];
  }, [transitStock]);

  // Filter logic
  const filteredTransit = useMemo(() => {
    return transitStock.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        item.material.toLowerCase().includes(searchLower) ||
        item.materialDesc.toLowerCase().includes(searchLower) ||
        item.lotNo.toLowerCase().includes(searchLower) ||
        item.packageNo.toLowerCase().includes(searchLower);

      const matchesOut = outSlocFilter === 'ALL' || item.outSloc === outSlocFilter;
      const matchesIn = inSlocFilter === 'ALL' || item.inSloc === inSlocFilter;

      return matchesSearch && matchesOut && matchesIn;
    });
  }, [transitStock, search, outSlocFilter, inSlocFilter]);

  // Stats
  const totalPackages = filteredTransit.length;
  const totalWeight = filteredTransit.reduce((sum, item) => sum + item.qty, 0);

  // Group by material and lot to see an aggregated view
  const aggregatedTransit = useMemo(() => {
    const groups: Record<string, { material: string; desc: string; lotNo: string; qty: number; count: number; outSloc: string; inSloc: string }> = {};
    
    filteredTransit.forEach((item) => {
      const key = `${item.material}-${item.lotNo}`;
      if (!groups[key]) {
        groups[key] = {
          material: item.material,
          desc: item.materialDesc,
          lotNo: item.lotNo,
          qty: 0,
          count: 0,
          outSloc: item.outSloc,
          inSloc: item.inSloc
        };
      }
      groups[key].qty += item.qty;
      groups[key].count += 1;
    });

    return Object.values(groups);
  }, [filteredTransit]);

  return (
    <div className="space-y-6" id="transit-stock-view">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Transit Summary Card */}
        <div className="bg-indigo-900 text-white p-5 rounded-xl border border-indigo-950 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-800 rounded-lg">
            <Truck className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">실시간 이송중 총량</span>
            <div className="text-xl font-extrabold tracking-tight mt-0.5">
              {totalWeight.toLocaleString()} <span className="text-xs font-normal text-indigo-200">KG</span>
            </div>
            <div className="text-[10px] text-indigo-200 mt-0.5">전체 {totalPackages} 상자 이동 중</div>
          </div>
        </div>

        {/* Departure Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-lg">
            <MapPin className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">활성 이송 출발지</span>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {outSlocFilter === 'ALL' ? '모든 저장위치' : `저장위치 ${outSlocFilter}`}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              공장 3000(SLOC 2400) 외
            </div>
          </div>
        </div>

        {/* Destination Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-lg">
            <Box className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">수하 목적지</span>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {inSlocFilter === 'ALL' ? '모든 저장위치' : `저장위치 ${inSlocFilter}`}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              공장 3000(SLOC 4400) 외
            </div>
          </div>
        </div>
      </div>

      {/* Main Table and Aggregates */}
      <div className="bg-white rounded-xl border border-slate-150 shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">이송중 재고 (Stock-in-Transit) 마스터</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ERP 송하 완료 후 수하 WMS 대기 중인 실시간 운송 내역입니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="자재코드, LOT, 바코드 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-48"
              />
            </div>

            {/* Out SLoc Filter */}
            <select
              value={outSlocFilter}
              onChange={(e) => setOutSlocFilter(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none bg-white cursor-pointer font-medium text-slate-700"
            >
              <option value="ALL">출발지 전체</option>
              {outSlocs.filter(s => s !== 'ALL').map((s) => (
                <option key={s} value={s}>출발 {s}</option>
              ))}
            </select>

            {/* In SLoc Filter */}
            <select
              value={inSlocFilter}
              onChange={(e) => setInSlocFilter(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none bg-white cursor-pointer font-medium text-slate-700"
            >
              <option value="ALL">도착지 전체</option>
              {inSlocs.filter(s => s !== 'ALL').map((s) => (
                <option key={s} value={s}>도착 {s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Column: Aggregated View by Material & Lot */}
          <div className="p-5 lg:col-span-1 space-y-4">
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">자재별 이송 합계</h4>
              <p className="text-[10px] text-slate-400">자재 및 LOT별로 통합된 수량입니다.</p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {aggregatedTransit.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">이송중 내역이 없습니다.</p>
              ) : (
                aggregatedTransit.map((agg) => (
                  <div key={`${agg.material}-${agg.lotNo}`} className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{agg.material}</span>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">LOT: {agg.lotNo}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">{agg.qty.toLocaleString()} KG</span>
                        <div className="text-[9px] font-bold text-slate-400">{agg.count} 상자</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 bg-white px-2 py-1.5 rounded-lg border border-slate-100">
                      <span className="px-1 bg-slate-150 rounded text-slate-600 font-bold">{agg.outSloc}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="px-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded font-bold">{agg.inSloc}</span>
                      <span className="ml-auto text-[9px] text-indigo-500 font-bold bg-indigo-50/50 px-1 rounded">정상 매핑</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Detailed Package List (1-by-1 box level) */}
          <div className="p-5 lg:col-span-2 space-y-4">
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">상자 일련번호별 이송 상세</h4>
              <p className="text-[10px] text-slate-400">개별 포장 상자(Package) 바코드 리스트입니다.</p>
            </div>

            <div className="overflow-x-auto border border-slate-150 rounded-xl max-h-[380px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                    <th className="py-2.5 px-3 text-center">No</th>
                    <th className="py-2.5 px-3">상자 번호</th>
                    <th className="py-2.5 px-3">자재코드 및 이름</th>
                    <th className="py-2.5 px-3">LOT 번호</th>
                    <th className="py-2.5 px-3 text-right">수량</th>
                    <th className="py-2.5 px-3 text-center">운송상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTransit.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        검색 조건에 맞는 포장 상자가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredTransit.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{t.packageNo}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{t.material}</div>
                          <div className="text-[9px] text-slate-400 font-medium truncate max-w-[180px]">{t.materialDesc}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-semibold">{t.lotNo}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800 font-mono">
                          {t.qty.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">{t.unit}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold text-[9px] rounded-md">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
