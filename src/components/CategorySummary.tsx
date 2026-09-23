import React from 'react';
import { ExpenseRecord, MainCategory } from '../types';
import { CATEGORIES_CONFIG } from '../data/categories';
import {
  Utensils,
  Car,
  Bike,
  Shirt,
  ShoppingBag,
  Globe,
  BookOpen,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface CategorySummaryProps {
  records: ExpenseRecord[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategorySummary: React.FC<CategorySummaryProps> = ({
  records,
  selectedCategory,
  onSelectCategory,
}) => {
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'Bike':
        return <Bike className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Globe':
        return <Globe className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const categories: MainCategory[] = ['伙食', '交通工具', '服飾', '日用品', '網購', '書籍'];

  return (
    <div id="category-summary-panel" className="bg-white border-b border-emerald-900/10 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-semibold text-stone-600 tracking-wider">
            EXCEL 統計分析卡・依類別彙總 (點擊可快速篩選)
          </span>
        </div>
        <div className="text-xs text-stone-500 font-mono">
          總筆數：<span className="font-semibold text-stone-800">{records.length}</span> 筆 | 總支出：
          <span className="font-bold text-emerald-700 text-sm ml-1">
            NT$ {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {categories.map((cat) => {
          const config = CATEGORIES_CONFIG[cat];
          const catRecords = records.filter((r) => r.category === cat);
          const catTotal = catRecords.reduce((sum, r) => sum + r.amount, 0);
          const percentage = totalAmount > 0 ? Math.round((catTotal / totalAmount) * 100) : 0;
          const isSelected = selectedCategory === cat;

          // Subcategory breakdown
          const subCounts: Record<string, number> = {};
          catRecords.forEach((r) => {
            if (r.subcategory) {
              subCounts[r.subcategory] = (subCounts[r.subcategory] || 0) + r.amount;
            }
          });

          return (
            <button
              key={cat}
              id={`filter-btn-${cat}`}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'ALL' : cat)}
              className={`text-left p-2.5 rounded-lg border transition-all relative ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`p-1 rounded-md ${config.bgColor} ${config.color}`}>
                    {getCategoryIcon(config.iconName)}
                  </span>
                  <span className="text-xs font-bold text-stone-800">{cat}</span>
                </div>
                <span className="text-[10px] font-mono text-stone-400 font-medium">
                  {percentage}%
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-stone-900 font-mono">
                  ${catTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-500">{catRecords.length} 筆</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-stone-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Subcategories preview */}
              {config.subcategories.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {config.subcategories.slice(0, 3).map((sub) => (
                    <span
                      key={sub}
                      className={`text-[9px] px-1 py-0.2 rounded border ${
                        subCounts[sub]
                          ? 'bg-white font-medium text-emerald-800 border-emerald-200'
                          : 'bg-transparent text-stone-400 border-dashed border-stone-200'
                      }`}
                    >
                      {sub}
                      {subCounts[sub] ? ` $${subCounts[sub]}` : ''}
                    </span>
                  ))}
                  {config.subcategories.length > 3 && (
                    <span className="text-[9px] text-stone-400 self-center">
                      +{config.subcategories.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
