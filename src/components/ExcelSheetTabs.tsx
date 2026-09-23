import React from 'react';
import { TableViewMode } from '../types';
import { Plus, Check, FileSpreadsheet } from 'lucide-react';

interface ExcelSheetTabsProps {
  viewMode: TableViewMode;
  onViewModeChange: (mode: TableViewMode) => void;
  selectedCategory: string;
  onClearCategoryFilter: () => void;
  recordCount: number;
  totalSum: number;
}

export const ExcelSheetTabs: React.FC<ExcelSheetTabsProps> = ({
  viewMode,
  onViewModeChange,
  selectedCategory,
  onClearCategoryFilter,
  recordCount,
  totalSum,
}) => {
  const average = recordCount > 0 ? Math.round(totalSum / recordCount) : 0;

  return (
    <div
      id="excel-sheet-footer"
      className="bg-stone-200 border-t border-stone-300 px-3 py-1 flex flex-wrap items-center justify-between text-xs select-none"
    >
      {/* Excel Sheet Tabs */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onViewModeChange('standard')}
          className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-all flex items-center gap-1.5 ${
            viewMode === 'standard'
              ? 'bg-white text-[#107c41] border-stone-300 shadow-2xs'
              : 'bg-stone-200/80 text-stone-600 hover:bg-stone-100 border-transparent'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
          <span>工作表 1・標準收支明細</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('matrix')}
          className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x transition-all flex items-center gap-1.5 ${
            viewMode === 'matrix'
              ? 'bg-white text-[#107c41] border-stone-300 shadow-2xs'
              : 'bg-stone-200/80 text-stone-600 hover:bg-stone-100 border-transparent'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
          <span>工作表 2・專屬分類分欄表</span>
        </button>

        {selectedCategory !== 'ALL' && (
          <div className="ml-2 flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] border border-amber-300">
            <span>篩選中：{selectedCategory}</span>
            <button
              type="button"
              onClick={onClearCategoryFilter}
              className="hover:text-amber-700 font-bold ml-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Excel Status Bar (Right side: Count, Average, Sum) */}
      <div className="flex items-center gap-3 font-mono text-[11px] text-stone-600">
        <div className="flex items-center gap-1">
          <span className="text-stone-400">狀態：</span>
          <span className="text-emerald-700 font-medium">就緒 (Ready)</span>
        </div>
        <div className="h-3 w-px bg-stone-300" />
        <div>
          筆數：<span className="font-bold text-stone-800">{recordCount}</span>
        </div>
        <div>
          平均值：<span className="font-bold text-stone-800">${average.toLocaleString()}</span>
        </div>
        <div>
          加總 (SUM)：
          <span className="font-bold text-emerald-800">${totalSum.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
