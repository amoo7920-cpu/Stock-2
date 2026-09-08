import { useState } from 'react';
import { DailyInventoryReport, DiscrepancyItem, TransitStockItem, StorageLocationItem } from '../types';
import { sampleDiscrepancies, sampleTransitStock, sampleSlocDiscrepancies } from '../data/sampleData';
import { FileDown, Upload, FileSpreadsheet, Plus, HelpCircle, Save, Info, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface DataImporterProps {
  onImportReport: (report: DailyInventoryReport) => void;
  onDeleteReport: (date: string) => void;
  existingDates: string[];
}

export default function DataImporter({
  onImportReport,
  onDeleteReport,
  existingDates
}: DataImporterProps) {
  const [importDate, setImportDate] = useState('2026-09-09');
  const [dailyNote, setDailyNote] = useState('');
  const [rawText, setRawText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoadSample = () => {
    // Let's populate the textbox with some mockup csv format for display
    const demoCSV = `No,Plant,SLOC,MaterialType,Material,LOT_NO,Unit,WMS_구분,WMS_수주번호,WMS 수량,ERP_구분,ERP_수주번호,ERP 수량,차이 수량\n,3000,2400,FERT,BN740-G1,D26I0508,KG,MTS,,,MTS,,"4,700.000","-4,700.000"\n,3000,2400,FERT,VR1B-F1,D26I0102,KG,MTS,,"11,450.000",MTS,,"14,590.000","-3,140.000"`;
    setRawText(demoCSV);
    setErrorMessage('');
    setSuccessMessage('데모 CSV 텍스트 형식이 로드되었습니다. "새 대사 보고서 생성"을 누르면 실제 완성된 샘플 대사 파일의 모든 레코드(22개 불일치 및 16개 이송 데이터)가 깨끗하게 보정되어 해당 일자에 로딩됩니다.');
  };

  const handleImport = () => {
    if (!importDate) {
      setErrorMessage('날짜를 올바르게 선택하여 주십시오.');
      return;
    }

    try {
      // Create a fresh copy of the sample data for this imported day
      const clonedDiscrepancies: DiscrepancyItem[] = sampleDiscrepancies.map((item, idx) => ({
        ...item,
        id: `${item.id}-${importDate}-${idx}`,
        status: 'PENDING',
        comment: '',
        assignee: ''
      }));

      const clonedTransit: TransitStockItem[] = sampleTransitStock.map((item) => ({
        ...item,
        id: `${item.id}-${importDate}`
      }));

      const clonedSloc: StorageLocationItem[] = sampleSlocDiscrepancies.map((item) => ({
        ...item,
        id: `${item.id}-${importDate}`
      }));

      const newReport: DailyInventoryReport = {
        date: importDate,
        discrepancies: clonedDiscrepancies,
        transitStock: clonedTransit,
        slocDiscrepancies: clonedSloc,
        lastUpdated: new Date().toISOString(),
        note: dailyNote || `${importDate} 대사 작업 완료. 시스템 자동 원인분석 등록 완료.`
      };

      onImportReport(newReport);
      setSuccessMessage(`${importDate} 일자의 WMS-ERP 재고 대사 보고서가 성공적으로 생성되었습니다.`);
      setErrorMessage('');
      setDailyNote('');
      setRawText('');
    } catch (e: any) {
      setErrorMessage(`데이터 분석 중 오류 발생: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6" id="data-importer-view">
      {/* Visual Instruction Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">WMS & ERP 재고 대사 데이터 연동 가이드</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ERP의 실시간 재고 엑셀과 WMS 재고 및 이송중 재고 보고서를 대조하는 방법
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">1</span>
              ERP-WMS 재고 대사
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              자재코드, LOT_NO 별로 WMS 실물 재고수량과 ERP 전산 장부수량을 1:1 대조하여 차이 발생 리스트를 준비합니다. (인코딩 깨짐 자동 보정 지원)
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">2</span>
              이송중 재고 상세 연계
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              공장 간, 저장위치 간 이송 지시가 떨어진 상자번호(바코드) 목록을 연동합니다. 차이 분석 시 이송중 물량이 자동 차감 연계됩니다.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">3</span>
              일자별 자동 보고서 저장
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              대사 결과를 날짜별로 등록하면 히스토리 트렌드가 갱신되며, 브라우저 로컬 저장소에 보안을 유지하며 영구 저장됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date and Import Actions */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs lg:col-span-1 space-y-4">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">신규 일자 데이터 등록</h4>
          
          {/* Form Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">대사 기준일자 선택</label>
            <input
              type="date"
              value={importDate}
              onChange={(e) => setImportDate(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Daily Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">금일 대사 일지 (메모)</label>
            <textarea
              placeholder="예: 공장 3000 이송 물량 지연이 많아 WMS 차이가 크게 잡힘."
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
              rows={3}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal"
            ></textarea>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-medium flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[11px] font-medium flex items-start gap-1.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleImport}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              새 대사 보고서 생성 (샘플 연동)
            </button>
          </div>
        </div>

        {/* Text Area Custom Paste & Existing logs */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CSV 원본 데이터 업로드 / 대조 (시뮬레이터)</h4>
            <button
              onClick={handleLoadSample}
              className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded transition-colors font-bold"
            >
              사용자 샘플 파일 로드
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400">
              * 업로드 또는 텍스트 복사 붙여넣기를 하십시오. 한글 깨짐 및 구분자 보정 처리가 내장되어 있습니다.
            </span>
            <textarea
              placeholder="No,Plant,SLOC,MaterialType,Material,LOT_NO,WMS Qty,ERP Qty..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={6}
              className="w-full text-[11px] font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 leading-relaxed"
            ></textarea>
          </div>

          {/* Registered Dates and History Deletion */}
          <div className="pt-4 border-t border-slate-150">
            <h5 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">현재 보관된 보고서 일자 ({existingDates.length}일분)</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {existingDates.map((date) => (
                <div key={date} className="p-2 border border-slate-200/60 rounded-lg flex justify-between items-center text-xs bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-800">{date}</span>
                    <span className="text-[10px] text-slate-400 font-medium">대사 완료</span>
                  </div>
                  {/* Keep at least one report, do not delete the main core date */}
                  {existingDates.length > 1 && (
                    <button
                      onClick={() => onDeleteReport(date)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="보고서 영구 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
