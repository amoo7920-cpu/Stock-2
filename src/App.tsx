import { useState, useEffect, useMemo } from 'react';
import { initialDailyReports } from './data/sampleData';
import { analyzeAllDiscrepancies } from './utils/analysis';
import { DailyInventoryReport, DiscrepancyItem, SavedReason } from './types';
import Dashboard from './components/Dashboard';
import DiscrepancyList from './components/DiscrepancyList';
import DiscrepancyDetail from './components/DiscrepancyDetail';
import TransitStockList from './components/TransitStockList';
import DataImporter from './components/DataImporter';
import SplitQuadrantView from './components/SplitQuadrantView';
import SavedReasonsManager from './components/SavedReasonsManager';
import InitialUploadModal from './components/InitialUploadModal';
import { LayoutDashboard, AlertTriangle, Truck, UploadCloud, Database, History, HelpCircle, Columns, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<DailyInventoryReport[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-08');
  const [activeTab, setActiveTab] = useState<'RECON_4SPLIT' | 'DASHBOARD' | 'DISCREPANCIES' | 'TRANSIT' | 'REASONS_DB' | 'IMPORT'>('RECON_4SPLIT');
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<DiscrepancyItem | null>(null);
  
  // Instant upload modal on app load
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(true);

  // Saved Reasons Database for auto-matching
  const [savedReasons, setSavedReasons] = useState<SavedReason[]>([]);

  // Initialize from localStorage or default data
  useEffect(() => {
    // 1. Load Saved Reasons (과거 사유 데이터베이스)
    const savedRules = localStorage.getItem('wms_erp_saved_reasons');
    if (savedRules) {
      try {
        setSavedReasons(JSON.parse(savedRules));
      } catch (e) {
        seedDefaultReasons();
      }
    } else {
      seedDefaultReasons();
    }

    // 2. Load Daily Reports
    const savedReports = localStorage.getItem('wms_erp_reports');
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports) as DailyInventoryReport[];
        setReports(parsed);
        if (parsed.length > 0) {
          const sorted = [...parsed].sort((a, b) => b.date.localeCompare(a.date));
          setSelectedDate(sorted[0].date);
        }
      } catch (e) {
        seedDefaultReportsData();
      }
    } else {
      seedDefaultReportsData();
    }
  }, []);

  const seedDefaultReasons = () => {
    const demoReasons: SavedReason[] = [
      {
        id: 'rule-1',
        plant: '3000',
        sloc: '2400',
        material: 'HI880-E1',
        lotNo: 'C26I0601',
        status: 'RESOLVED',
        comment: '출발저장위치 2400에서 실물 출하완료되어 입고 대기중인 정상 이송 수량입니다. 운송용 바코드 T2-1~8 매핑 확인됨.',
        assignee: '김물류 과장',
        savedAt: new Date().toISOString()
      },
      {
        id: 'rule-2',
        plant: '3000',
        sloc: '2400',
        material: 'BN740-G1',
        lotNo: 'D26I0508',
        status: 'RESOLVED',
        comment: 'ERP 전산 출하분개 지연 상태. WMS 실물 하역 스캔은 완료되었으나 ERP에 미반영되어 발생한 일시적 차이입니다.',
        assignee: '박자재 대리',
        savedAt: new Date().toISOString()
      },
      {
        id: 'rule-3',
        plant: '3000',
        sloc: '2400',
        material: 'VR1B-F1',
        lotNo: 'D26I0102',
        status: 'INVESTIGATING',
        comment: 'WMS 보류상태(Blocked) 수량이 ERP와 미세하게 다른 상태. 현장 실사 재조정 필요.',
        assignee: '이지원 주임',
        savedAt: new Date().toISOString()
      }
    ];
    setSavedReasons(demoReasons);
    localStorage.setItem('wms_erp_saved_reasons', JSON.stringify(demoReasons));
  };

  const seedDefaultReportsData = () => {
    const analyzed = initialDailyReports.map((report) => ({
      ...report,
      discrepancies: analyzeAllDiscrepancies(report.discrepancies, report.transitStock)
    }));
    setReports(analyzed);
    localStorage.setItem('wms_erp_reports', JSON.stringify(analyzed));
    setSelectedDate('2026-09-08');
  };

  // Helper to save reports
  const saveReports = (updatedReports: DailyInventoryReport[]) => {
    setReports(updatedReports);
    localStorage.setItem('wms_erp_reports', JSON.stringify(updatedReports));
  };

  // Get active report
  const activeReport = useMemo(() => {
    const r = reports.find((x) => x.date === selectedDate);
    if (r) return r;
    return reports[reports.length - 1] || null;
  }, [reports, selectedDate]);

  // Update discrepancy action state & auto-train the Past Reasons DB
  const handleUpdateDiscrepancyStatus = (
    itemId: string,
    status: DiscrepancyItem['status'],
    comment?: string,
    assignee?: string
  ) => {
    if (!activeReport) return;

    let targetItem: DiscrepancyItem | null = null;

    const updatedDiscrepancies = activeReport.discrepancies.map((d) => {
      if (d.id === itemId) {
        targetItem = {
          ...d,
          status,
          comment: comment !== undefined ? comment : d.comment,
          assignee: assignee !== undefined ? assignee : d.assignee,
          updatedAt: new Date().toISOString()
        };
        return targetItem;
      }
      return d;
    });

    const updatedReport: DailyInventoryReport = {
      ...activeReport,
      discrepancies: updatedDiscrepancies,
      lastUpdated: new Date().toISOString()
    };

    const updatedReports = reports.map((r) => (r.date === selectedDate ? updatedReport : r));
    saveReports(updatedReports);

    // Auto-update modal if open
    if (selectedDiscrepancy && selectedDiscrepancy.id === itemId && targetItem) {
      setSelectedDiscrepancy(targetItem);
    }

    // Auto-train the Past Reasons Database with this newly resolved comment!
    if (targetItem && comment && status !== 'PENDING') {
      const item: DiscrepancyItem = targetItem;
      const key = `${item.material}-${item.lotNo}`.toLowerCase();
      
      // Update or create in template reasons
      setSavedReasons((prev) => {
        const filtered = prev.filter(r => `${r.material}-${r.lotNo}`.toLowerCase() !== key);
        const updated = [
          ...filtered,
          {
            id: `rule-${Date.now()}`,
            plant: item.plant,
            sloc: item.sloc,
            material: item.material,
            lotNo: item.lotNo,
            status,
            comment: comment,
            assignee: assignee || '시스템 학습',
            savedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('wms_erp_saved_reasons', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Apply a matched historical reason template to a current discrepancy
  const handleApplySavedReason = (
    itemId: string,
    status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED',
    comment: string,
    assignee: string
  ) => {
    handleUpdateDiscrepancyStatus(itemId, status, comment, assignee);
  };

  // Triggered when user completes custom files upload or actual sample import in the modal
  const handleUploadSuccess = (newReport: DailyInventoryReport) => {
    // Overwrite reports with only the newly uploaded date, deleting background sample logs!
    // This perfectly satisfies the requirement: "업로드 후에는 기존의 샘플 데이터는 지우고, 업로드한 데이터 기준으로 출력되게 해줘"
    const cleanedReports = [newReport];
    saveReports(cleanedReports);
    setSelectedDate(newReport.date);
    setActiveTab('RECON_4SPLIT'); // Transition to 4-split reconciliation quadrant directly
  };

  const handleImportReport = (newReport: DailyInventoryReport) => {
    // Merges manually imported report from import tab
    const index = reports.findIndex((r) => r.date === newReport.date);
    let updated: DailyInventoryReport[];
    if (index >= 0) {
      updated = reports.map((r) => (r.date === newReport.date ? newReport : r));
    } else {
      updated = [...reports, newReport];
    }
    saveReports(updated);
    setSelectedDate(newReport.date);
    setActiveTab('RECON_4SPLIT');
  };

  const handleDeleteReport = (dateToDelete: string) => {
    if (reports.length <= 1) return;
    const updated = reports.filter((r) => r.date !== dateToDelete);
    saveReports(updated);
    if (selectedDate === dateToDelete) {
      setSelectedDate(updated[updated.length - 1].date);
    }
  };

  // Add a manual reason template directly in Reasons Manager
  const handleAddReasonTemplate = (newReason: Omit<SavedReason, 'id' | 'savedAt'>) => {
    const created: SavedReason = {
      ...newReason,
      id: `rule-${Date.now()}`,
      savedAt: new Date().toISOString()
    };
    const updated = [...savedReasons, created];
    setSavedReasons(updated);
    localStorage.setItem('wms_erp_saved_reasons', JSON.stringify(updated));
  };

  const handleDeleteReasonTemplate = (id: string) => {
    const updated = savedReasons.filter(r => r.id !== id);
    setSavedReasons(updated);
    localStorage.setItem('wms_erp_saved_reasons', JSON.stringify(updated));
  };

  const totalDiscrepantCount = useMemo(() => {
    if (!activeReport) return 0;
    return activeReport.discrepancies.filter((d) => d.diffQty !== 0).length;
  }, [activeReport]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="main-app-container">
      
      {/* Top Header Panel */}
      <header className="bg-white border-b border-slate-150 sticky top-0 z-40" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                WMS-ERP 일자별 재고 차이 관리 자동화 시스템
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold">
                물류창고 가용·보류 실물 재고 vs ERP 장부 대조 및 이송중 바코드 자동 소거판
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1"
            >
              <UploadCloud className="w-4 h-4" />
              새로운 파일 업로드
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('wms_erp_reports');
                localStorage.removeItem('wms_erp_saved_reasons');
                seedDefaultReportsData();
                seedDefaultReasons();
                window.location.reload();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="데이터베이스 전체 초기화"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Navigation Tabs */}
      <nav className="bg-white border-b border-slate-150" id="app-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto scrollbar-none py-1">
            
            {/* Split Quadrant Screen */}
            <button
              onClick={() => setActiveTab('RECON_4SPLIT')}
              className={`flex items-center gap-1.5 py-3.5 px-2 text-xs font-bold border-b-2 transition-all relative ${
                activeTab === 'RECON_4SPLIT'
                  ? 'border-slate-900 text-slate-900 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="w-4 h-4 text-indigo-600" />
              <span>실시간 4분할 대사판</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                Core
              </span>
            </button>

            {/* Dashboard Tab */}
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center gap-1.5 py-3.5 px-2 text-xs font-bold border-b-2 transition-all relative ${
                activeTab === 'DASHBOARD'
                  ? 'border-slate-900 text-slate-900 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>종합 대시보드</span>
            </button>

            {/* Discrepancy Tab */}
            <button
              onClick={() => setActiveTab('DISCREPANCIES')}
              className={`flex items-center gap-1.5 py-3.5 px-2 text-xs font-bold border-b-2 transition-all relative ${
                activeTab === 'DISCREPANCIES'
                  ? 'border-slate-900 text-slate-900 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>재고 차이 분석 목록</span>
              {totalDiscrepantCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-200 rounded-full">
                  {totalDiscrepantCount}
                </span>
              )}
            </button>

            {/* Transit Stock Tab */}
            <button
              onClick={() => setActiveTab('TRANSIT')}
              className={`flex items-center gap-1.5 py-3.5 px-2 text-xs font-bold border-b-2 transition-all relative ${
                activeTab === 'TRANSIT'
                  ? 'border-slate-900 text-slate-900 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>이송중 재고 현황</span>
            </button>

            {/* Past Reason Templates database */}
            <button
              onClick={() => setActiveTab('REASONS_DB')}
              className={`flex items-center gap-1.5 py-3.5 px-2 text-xs font-bold border-b-2 transition-all relative ${
                activeTab === 'REASONS_DB'
                  ? 'border-slate-900 text-slate-900 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span>과거 사유 데이터베이스</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                {savedReasons.length}
              </span>
            </button>

            {/* Import Data Tab */}
            <button
              onClick={() => setActiveTab('IMPORT')}
              className={`flex items-center gap-1.5 py-3.5 px-2 text-xs font-bold border-b-2 transition-all relative ${
                activeTab === 'IMPORT'
                  ? 'border-slate-900 text-slate-900 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>수동 연동/관리</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeReport ? (
          <>
            {activeTab === 'RECON_4SPLIT' && (
              <SplitQuadrantView
                discrepancies={activeReport.discrepancies}
                transitStock={activeReport.transitStock}
                slocDiscrepancies={activeReport.slocDiscrepancies}
                onViewDetail={setSelectedDiscrepancy}
                savedReasons={savedReasons}
                onApplySavedReason={handleApplySavedReason}
              />
            )}

            {activeTab === 'DASHBOARD' && (
              <Dashboard
                report={activeReport}
                historicalReports={reports}
                onSelectDate={setSelectedDate}
                onViewDiscrepancy={(item) => {
                  setSelectedDiscrepancy(item);
                  setActiveTab('RECON_4SPLIT');
                }}
              />
            )}

            {activeTab === 'DISCREPANCIES' && (
              <DiscrepancyList
                discrepancies={activeReport.discrepancies}
                onViewDetail={setSelectedDiscrepancy}
                onUpdateStatus={handleUpdateDiscrepancyStatus}
              />
            )}

            {activeTab === 'TRANSIT' && (
              <TransitStockList transitStock={activeReport.transitStock} />
            )}

            {activeTab === 'REASONS_DB' && (
              <SavedReasonsManager
                savedReasons={savedReasons}
                onDeleteReason={handleDeleteReasonTemplate}
                onAddReason={handleAddReasonTemplate}
              />
            )}

            {activeTab === 'IMPORT' && (
              <DataImporter
                onImportReport={handleImportReport}
                onDeleteReport={handleDeleteReport}
                existingDates={reports.map((r) => r.date).sort()}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-150 rounded-xl">
            <span className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3">
              <Database className="w-8 h-8 animate-pulse" />
            </span>
            <p className="font-bold text-slate-700">WMS-ERP 대사 데이터베이스 로딩 중...</p>
            <p className="text-xs text-slate-400 mt-1">로컬 저장소 동기화 중입니다.</p>
          </div>
        )}
      </main>

      {/* Slide-out Root-Cause Analyzer Panel */}
      {activeReport && (
        <DiscrepancyDetail
          item={selectedDiscrepancy}
          onClose={() => setSelectedDiscrepancy(null)}
          transitStock={activeReport.transitStock}
          onUpdateStatus={handleUpdateDiscrepancyStatus}
        />
      )}

      {/* Initial Startup Upload Dialog */}
      <InitialUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Bottom Footer */}
      <footer className="bg-white border-t border-slate-150 py-4 mt-12 text-center text-[10px] text-slate-400 font-semibold tracking-wide">
        <p>© 2026 WMS-ERP Stock Discrepancy Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
}
