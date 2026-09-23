import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  List,
  BarChart3,
  Check,
  User,
  KeyRound,
  Users,
  Lock,
} from 'lucide-react';
import { TableViewMode, PersonnelId, ALL_PERSONNEL } from '../types';

interface ExcelHeaderProps {
  viewMode: TableViewMode;
  onViewModeChange: (mode: TableViewMode) => void;
  showSummary: boolean;
  onToggleSummary: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onOpenAddModal: () => void;
  onOpenScanner: () => void;
  onResetData: () => void;
  recordCount: number;
  currentUser: PersonnelId | null;
  onOpenLoginModal: () => void;
  filterPersonnel: string;
  onFilterPersonnelChange: (personnel: string) => void;
}

export const ExcelHeader: React.FC<ExcelHeaderProps> = ({
  viewMode,
  onViewModeChange,
  showSummary,
  onToggleSummary,
  onExportExcel,
  onExportCSV,
  onOpenAddModal,
  onOpenScanner,
  onResetData,
  recordCount,
  currentUser,
  onOpenLoginModal,
  filterPersonnel,
  onFilterPersonnelChange,
}) => {
  return (
    <header id="excel-app-header" className="bg-[#107c41] text-white select-none">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-1.5 rounded flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide">個人記帳管理表單.xlsx</h1>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded font-mono">
                已自動存檔
              </span>
            </div>
            <p className="text-[11px] text-emerald-200">
              支援伙食、交通工具、服飾、日用品、網購、書籍專屬分類・AI 發票智慧辨識
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {/* User Account Button */}
          <button
            id="user-profile-header-btn"
            type="button"
            onClick={onOpenLoginModal}
            className={`flex items-center gap-1.5 font-medium px-2.5 py-1.5 rounded-lg text-xs shadow-xs transition-all active:scale-95 cursor-pointer ${
              currentUser
                ? 'bg-emerald-900/90 hover:bg-emerald-950 border border-emerald-500/80 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-stone-900 border border-amber-300 font-bold ring-2 ring-amber-300/50'
            }`}
            title={currentUser ? '點擊切換人員或修改設定密碼' : '尚未登入，點擊登入 1-9 號人員以登記發票'}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentUser ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-900 text-amber-300'
              }`}
            >
              {currentUser ? currentUser.replace('號人員', '') : <Lock className="w-3 h-3" />}
            </div>
            <span className="font-bold">
              {currentUser ? currentUser : '未登入 (點此登入)'}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                currentUser ? 'bg-emerald-700/80 text-emerald-200' : 'bg-amber-500 text-stone-900 font-bold'
              }`}
            >
              {currentUser ? '切換/密碼' : '1-9號'}
            </span>
          </button>

          <button
            id="open-scanner-header-btn"
            type="button"
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-all active:scale-95"
            title={!currentUser ? '需要先登入人員帳號才能登記發票' : '上傳或拍照辨識發票收據'}
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-900 fill-amber-500" />
            <span>上傳 / 辨識發票</span>
            {!currentUser && (
              <span className="flex items-center gap-0.5 bg-stone-900/80 text-amber-200 text-[9px] px-1.5 py-0.5 rounded font-medium">
                <Lock className="w-2.5 h-2.5 text-amber-300" /> 需登入
              </span>
            )}
          </button>

          <button
            id="quick-add-header-btn"
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-white text-[#107c41] hover:bg-emerald-50 font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-all active:scale-95"
            title={!currentUser ? '需要先登入人員帳號才能新增記帳' : '快速手動新增一筆消費'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增記帳</span>
            {!currentUser && (
              <span className="flex items-center gap-0.5 bg-stone-100 text-stone-700 border border-stone-300 text-[9px] px-1.5 py-0.5 rounded font-medium">
                <Lock className="w-2.5 h-2.5 text-stone-600" /> 需登入
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ribbon Toolbar Bar */}
      <div className="bg-[#185c37] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left Side: View Toggles & Analytics */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-emerald-300 mr-1 font-medium hidden md:inline">
            表格版型：
          </span>
          <div className="bg-emerald-900/60 p-0.5 rounded flex items-center border border-emerald-700/50">
            <button
              id="view-standard-btn"
              type="button"
              onClick={() => onViewModeChange('standard')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                viewMode === 'standard'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>標準試算表清單</span>
            </button>
            <button
              id="view-matrix-btn"
              type="button"
              onClick={() => onViewModeChange('matrix')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>專屬分欄矩陣表</span>
            </button>
          </div>

          <div className="h-4 w-px bg-emerald-700 mx-1.5" />

          <button
            id="toggle-summary-btn"
            type="button"
            onClick={onToggleSummary}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all ${
              showSummary
                ? 'bg-emerald-700 text-white border-emerald-600'
                : 'bg-transparent text-emerald-200 hover:text-white border-emerald-700/60 hover:bg-emerald-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>統計彙總卡</span>
          </button>

          <div className="h-4 w-px bg-emerald-700 mx-1.5 hidden sm:block" />

          {/* Personnel Filter */}
          <div className="hidden sm:flex items-center gap-1 bg-emerald-900/70 px-2 py-0.5 rounded border border-emerald-700/60 text-[11px]">
            <Users className="w-3 h-3 text-emerald-300" />
            <span className="text-emerald-200">人員檢視:</span>
            <select
              value={filterPersonnel}
              onChange={(e) => onFilterPersonnelChange(e.target.value)}
              className="bg-emerald-800 text-white font-medium rounded px-1.5 py-0.5 text-[11px] border border-emerald-600 focus:outline-hidden"
            >
              <option value="ALL">全部人員 (1-9號)</option>
              {ALL_PERSONNEL.map((p) => (
                <option key={p} value={p}>
                  {p} {currentUser === p ? '(目前)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Excel Export & Reset */}
        <div className="flex items-center gap-1.5">
          <button
            id="export-excel-btn"
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded border border-emerald-500 font-medium transition-all shadow-2xs"
            title="下載真實 .xlsx Excel 試算表檔案"
          >
            <Download className="w-3.5 h-3.5" />
            <span>匯出 Excel (.xlsx)</span>
          </button>

          <button
            id="export-csv-btn"
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white px-2 py-1 rounded border border-emerald-700 font-medium transition-all"
            title="下載 CSV 格式"
          >
            <span>匯出 CSV</span>
          </button>

          <button
            id="reset-data-btn"
            type="button"
            onClick={onResetData}
            className="flex items-center gap-1 text-emerald-200 hover:text-white hover:bg-emerald-800/60 px-2 py-1 rounded transition-all ml-1"
            title="重設為系統預設範例資料"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">重設資料</span>
          </button>
        </div>
      </div>
    </header>
  );
};
