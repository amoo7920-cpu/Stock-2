import { DailyInventoryReport, DiscrepancyItem } from '../types';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, Eye, Info, Package, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';

interface DashboardProps {
  report: DailyInventoryReport;
  historicalReports: DailyInventoryReport[];
  onSelectDate: (date: string) => void;
  onViewDiscrepancy: (item: DiscrepancyItem) => void;
}

export default function Dashboard({
  report,
  historicalReports,
  onSelectDate,
  onViewDiscrepancy
}: DashboardProps) {
  const { discrepancies, date } = report;

  // KPIs
  const totalChecked = discrepancies.length;
  const discrepanciesWithDiff = discrepancies.filter((d) => d.diffQty !== 0);
  const totalDiscrepantItems = discrepanciesWithDiff.length;
  const discrepancyRate = totalChecked > 0 ? (totalDiscrepantItems / totalChecked) * 100 : 0;

  const totalDiffQty = discrepanciesWithDiff.reduce((sum, d) => sum + Math.abs(d.diffQty), 0);
  const resolvedCount = discrepancies.filter((d) => d.status === 'RESOLVED').length;
  const investigatingCount = discrepancies.filter((d) => d.status === 'INVESTIGATING').length;
  const pendingCount = discrepancies.filter((d) => d.status === 'PENDING').length;
  
  const actionRate = totalDiscrepantItems > 0 
    ? ((resolvedCount + investigatingCount) / totalDiscrepantItems) * 100 
    : 0;

  // Discrepancy Causes breakdown
  const causeCount = discrepanciesWithDiff.reduce((acc, d) => {
    const cause = d.autoAnalysis?.cause || 'QTY_MISMATCH';
    acc[cause] = (acc[cause] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const causeLabels: Record<string, { label: string; color: string; bg: string }> = {
    TRANSIT_STOCK: { label: '이송중 재고 영향', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    STATUS_MISMATCH: { label: '재고 상태 불일치', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    SLOC_MISMATCH: { label: '저장위치 불일치', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    NOT_IN_WMS: { label: 'WMS 누락', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    NOT_IN_ERP: { label: 'ERP 누락', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    QTY_MISMATCH: { label: '수량 상이', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' }
  };

  // Prepare historical data for trend line (sorted chronologically)
  const sortedHistory = [...historicalReports].sort((a, b) => a.date.localeCompare(b.date));

  // Top 5 materials with highest discrepancy Qty
  const topDiscrepantMaterials = [...discrepanciesWithDiff]
    .sort((a, b) => Math.abs(b.diffQty) - Math.abs(a.diffQty))
    .slice(0, 5);

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Date Selector & Refresh Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-medium text-slate-500">대사 보고서 기준일자</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{date}</span>
            <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-medium">WMS & ERP 정상 연동됨</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 mr-1">보고서 이동:</label>
          <div className="flex gap-1 overflow-x-auto max-w-full">
            {sortedHistory.map((h) => (
              <button
                key={h.date}
                onClick={() => onSelectDate(h.date)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${
                  h.date === date
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {h.date.substring(5)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Discrepancy Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">전체 차이 발생건</span>
              <span className="p-1 bg-rose-50 text-rose-600 rounded-lg">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{totalDiscrepantItems}</span>
              <span className="text-xs text-slate-400">/ {totalChecked} 품목</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-rose-600">{(discrepancyRate).toFixed(1)}%</span>
            <span>시스템 간 불일치 비율</span>
          </div>
        </div>

        {/* Total Discrepancy Quantity */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">누적 불일치 수량</span>
              <span className="p-1 bg-amber-50 text-amber-600 rounded-lg">
                <Package className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{totalDiffQty.toLocaleString()}</span>
              <span className="text-xs text-slate-500">KG</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-amber-600">
              {(causeCount['TRANSIT_STOCK'] || 0)}건 이송중
            </span>
            <span>정상적 일시 불일치 원인 포함</span>
          </div>
        </div>

        {/* Action Status Tracker */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">원인 분석 및 조치율</span>
              <span className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{actionRate.toFixed(1)}%</span>
              <span className="text-xs text-slate-400">({resolvedCount + investigatingCount} / {totalDiscrepantItems}건)</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{resolvedCount} 조치</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>{investigatingCount} 추적</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span>{pendingCount} 대기</span>
          </div>
        </div>

        {/* Transit Stock Weight Impact */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">이송중 재고 비중</span>
              <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">
                {(((causeCount['TRANSIT_STOCK'] || 0) / (totalDiscrepantItems || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-slate-400">({causeCount['TRANSIT_STOCK'] || 0}건)</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-indigo-600">이송 완료 시 자동 해소</span>
            <span>되는 정상 수량</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Line Chart (SVG) */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">일자별 차이 발생 건수 추이</h3>
              <p className="text-xs text-slate-400 mt-0.5">WMS-ERP 전산 대사 데이터 변동 트렌드</p>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              최근 하락세 (개선 중)
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-[220px] w-full flex items-end relative pt-4 pb-2">
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-100 border-dashed"></div>
            <div className="absolute inset-x-0 top-1/4 border-t border-slate-100 border-dashed"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-slate-100 border-dashed"></div>
            
            {/* SVG Plot */}
            <svg className="absolute inset-0 w-full h-[180px] overflow-visible" preserveAspectRatio="none">
              {(() => {
                const maxVal = Math.max(...sortedHistory.map(h => h.discrepancies.filter(d => d.diffQty !== 0).length), 10);
                const paddingLeft = 40;
                const paddingRight = 40;
                const plotHeight = 140;
                const plotWidth = 100; // will use percentage

                const points = sortedHistory.map((h, i) => {
                  const count = h.discrepancies.filter(d => d.diffQty !== 0).length;
                  const x = i * (100 / (sortedHistory.length - 1 || 1));
                  const y = plotHeight - (count / maxVal) * plotHeight + 20;
                  return { x, y, count, date: h.date };
                });

                const pathD = points.reduce((acc, p, i) => {
                  return acc + `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}`;
                }, '');

                return (
                  <>
                    {/* Background Gradients */}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Area path */}
                    {points.length > 0 && (
                      <path
                        d={`${pathD} L ${points[points.length - 1].x}% ${plotHeight + 20} L ${points[0].x}% ${plotHeight + 20} Z`}
                        fill="url(#chartGrad)"
                      />
                    )}

                    {/* Stroke line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Circles on Nodes */}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={`${p.x}%`}
                          cy={p.y}
                          r="5"
                          fill="#3b82f6"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="cursor-pointer hover:r-7 transition-all duration-150"
                        />
                        <text
                          x={`${p.x}%`}
                          y={p.y - 12}
                          textAnchor="middle"
                          className="text-[10px] font-bold fill-blue-700"
                        >
                          {p.count}건
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* X-Axis labels */}
            <div className="absolute bottom-0 inset-x-0 flex justify-between px-2 text-[10px] font-semibold text-slate-400">
              {sortedHistory.map((h) => (
                <span key={h.date}>{h.date.substring(5)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Cause Breakdown (Widget list) */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4">불일치 유형/원인별 분포</h3>
          
          <div className="space-y-3.5">
            {Object.entries(causeLabels).map(([key, config]) => {
              const count = causeCount[key] || 0;
              const percentage = totalDiscrepantItems > 0 ? (count / totalDiscrepantItems) * 100 : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${key === 'TRANSIT_STOCK' ? 'bg-indigo-500' : key === 'STATUS_MISMATCH' ? 'bg-amber-500' : key === 'NOT_IN_WMS' ? 'bg-rose-500' : key === 'NOT_IN_ERP' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {config.label}
                    </span>
                    <span className="font-bold text-slate-900">
                      {count}건 <span className="text-slate-400 font-normal">({percentage.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        key === 'TRANSIT_STOCK'
                          ? 'bg-indigo-500'
                          : key === 'STATUS_MISMATCH'
                          ? 'bg-amber-500'
                          : key === 'SLOC_MISMATCH'
                          ? 'bg-cyan-500'
                          : key === 'NOT_IN_WMS'
                          ? 'bg-rose-500'
                          : key === 'NOT_IN_ERP'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low-Level Analytics Row (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Discrepant Materials List */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">금일 최대 차이 발생 품목 (Top 5)</h3>
              <p className="text-xs text-slate-400 mt-0.5">실물 대조나 이송 전산 조치 우선순위 지정</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded">차이량 기준</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topDiscrepantMaterials.map((item, idx) => {
              const config = causeLabels[item.autoAnalysis?.cause || 'QTY_MISMATCH'];
              return (
                <div key={item.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 flex items-center justify-center text-[10px] font-extrabold bg-slate-100 text-slate-600 rounded-full">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{item.material}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded font-medium">LOT: {item.lotNo}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">저장위치 {item.sloc}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className={`text-[10px] font-semibold ${config.color}`}>{config.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900">
                        {Math.abs(item.diffQty).toLocaleString()} {item.unit}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        WMS {item.wmsQty.toLocaleString()} / ERP {item.erpQty.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onViewDiscrepancy(item)}
                      className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      title="원인 상세 분석 보기"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Suggestion & Daily Memo Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">금일 재고 대사 일지 및 조치 제안</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold flex items-center gap-1">
                <Info className="w-3 h-3" />
                자동 분석 가이드
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  📝 {date} 대사 담당지 기록
                </p>
                <p className="italic text-slate-500 text-[11px]">
                  "{report.note || '등록된 일일 비고가 없습니다. 우측 상단 데이터 관리에서 기재할 수 있습니다.'}"
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">추천 다음 조치단계:</h4>
                
                <div className="flex gap-2.5 items-start">
                  <span className="w-4 h-4 mt-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    <strong className="text-slate-800">이송중 재고 상태 점검:</strong> {causeCount['TRANSIT_STOCK'] || 0}건의 이송중 재고 영향 품목은 입고 완료 처리 시 차이가 자동 해소됩니다. 입고 창고 부서에 수하 입고 등록 독려가 우선시됩니다.
                  </p>
                </div>

                <div className="flex gap-2.5 items-start">
                  <span className="w-4 h-4 mt-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    <strong className="text-slate-800">WMS 단독 누락 재고 실사:</strong> WMS 수량은 0인데 ERP 수량이 존재하는 품목 중 이송중이 아닌 건들은 실제 생산실적(GR)은 생성되었으나 WMS 상자 적치 스캔이 지연되었는지 검토하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>마지막 대사 업데이트: {new Date(report.lastUpdated).toLocaleString('ko-KR')}</span>
            <span>시스템 버전 v1.2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
