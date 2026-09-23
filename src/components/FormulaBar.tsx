import React from 'react';
import { FunctionSquare, Search, Sparkles } from 'lucide-react';

interface FormulaBarProps {
  selectedCell: string;
  formulaValue: string;
  totalSum: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenScanner: () => void;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  selectedCell,
  formulaValue,
  totalSum,
  totalCount,
  searchQuery,
  onSearchChange,
  onOpenScanner,
}) => {
  return (
    <div
      id="excel-formula-bar"
      className="bg-stone-50 border-b border-stone-200 px-3 py-1.5 flex flex-wrap items-center gap-2 text-xs"
    >
      {/* Name Box (e.g., E14 or SUM) */}
      <div className="flex items-center">
        <div className="w-18 h-7 bg-white border border-stone-300 rounded px-2 flex items-center justify-center font-mono font-bold text-stone-700 shadow-2xs">
          {selectedCell || 'A1'}
        </div>
      </div>

      <div className="h-4 w-px bg-stone-300 mx-0.5 hidden sm:block" />

      {/* fx icon */}
      <div className="flex items-center text-stone-500 gap-1 select-none">
        <span className="italic font-serif font-bold text-stone-600 px-1 text-sm leading-none">
          fx
        </span>
      </div>

      {/* Formula Input / Display */}
      <div className="flex-1 min-w-[200px] h-7 bg-white border border-stone-300 rounded px-2.5 flex items-center font-mono text-stone-800 text-xs shadow-2xs">
        <span className="text-emerald-700 font-semibold mr-1.5 select-none">
          =SUM(金額) :
        </span>
        <span className="font-semibold truncate">
          {formulaValue || `NT$ ${totalSum.toLocaleString()} (${totalCount} 筆交易)`}
        </span>
      </div>

      {/* Search Filter */}
      <div className="relative flex items-center w-48 sm:w-56">
        <Search className="w-3.5 h-3.5 absolute left-2 text-stone-400 pointer-events-none" />
        <input
          id="search-filter-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜尋明細、發票、商家..."
          className="w-full h-7 pl-7 pr-2.5 bg-white border border-stone-300 rounded text-xs focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 text-stone-400 hover:text-stone-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* AI Scanner Shortcut Button */}
      <button
        id="formula-bar-ai-btn"
        type="button"
        onClick={onOpenScanner}
        className="h-7 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded flex items-center gap-1.5 shadow-xs transition-all active:scale-98"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>辨識發票</span>
      </button>
    </div>
  );
};
