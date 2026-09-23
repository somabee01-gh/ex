import React from 'react';
import { ExpenseRecord, MainCategory } from '../types';
import { CATEGORIES_CONFIG } from '../data/categories';
import { Plus, Trash2, Tag, Utensils, Bike, Shirt, ShoppingBag, Globe, BookOpen } from 'lucide-react';

interface MultiColumnMatrixTableProps {
  records: ExpenseRecord[];
  onUpdateRecord: (id: string, updates: Partial<ExpenseRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onAddRowWithCategory: (category: MainCategory) => void;
  selectedCell: string;
  onSelectCell: (cell: string, value: string) => void;
}

export const MultiColumnMatrixTable: React.FC<MultiColumnMatrixTableProps> = ({
  records,
  onUpdateRecord,
  onDeleteRecord,
  onAddRowWithCategory,
  selectedCell,
  onSelectCell,
}) => {
  // Sort by date descending
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getSubcategoryBadge = (record: ExpenseRecord) => {
    if (!record.subcategory) return null;
    return (
      <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-200 mr-1">
        {record.subcategory}
      </span>
    );
  };

  // Category column definitions matching user request
  const categoryColumns: {
    category: MainCategory;
    title: string;
    subOptions: string[];
    bgHeader: string;
    width: string;
  }[] = [
    {
      category: '伙食',
      title: '伙食 (早餐/午餐/晚餐/飲料/點心)',
      subOptions: CATEGORIES_CONFIG['伙食'].subcategories,
      bgHeader: 'bg-amber-50 text-amber-900',
      width: 'w-52',
    },
    {
      category: '交通工具',
      title: '交通工具 (加油/保養/停車費)',
      subOptions: CATEGORIES_CONFIG['交通工具'].subcategories,
      bgHeader: 'bg-sky-50 text-sky-900',
      width: 'w-48',
    },
    {
      category: '服飾',
      title: '服飾',
      subOptions: [],
      bgHeader: 'bg-violet-50 text-violet-900',
      width: 'w-36',
    },
    {
      category: '日用品',
      title: '日用品',
      subOptions: [],
      bgHeader: 'bg-emerald-50 text-emerald-900',
      width: 'w-36',
    },
    {
      category: '網購',
      title: '網購 (蝦皮/淘寶/MOMO)',
      subOptions: CATEGORIES_CONFIG['網購'].subcategories,
      bgHeader: 'bg-orange-50 text-orange-900',
      width: 'w-48',
    },
    {
      category: '書籍',
      title: '書籍 (數學/物理/化學/通識/加工)',
      subOptions: CATEGORIES_CONFIG['書籍'].subcategories,
      bgHeader: 'bg-indigo-50 text-indigo-900',
      width: 'w-52',
    },
  ];

  // Column totals
  const categoryTotals = categoryColumns.reduce((acc, col) => {
    acc[col.category] = records
      .filter((r) => r.category === col.category)
      .reduce((sum, r) => sum + r.amount, 0);
    return acc;
  }, {} as Record<MainCategory, number>);

  const grandTotal = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div id="excel-matrix-container" className="flex-1 overflow-auto bg-white select-text">
      <div className="bg-emerald-800 text-emerald-50 px-3 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">專屬分類分欄記帳模式 (Excel Matrix View)</span>
          <span className="text-[11px] text-emerald-200">
            — 每一大類別具備專屬欄位與下拉選單
          </span>
        </div>
        <span className="font-mono text-xs">
          總計支出: <strong className="text-white">${grandTotal.toLocaleString()}</strong>
        </span>
      </div>

      <table className="w-full border-collapse text-xs font-sans">
        {/* Header Row */}
        <thead className="sticky top-0 z-10 bg-stone-100 shadow-2xs">
          <tr className="border-b border-stone-300 text-stone-500 font-mono text-[11px]">
            <th className="w-10 py-1 px-2 border-r border-stone-300 text-center font-normal bg-stone-200/80">
              #
            </th>
            <th className="w-28 py-1 px-2 border-r border-stone-300 text-center font-medium">A</th>
            <th className="w-52 py-1 px-2 border-r border-stone-300 text-center font-medium">B</th>
            {categoryColumns.map((col, idx) => (
              <th
                key={col.category}
                className={`${col.width} py-1 px-2 border-r border-stone-300 text-center font-medium`}
              >
                {String.fromCharCode(67 + idx)}
              </th>
            ))}
            <th className="w-24 py-1 px-2 border-r border-stone-300 text-center font-medium">I</th>
            <th className="w-12 py-1 px-2 text-center font-normal">操作</th>
          </tr>

          {/* Descriptive header */}
          <tr className="border-b-2 border-emerald-700 bg-stone-100 text-stone-800 text-[11px] font-semibold">
            <th className="py-2 px-2 border-r border-stone-300 text-center bg-stone-200/60 font-mono">
              列
            </th>
            <th className="py-2 px-2 border-r border-stone-300 text-left">日期 (Date)</th>
            <th className="py-2 px-2 border-r border-stone-300 text-left">明細摘要 / 備註</th>
            {categoryColumns.map((col) => (
              <th
                key={col.category}
                className={`${col.width} py-2 px-2 border-r border-stone-300 text-left ${col.bgHeader}`}
              >
                <div className="flex flex-col">
                  <span>{col.title}</span>
                  {col.subOptions.length > 0 && (
                    <span className="text-[10px] font-normal opacity-80 truncate">
                      可選：{col.subOptions.join('、')}
                    </span>
                  )}
                </div>
              </th>
            ))}
            <th className="py-2 px-2 border-r border-stone-300 text-right bg-emerald-50 text-emerald-900 font-bold">
              小計 (NT$)
            </th>
            <th className="py-2 px-2 text-center text-stone-600">管理</th>
          </tr>
        </thead>

        {/* Rows */}
        <tbody>
          {sortedRecords.map((record, index) => {
            const rowIndex = index + 2;

            return (
              <tr
                key={record.id}
                className="border-b border-stone-200 hover:bg-emerald-50/20 group transition-colors"
              >
                {/* Row Index */}
                <td className="py-1 px-2 border-r border-stone-300 text-center font-mono text-stone-500 bg-stone-100/70 select-none text-[11px]">
                  {rowIndex}
                </td>

                {/* Date */}
                <td
                  onClick={() => onSelectCell(`A${rowIndex}`, record.date)}
                  className={`border-r border-stone-200 p-0 ${
                    selectedCell === `A${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                  }`}
                >
                  <input
                    type="date"
                    value={record.date}
                    onChange={(e) => onUpdateRecord(record.id, { date: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs bg-transparent border-0 font-mono focus:outline-hidden focus:bg-white"
                  />
                </td>

                {/* Description & Merchant */}
                <td
                  onClick={() => onSelectCell(`B${rowIndex}`, record.description)}
                  className={`border-r border-stone-200 p-1 ${
                    selectedCell === `B${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <input
                      type="text"
                      value={record.description}
                      onChange={(e) =>
                        onUpdateRecord(record.id, { description: e.target.value })
                      }
                      className="w-full px-1 py-0.5 text-xs font-medium text-stone-900 bg-transparent border-0 focus:outline-hidden focus:bg-white"
                      placeholder="消費摘要說明..."
                    />
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 px-1 flex-wrap">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded font-semibold text-[10px]">
                        {record.personnel || '1號人員'}
                      </span>
                      {record.merchant && <span>{record.merchant}</span>}
                      {record.invoiceNumber && (
                        <span className="font-mono text-stone-500">[{record.invoiceNumber}]</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category Columns */}
                {categoryColumns.map((col, idx) => {
                  const isMatch = record.category === col.category;
                  const cellCoord = `${String.fromCharCode(67 + idx)}${rowIndex}`;

                  return (
                    <td
                      key={col.category}
                      onClick={() =>
                        onSelectCell(
                          cellCoord,
                          isMatch ? `${record.subcategory} $${record.amount}` : ''
                        )
                      }
                      className={`border-r border-stone-200 p-1.5 align-middle ${
                        selectedCell === cellCoord ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                      } ${isMatch ? 'bg-emerald-50/30' : ''}`}
                    >
                      {isMatch ? (
                        <div className="flex items-center justify-between gap-1 bg-white border border-emerald-300 rounded px-1.5 py-1 shadow-2xs">
                          {col.subOptions.length > 0 ? (
                            <select
                              value={record.subcategory || col.subOptions[0]}
                              onChange={(e) =>
                                onUpdateRecord(record.id, { subcategory: e.target.value })
                              }
                              className="text-[11px] font-semibold text-emerald-800 bg-transparent border-0 focus:outline-hidden cursor-pointer"
                            >
                              {col.subOptions.map((sub) => (
                                <option key={sub} value={sub}>
                                  {sub}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[10px] text-stone-500 font-medium">
                              {col.category}
                            </span>
                          )}

                          <div className="flex items-center">
                            <span className="text-stone-400 text-[10px] mr-0.5">$</span>
                            <input
                              type="number"
                              min="0"
                              value={record.amount}
                              onChange={(e) =>
                                onUpdateRecord(record.id, {
                                  amount: Math.max(0, parseInt(e.target.value, 10) || 0),
                                })
                              }
                              className="w-16 text-right text-xs font-bold font-mono text-stone-900 bg-transparent border-0 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            // Change this record's category to this column!
                            const defSub = col.subOptions[0] || '';
                            onUpdateRecord(record.id, {
                              category: col.category,
                              subcategory: defSub,
                            });
                          }}
                          className="w-full text-center text-stone-300 hover:text-emerald-700 hover:bg-emerald-50/60 rounded py-1 transition-colors text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                        >
                          <Plus className="w-3 h-3 mr-0.5" />
                          <span>移入此格</span>
                        </button>
                      )}
                    </td>
                  );
                })}

                {/* Subtotal */}
                <td className="py-1 px-2 border-r border-stone-200 text-right font-mono font-bold text-stone-900 bg-stone-50/50">
                  ${record.amount.toLocaleString()}
                </td>

                {/* Delete */}
                <td className="py-1 px-2 text-center">
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(record.id)}
                    className="text-stone-300 hover:text-rose-600 p-1 rounded transition-colors"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Matrix Total Row */}
        <tfoot className="sticky bottom-0 z-10 bg-stone-100 border-t-2 border-emerald-700 shadow-xs font-semibold text-stone-900 text-xs">
          <tr>
            <td className="py-2 px-2 border-r border-stone-300 text-center font-mono text-stone-500 bg-stone-200/70 text-[11px]">
              ∑
            </td>
            <td colSpan={2} className="py-2 px-3 border-r border-stone-300 text-right font-mono">
              各欄位分類合計支出 (NT$)：
            </td>
            {categoryColumns.map((col) => (
              <td
                key={col.category}
                className="py-2 px-2 border-r border-stone-300 text-right font-mono font-bold text-stone-800 bg-emerald-50/40"
              >
                ${(categoryTotals[col.category] || 0).toLocaleString()}
              </td>
            ))}
            <td className="py-2 px-2 border-r border-stone-300 text-right font-mono text-emerald-800 font-bold text-sm bg-emerald-100/70">
              ${grandTotal.toLocaleString()}
            </td>
            <td className="py-2 px-2 text-center text-[10px] text-stone-400">總計</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
