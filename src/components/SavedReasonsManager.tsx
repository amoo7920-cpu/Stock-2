import { useState, useMemo, FormEvent } from 'react';
import { SavedReason } from '../types';
import { Search, Trash2, Edit3, HelpCircle, History, Info, CheckCircle2, Plus } from 'lucide-react';

interface SavedReasonsManagerProps {
  savedReasons: SavedReason[];
  onDeleteReason: (id: string) => void;
  onAddReason: (reason: Omit<SavedReason, 'id' | 'savedAt'>) => void;
}

export default function SavedReasonsManager({
  savedReasons,
  onDeleteReason,
  onAddReason
}: SavedReasonsManagerProps) {
  const [search, setSearch] = useState('');
  
  // Form to add manual reason template
  const [showAddForm, setShowAddForm] = useState(false);
  const [formPlant, setFormPlant] = useState('3000');
  const [formSloc, setFormSloc] = useState('2400');
  const [formMaterial, setFormMaterial] = useState('');
  const [formLot, setFormLot] = useState('');
  const [formStatus, setFormStatus] = useState<'PENDING' | 'INVESTIGATING' | 'RESOLVED'>('RESOLVED');
  const [formComment, setFormComment] = useState('');
  const [formAssignee, setFormAssignee] = useState('');

  const filteredReasons = useMemo(() => {
    return savedReasons.filter(
      (r) =>
        r.material.toLowerCase().includes(search.toLowerCase()) ||
        r.lotNo.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase()) ||
        (r.assignee && r.assignee.toLowerCase().includes(search.toLowerCase()))
    );
  }, [savedReasons, search]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formMaterial || !formLot || !formComment) return;

    onAddReason({
      plant: formPlant,
      sloc: formSloc,
      material: formMaterial.trim().toUpperCase(),
      lotNo: formLot.trim().toUpperCase(),
      status: formStatus,
      comment: formComment.trim(),
      assignee: formAssignee.trim() || '공통담당'
    });

    // Reset Form
    setFormMaterial('');
    setFormLot('');
    setFormComment('');
    setFormAssignee('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" id="saved-reasons-manager">
      {/* Intro instruction card */}
      <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <History className="w-4 h-4 text-slate-700" />
          과거 차이 규명 사유 영구 데이터베이스 (Reason Template Master)
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          대사 작업을 거쳐 한번 원인 규명한 품목(자재코드 + LOT 번호)의 사유와 조치상태는 여기에 저장됩니다. 
          새로운 일자의 대사 파일을 올릴 때 동일 품목이 있으면, **시스템이 자동으로 이 데이터베이스와 매핑**하여 사유를 추천해 주어 매번 원인을 추적하는 공수를 획기적으로 줄여줍니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form (Add/Update template) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">신규 사유 템플릿 등록</h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">수동 등록</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold">대상 공장</label>
                <input
                  type="text"
                  value={formPlant}
                  onChange={(e) => setFormPlant(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">저장위치 (SLOC)</label>
                <input
                  type="text"
                  value={formSloc}
                  onChange={(e) => setFormSloc(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">자재코드 (Material Code)</label>
              <input
                type="text"
                placeholder="예: BN740-G1"
                value={formMaterial}
                onChange={(e) => setFormMaterial(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">LOT 번호 (Lot No.)</label>
              <input
                type="text"
                placeholder="예: D26I0508"
                value={formLot}
                onChange={(e) => setFormLot(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold">지정 조치 상태</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                >
                  <option value="PENDING">대기중</option>
                  <option value="INVESTIGATING">추적중</option>
                  <option value="RESOLVED">조치완료</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold">기본 담당자</label>
                <input
                  type="text"
                  placeholder="예: 김물류 대리"
                  value={formAssignee}
                  onChange={(e) => setFormAssignee(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">상세 사유 및 조치 메모</label>
              <textarea
                placeholder="동일 차이 발생 시 자동 기재될 해설 내용"
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={3}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 leading-normal bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!formMaterial || !formLot || !formComment}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              사유 템플릿 보관하기
            </button>
          </form>
        </div>

        {/* Right Table (Reason Templates database list) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-150 shadow-xs space-y-4 flex flex-col h-[520px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">보관 중인 차이 사유 템플릿 ({filteredReasons.length}개)</h4>
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="자재코드, LOT, 사유 키워드 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">대상 품목/LOT</th>
                  <th className="p-3">위치</th>
                  <th className="p-3">매핑 사유 내용</th>
                  <th className="p-3">상태/담당</th>
                  <th className="p-3 text-center w-12">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReasons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <p className="font-bold">등록된 사유 매핑 템플릿이 없습니다.</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">상세창이나 좌측 등록 폼을 통해 사유를 누적해보세요.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReasons.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/40 text-xs">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 font-mono">{r.material}</div>
                        <div className="text-[10px] text-slate-500 font-mono">LOT: {r.lotNo}</div>
                      </td>
                      <td className="p-3 text-[11px] text-slate-600">
                        {r.plant}-{r.sloc}
                      </td>
                      <td className="p-3 max-w-[200px]">
                        <p className="text-slate-700 font-medium leading-relaxed truncate" title={r.comment}>
                          {r.comment}
                        </p>
                      </td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          r.status === 'RESOLVED' ? 'bg-emerald-50 border border-emerald-150 text-emerald-700' : 'bg-amber-50 border border-amber-150 text-amber-700'
                        }`}>
                          {r.status === 'RESOLVED' ? '조치완료' : '추적중'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.assignee}</div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onDeleteReason(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="템플릿 제거"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
  );
}
