import { useState } from 'react';
import { DailyInventoryReport, DiscrepancyItem, TransitStockItem, StorageLocationItem } from '../types';
import { parseCSVData } from '../utils/csvParser';
import { sampleDiscrepancies, sampleTransitStock, sampleSlocDiscrepancies } from '../data/sampleData';
import { analyzeAllDiscrepancies } from '../utils/analysis';
import { UploadCloud, FileSpreadsheet, Plus, AlertCircle, Info, Check, Trash2, FileText } from 'lucide-react';

interface InitialUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (report: DailyInventoryReport) => void;
}

export default function InitialUploadModal({
  isOpen,
  onClose,
  onUploadSuccess
}: InitialUploadModalProps) {
  const [importDate, setImportDate] = useState('2026-09-08');
  const [dailyNote, setDailyNote] = useState('실시간 ERP-WMS 데이터 연동 대사 작업 진행.');
  const [activeSubTab, setActiveSubTab] = useState<'BATCH' | 'AUTO' | 'PASTE'>('BATCH');
  
  // Custom CSV text states
  const [qtyText, setQtyText] = useState('');
  const [statusText, setStatusText] = useState('');
  const [slocText, setSlocText] = useState('');
  const [transitText, setTransitText] = useState('');

  // Batch files tracking state
  const [batchFiles, setBatchFiles] = useState<{
    QTY?: { name: string; size: number };
    STATUS?: { name: string; size: number };
    SLOC?: { name: string; size: number };
    TRANSIT?: { name: string; size: number };
  }>({});

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Helper: Auto detect file type from CSV text content
  const detectFileType = (text: string): 'QTY' | 'STATUS' | 'SLOC' | 'TRANSIT' | 'UNKNOWN' => {
    const lines = text.split(/\r?\n/).slice(0, 15).map(l => l.trim().toLowerCase()).filter(l => l.length > 0);
    for (const line of lines) {
      if (
        line.includes('wms_구분') || 
        line.includes('wms 수량') || 
        line.includes('wms수량') || 
        (line.includes('wms_') && line.includes('erp_') && line.includes('차이 수량'))
      ) {
        return 'QTY';
      }
      if (
        line.includes('w_검사') || 
        line.includes('w_가용') || 
        line.includes('w_보류') || 
        line.includes('e_가용') || 
        line.includes('wms_blocked') || 
        line.includes('w_blocked')
      ) {
        return 'STATUS';
      }
      if (
        line.includes('wms_창고') || 
        line.includes('erp_창고') || 
        line.includes('wms_sloc') || 
        line.includes('erp_sloc')
      ) {
        return 'SLOC';
      }
      if (
        line.includes('plant(송하)') || 
        line.includes('s. loc.(송하)') || 
        line.includes('박스일련번호') || 
        line.includes('송하')
      ) {
        return 'TRANSIT';
      }
    }
    return 'UNKNOWN';
  };

  // Process selected or dropped multiple files
  const processBatchFiles = (files: File[]) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    let recognizedCount = 0;
    let unknownCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return;

        const fileType = detectFileType(text);
        if (fileType !== 'UNKNOWN') {
          recognizedCount++;
          if (fileType === 'QTY') {
            setQtyText(text);
            setBatchFiles(prev => ({ ...prev, QTY: { name: file.name, size: file.size } }));
          } else if (fileType === 'STATUS') {
            setStatusText(text);
            setBatchFiles(prev => ({ ...prev, STATUS: { name: file.name, size: file.size } }));
          } else if (fileType === 'SLOC') {
            setSlocText(text);
            setBatchFiles(prev => ({ ...prev, SLOC: { name: file.name, size: file.size } }));
          } else if (fileType === 'TRANSIT') {
            setTransitText(text);
            setBatchFiles(prev => ({ ...prev, TRANSIT: { name: file.name, size: file.size } }));
          }
        } else {
          unknownCount++;
        }

        if (recognizedCount > 0) {
          setSuccessMsg(`성공: 총 ${recognizedCount}개 파일의 대사 유형을 자동 인식하여 정상 매핑했습니다.`);
        }
        if (unknownCount > 0) {
          setErrorMsg(`주의: ${unknownCount}개 파일은 내부 헤더가 매칭되지 않아 분류하지 못했습니다. (확장자 .csv 파일만 가능)`);
        }
      };
      reader.readAsText(file);
    });
  };

  const clearFile = (type: 'QTY' | 'STATUS' | 'SLOC' | 'TRANSIT') => {
    if (type === 'QTY') {
      setQtyText('');
      setBatchFiles(prev => { const copy = { ...prev }; delete copy.QTY; return copy; });
    } else if (type === 'STATUS') {
      setStatusText('');
      setBatchFiles(prev => { const copy = { ...prev }; delete copy.STATUS; return copy; });
    } else if (type === 'SLOC') {
      setSlocText('');
      setBatchFiles(prev => { const copy = { ...prev }; delete copy.SLOC; return copy; });
    } else if (type === 'TRANSIT') {
      setTransitText('');
      setBatchFiles(prev => { const copy = { ...prev }; delete copy.TRANSIT; return copy; });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Option 1: Load sample sheet as pristine uploaded data (Clearing background dummy sample reports)
  const handleLoadActualSampleData = () => {
    try {
      const analyzedDiscrepancies = analyzeAllDiscrepancies(sampleDiscrepancies, sampleTransitStock);
      
      const newReport: DailyInventoryReport = {
        date: importDate,
        discrepancies: analyzedDiscrepancies,
        transitStock: sampleTransitStock,
        slocDiscrepancies: sampleSlocDiscrepancies,
        lastUpdated: new Date().toISOString(),
        note: dailyNote || `${importDate} 일일 재고 대사 완료 (실시간 자동 분석 적용)`
      };

      onUploadSuccess(newReport);
      setSuccessMsg('실제 사용자 샘플 시트 데이터(차이 22건, 이송중 16건)가 성공적으로 연동되었습니다! 기존 샘플 데이터베이스가 삭제되고 업로드 데이터로 교체되었습니다.');
      setErrorMsg('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setErrorMsg(`데이터 로드 중 오류: ${e.message}`);
    }
  };

  // Option 2: Parse manually pasted or batch-uploaded CSV files
  const handleCustomCSVUpload = () => {
    if (!qtyText && !statusText && !slocText && !transitText) {
      setErrorMsg('업로드 또는 복사 붙여넣기할 CSV 텍스트가 비어 있습니다.');
      return;
    }

    try {
      let mergedDiscrepancies: DiscrepancyItem[] = [];
      let mergedTransit: TransitStockItem[] = [];
      let mergedSloc: StorageLocationItem[] = [];

      // Parse Block 1 (Qty)
      if (qtyText) {
        const parsed = parseCSVData(qtyText);
        mergedDiscrepancies = [...mergedDiscrepancies, ...parsed.discrepancies];
      }

      // Parse Block 2 (Status)
      if (statusText) {
        const parsed = parseCSVData(statusText);
        parsed.discrepancies.forEach(item => {
          const match = mergedDiscrepancies.find(d => d.material === item.material && d.lotNo === item.lotNo && d.sloc === item.sloc);
          if (match) {
            match.wmsQuality = item.wmsQuality;
            match.wmsUnrestricted = item.wmsUnrestricted;
            match.wmsBlocked = item.wmsBlocked;
            match.wmsTransit = item.wmsTransit;
            match.erpQuality = item.erpQuality;
            match.erpUnrestricted = item.erpUnrestricted;
            match.erpBlocked = item.erpBlocked;
            match.erpTransit = item.erpTransit;
          } else {
            mergedDiscrepancies.push(item);
          }
        });
      }

      // Parse Block 3 (Sloc)
      if (slocText) {
        const parsed = parseCSVData(slocText);
        mergedSloc = [...mergedSloc, ...parsed.slocDiscrepancies];
      }

      // Parse Block 4 (Transit)
      if (transitText) {
        const parsed = parseCSVData(transitText);
        mergedTransit = [...mergedTransit, ...parsed.transitStock];
      }

      // Fallback if they pasted mixed columns in Qty field
      if (qtyText && mergedDiscrepancies.length === 0 && mergedTransit.length === 0) {
        const parsedAll = parseCSVData(qtyText);
        mergedDiscrepancies = parsedAll.discrepancies;
        mergedTransit = parsedAll.transitStock;
        mergedSloc = parsedAll.slocDiscrepancies;
      }

      // Run automated analysis
      const analyzedDiscrepancies = analyzeAllDiscrepancies(mergedDiscrepancies, mergedTransit);

      const newReport: DailyInventoryReport = {
        date: importDate,
        discrepancies: analyzedDiscrepancies,
        transitStock: mergedTransit,
        slocDiscrepancies: mergedSloc,
        lastUpdated: new Date().toISOString(),
        note: dailyNote || `${importDate} 사용자 4개 업로드 파일 분석 완료.`
      };

      onUploadSuccess(newReport);
      setSuccessMsg('업로드 파일의 데이터 분석 및 연동이 성공적으로 처리되었습니다!');
      setErrorMsg('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setErrorMsg(`CSV 파일 분석 실패: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" id="initial-upload-modal">
      <div className="bg-white rounded-2xl border border-slate-150 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-950 text-white rounded-lg">
                <UploadCloud className="w-5 h-5 animate-bounce" />
              </span>
              <h2 className="text-base font-bold text-slate-900">ERP-WMS 4대 핵심 파일 업로드 연동</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">대시보드를 구동하기 위해 매일 다운로드 받은 4개 파일을 분석 연동합니다.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 text-xs font-bold hover:bg-slate-100 px-2 py-1 rounded-lg"
          >
            닫기
          </button>
        </div>

        {/* Setup Config */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">대사 기준일자</label>
              <input
                type="date"
                value={importDate}
                onChange={(e) => setImportDate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">일일 대사 비고 (메모)</label>
              <input
                type="text"
                placeholder="예: 공장 3000 이송 물량 지연이 많아 수작업 확인 진행"
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex border-b border-slate-150">
            <button
              onClick={() => setActiveSubTab('BATCH')}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
                activeSubTab === 'BATCH'
                  ? 'border-indigo-950 text-indigo-950 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              🚀 한 번에 일괄 업로드
            </button>
            <button
              onClick={() => setActiveSubTab('AUTO')}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
                activeSubTab === 'AUTO'
                  ? 'border-indigo-950 text-indigo-950 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              💡 실제 샘플 즉시 로드
            </button>
            <button
              onClick={() => setActiveSubTab('PASTE')}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
                activeSubTab === 'PASTE'
                  ? 'border-indigo-950 text-indigo-950 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              ✍️ 수동 개별 입력
            </button>
          </div>

          {/* Tab 1: Batch Drag and Drop (Recommended) */}
          {activeSubTab === 'BATCH' && (
            <div className="space-y-4 pt-1">
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) {
                    processBatchFiles(Array.from(e.dataTransfer.files));
                  }
                }}
                className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                onClick={() => document.getElementById('batch-file-input')?.click()}
              >
                <input
                  type="file"
                  id="batch-file-input"
                  multiple
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      processBatchFiles(Array.from(e.target.files));
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="p-3 bg-indigo-50 text-indigo-950 rounded-full">
                    <UploadCloud className="w-8 h-8 animate-pulse" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      여기에 복수의 대사 파일(CSV)을 한 번에 드래그하거나 클릭하여 일괄 선택하세요
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      WMS vs ERP 수량 비교, 상태별 재고, 저장위치별 비교, 이송중 재고 상세 파일을 지능형 자동 분석 매핑합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status checklist */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  핵심 4대 파일 일괄 매핑 현황
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  
                  {/* File 1: QTY */}
                  <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                    batchFiles.QTY 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                      : 'bg-white border-slate-150 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${batchFiles.QTY ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">1. 수량 비교 대사 (QTY)</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {batchFiles.QTY ? `${batchFiles.QTY.name} (${formatSize(batchFiles.QTY.size)})` : '파일 업로드 대기 중'}
                        </p>
                      </div>
                    </div>
                    {batchFiles.QTY && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearFile('QTY'); }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 hover:bg-rose-50 rounded"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  {/* File 2: STATUS */}
                  <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                    batchFiles.STATUS 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                      : 'bg-white border-slate-150 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${batchFiles.STATUS ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">2. 상태별 재고 대사 (STATUS)</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {batchFiles.STATUS ? `${batchFiles.STATUS.name} (${formatSize(batchFiles.STATUS.size)})` : '파일 업로드 대기 중'}
                        </p>
                      </div>
                    </div>
                    {batchFiles.STATUS && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearFile('STATUS'); }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 hover:bg-rose-50 rounded"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  {/* File 3: SLOC */}
                  <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                    batchFiles.SLOC 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                      : 'bg-white border-slate-150 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${batchFiles.SLOC ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">3. 저장위치 대사 (SLOC)</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {batchFiles.SLOC ? `${batchFiles.SLOC.name} (${formatSize(batchFiles.SLOC.size)})` : '파일 업로드 대기 중'}
                        </p>
                      </div>
                    </div>
                    {batchFiles.SLOC && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearFile('SLOC'); }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 hover:bg-rose-50 rounded"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  {/* File 4: TRANSIT */}
                  <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                    batchFiles.TRANSIT 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                      : 'bg-white border-slate-150 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${batchFiles.TRANSIT ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">4. 이송중 재고 상세 (TRANSIT)</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {batchFiles.TRANSIT ? `${batchFiles.TRANSIT.name} (${formatSize(batchFiles.TRANSIT.size)})` : '파일 업로드 대기 중'}
                        </p>
                      </div>
                    </div>
                    {batchFiles.TRANSIT && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearFile('TRANSIT'); }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 hover:bg-rose-50 rounded"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                </div>
              </div>

              <button
                onClick={handleCustomCSVUpload}
                disabled={!qtyText && !statusText && !slocText && !transitText}
                className="w-full py-3 bg-indigo-950 hover:bg-indigo-900 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                업로드된 파일 일괄 대사 분석 및 구동
              </button>
            </div>
          )}

          {/* Tab 2: One-Click Load Actual Samples */}
          {activeSubTab === 'AUTO' && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  원클릭 샘플 업로드 모드안내
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  사용자가 제공해주신 엑셀 시트 4대 품목 리포트의 모든 데이터가 이미 내장되어 있습니다. 아래 버튼을 누르시면, **기존의 기본 백그라운드 샘플 데이터들을 깔끔하게 삭제**하고, 사용자가 업로드한 기준에 맞춰 정확한 4개 분석 분할 화면과 대시보드가 즉시 구성됩니다.
                </p>
                <div className="text-[11px] text-slate-400 space-y-1 bg-white p-2.5 rounded-lg border border-slate-150">
                  <div>• <strong>파일 1 (재고수량 비교)</strong>: 자재코드 22개 차이 내역 매핑</div>
                  <div>• <strong>파일 2 (상태별 재고 비교)</strong>: 가용/보류/품질 검사 수량 분배</div>
                  <div>• <strong>파일 3 (저장위치별 비교)</strong>: SLOC 상이 2개 라인 복원</div>
                  <div>• <strong>파일 4 (이송중 재고 상세)</strong>: 박스 일련번호 16건 연계</div>
                </div>
              </div>

              <button
                onClick={handleLoadActualSampleData}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                사용자 실제 시트 데이터 즉시 업로드 (기존 샘플 삭제)
              </button>
            </div>
          )}

          {/* Tab 3: Custom Text Paste */}
          {activeSubTab === 'PASTE' && (
            <div className="space-y-4 pt-1">
              <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-150 leading-relaxed">
                * 각 파일의 다운로드 텍스트를 복사하여 알맞은 창에 붙여넣어 주십시오. 첫 행은 열 머리글(Header)이 오도록 해야 자동 매핑됩니다.
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* File 1 */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-rose-500"></span>
                    1. WMS vs ERP 수량 비교 CSV
                  </span>
                  <textarea
                    placeholder="No,Plant,SLOC,MaterialType,Material,LOT_NO,WMS수량,ERP수량..."
                    value={qtyText}
                    onChange={(e) => setQtyText(e.target.value)}
                    rows={4}
                    className="w-full text-[9px] font-mono border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-slate-50/20"
                  />
                </div>

                {/* File 2 */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-amber-500"></span>
                    2. 상태별 재고 비교 CSV
                  </span>
                  <textarea
                    placeholder="No,Plant,SLOC,Material,LOT_NO,W_가용,W_보류,E_가용,E_보류..."
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    rows={4}
                    className="w-full text-[9px] font-mono border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-slate-50/20"
                  />
                </div>

                {/* File 3 */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-cyan-500"></span>
                    3. 창고/저장위치별 비교 CSV
                  </span>
                  <textarea
                    placeholder="No,Plant,Material,LOT_NO,WMS_창고,WMS수량,ERP_창고..."
                    value={slocText}
                    onChange={(e) => setSlocText(e.target.value)}
                    rows={4}
                    className="w-full text-[9px] font-mono border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-slate-50/20"
                  />
                </div>

                {/* File 4 */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-indigo-500"></span>
                    4. 이송중 재고 상세 CSV
                  </span>
                  <textarea
                    placeholder="Plant(송하),S. Loc.(송하),Plant(수하),S. Loc.(수하),자재코드,Lot No,박스일련번호..."
                    value={transitText}
                    onChange={(e) => setTransitText(e.target.value)}
                    rows={4}
                    className="w-full text-[9px] font-mono border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-slate-50/20"
                  />
                </div>
              </div>

              <button
                onClick={handleCustomCSVUpload}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                4개 데이터 파일 분석 및 연동하기
              </button>
            </div>
          )}

          {/* Messaging */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold flex items-start gap-1.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold">
          <span>* 업로드 완료 후, 대시보드에 즉시 연동 반영되며 이전의 기본 샘플은 소거됩니다.</span>
          <span>WMS-ERP Reconciler v1.3</span>
        </div>

      </div>
    </div>
  );
}
