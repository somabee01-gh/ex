import React, { useState } from 'react';
import { ExpenseRecord, MainCategory, ALL_PERSONNEL, PersonnelId } from '../types';
import { CATEGORIES_CONFIG, MAIN_CATEGORIES } from '../data/categories';
import {
  Trash2,
  Plus,
  ArrowUpDown,
  FileText,
  Tag,
  Calendar,
  DollarSign,
  Store,
  User,
} from 'lucide-react';

interface ExpenseTableProps {
  records: ExpenseRecord[];
  onUpdateRecord: (id: string, updates: Partial<ExpenseRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onAddRow: () => void;
  selectedCell: string;
  onSelectCell: (cell: string, value: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  records,
  onUpdateRecord,
  onDeleteRecord,
  onAddRow,
  selectedCell,
  onSelectCell,
}) => {
  const [sortField, setSortField] = useState<keyof ExpenseRecord>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: keyof ExpenseRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    let valA = a[sortField] ?? '';
    let valB = b[sortField] ?? '';

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalSum = records.reduce((acc, r) => acc + r.amount, 0);

  // Column letters for Excel appearance
  const columns = [
    { col: 'A', name: '日期 (Date)', field: 'date', width: 'w-32' },
    { col: 'B', name: '主類別 (Category)', field: 'category', width: 'w-32' },
    { col: 'C', name: '子項目 (Subcategory)', field: 'subcategory', width: 'w-36' },
    { col: 'D', name: '項目明細 (Description)', field: 'description', width: 'w-64' },
    { col: 'E', name: '金額 (NT$)', field: 'amount', width: 'w-28' },
    { col: 'F', name: '記帳人員 (User)', field: 'personnel', width: 'w-32' },
    { col: 'G', name: '商家 / 平台 (Merchant)', field: 'merchant', width: 'w-44' },
    { col: 'H', name: '發票號碼 (Invoice No.)', field: 'invoiceNumber', width: 'w-36' },
    { col: 'I', name: '備註 (Notes)', field: 'notes', width: 'w-48' },
  ];

  return (
    <div id="excel-table-container" className="flex-1 overflow-auto bg-white select-text">
      <table className="w-full border-collapse text-xs font-sans">
        {/* Excel Column Headers */}
        <thead className="sticky top-0 z-10 bg-stone-100 shadow-2xs">
          {/* Top Letter Row: A, B, C, D... */}
          <tr className="border-b border-stone-300 text-stone-500 font-mono text-[11px] bg-stone-100">
            <th className="w-12 py-1 px-2 border-r border-stone-300 text-center font-normal bg-stone-200/80">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col.col}
                className={`${col.width} py-1 px-2 border-r border-stone-300 text-center font-medium bg-stone-100/90`}
              >
                {col.col}
              </th>
            ))}
            <th className="w-16 py-1 px-2 text-center font-normal bg-stone-100">操作</th>
          </tr>

          {/* Descriptive Column Header Row */}
          <tr className="border-b-2 border-emerald-700 bg-emerald-50/70 text-stone-800 text-[11px] font-semibold">
            <th className="py-2 px-2 border-r border-stone-300 text-center bg-stone-200/60 font-mono">
              列
            </th>
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => handleSort(col.field as keyof ExpenseRecord)}
                className={`${col.width} py-2 px-2 border-r border-stone-300 text-left cursor-pointer hover:bg-emerald-100/70 transition-colors select-none`}
              >
                <div className="flex items-center justify-between">
                  <span>{col.name}</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400 opacity-60 hover:opacity-100" />
                </div>
              </th>
            ))}
            <th className="py-2 px-2 text-center text-stone-600">管理</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {sortedRecords.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className="text-center py-16 text-stone-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-medium text-stone-600">目前尚無符合的記帳資料</p>
                <p className="text-xs text-stone-400 mt-1">
                  點擊上方「新增記帳」或「上傳/辨識發票」快速建立收支紀錄
                </p>
              </td>
            </tr>
          ) : (
            sortedRecords.map((record, index) => {
              const rowIndex = index + 2; // Excel row numbering starts from 2 (after header)
              const catConfig = CATEGORIES_CONFIG[record.category] || CATEGORIES_CONFIG['其他'];
              const subcategories = catConfig.subcategories;

              return (
                <tr
                  key={record.id}
                  className="border-b border-stone-200 hover:bg-emerald-50/20 group transition-colors"
                >
                  {/* Row Number (Excel Style) */}
                  <td className="py-1 px-2 border-r border-stone-300 text-center font-mono text-stone-500 bg-stone-100/70 select-none text-[11px]">
                    {rowIndex}
                  </td>

                  {/* Cell A: Date */}
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
                      className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:outline-hidden focus:bg-white font-mono"
                    />
                  </td>

                  {/* Cell B: Category */}
                  <td
                    onClick={() => onSelectCell(`B${rowIndex}`, record.category)}
                    className={`border-r border-stone-200 p-0 ${
                      selectedCell === `B${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                    }`}
                  >
                    <select
                      value={record.category}
                      onChange={(e) => {
                        const newCat = e.target.value as MainCategory;
                        const defaultSub = CATEGORIES_CONFIG[newCat]?.subcategories[0] || '';
                        onUpdateRecord(record.id, {
                          category: newCat,
                          subcategory: defaultSub,
                        });
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-transparent border-0 font-medium focus:outline-hidden focus:bg-white text-stone-800"
                    >
                      {MAIN_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Cell C: Subcategory */}
                  <td
                    onClick={() => onSelectCell(`C${rowIndex}`, record.subcategory || '無')}
                    className={`border-r border-stone-200 p-0 ${
                      selectedCell === `C${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                    }`}
                  >
                    {subcategories.length > 0 ? (
                      <select
                        value={record.subcategory || subcategories[0]}
                        onChange={(e) =>
                          onUpdateRecord(record.id, { subcategory: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-xs bg-transparent border-0 font-medium focus:outline-hidden focus:bg-white text-emerald-800"
                      >
                        {subcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={record.subcategory || ''}
                        placeholder="—"
                        onChange={(e) =>
                          onUpdateRecord(record.id, { subcategory: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-xs bg-transparent border-0 text-stone-400 placeholder:text-stone-300 focus:outline-hidden focus:bg-white"
                      />
                    )}
                  </td>

                  {/* Cell D: Description */}
                  <td
                    onClick={() => onSelectCell(`D${rowIndex}`, record.description)}
                    className={`border-r border-stone-200 p-0 ${
                      selectedCell === `D${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                    }`}
                  >
                    <input
                      type="text"
                      value={record.description}
                      onChange={(e) =>
                        onUpdateRecord(record.id, { description: e.target.value })
                      }
                      placeholder={catConfig.placeholderDescription}
                      className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:outline-hidden focus:bg-white text-stone-900"
                    />
                  </td>

                  {/* Cell E: Amount */}
                  <td
                    onClick={() => onSelectCell(`E${rowIndex}`, `NT$ ${record.amount}`)}
                    className={`border-r border-stone-200 p-0 text-right ${
                      selectedCell === `E${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-end px-2">
                      <span className="text-stone-400 text-[10px] mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        value={record.amount}
                        onChange={(e) =>
                          onUpdateRecord(record.id, {
                            amount: Math.max(0, parseInt(e.target.value, 10) || 0),
                          })
                        }
                        className="w-20 text-right py-1.5 text-xs bg-transparent border-0 font-mono font-semibold text-stone-900 focus:outline-hidden focus:bg-white"
                      />
                    </div>
                  </td>

                  {/* Cell F: Personnel */}
                  <td
                    onClick={() => onSelectCell(`F${rowIndex}`, record.personnel || '1號人員')}
                    className={`border-r border-stone-200 p-0 ${
                      selectedCell === `F${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                    }`}
                  >
                    <select
                      value={record.personnel || '1號人員'}
                      onChange={(e) =>
                        onUpdateRecord(record.id, { personnel: e.target.value as PersonnelId })
                      }
                      className="w-full px-2 py-1.5 text-xs bg-transparent border-0 font-medium text-emerald-800 focus:outline-hidden focus:bg-white cursor-pointer"
                    >
                      {ALL_PERSONNEL.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Cell G: Merchant */}
                  <td
                    onClick={() => onSelectCell(`G${rowIndex}`, record.merchant || '')}
                    className={`border-r border-stone-200 p-0 ${
                      selectedCell === `G${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                    }`}
                  >
                    <input
                      type="text"
                      value={record.merchant || ''}
                      onChange={(e) =>
                        onUpdateRecord(record.id, { merchant: e.target.value })
                      }
                      placeholder="例：台灣中油、7-11"
                      className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:outline-hidden focus:bg-white text-stone-700"
                    />
                  </td>

                  {/* Cell H: Invoice No. */}
                  <td
                    onClick={() => onSelectCell(`H${rowIndex}`, record.invoiceNumber || '')}
                    className={`border-r border-stone-200 p-0 ${
                      selectedCell === `H${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                    }`}
                  >
                    <input
                      type="text"
                      value={record.invoiceNumber || ''}
                      onChange={(e) =>
                        onUpdateRecord(record.id, { invoiceNumber: e.target.value })
                      }
                      placeholder="例：AB-12345678"
                      className="w-full px-2 py-1.5 text-xs bg-transparent border-0 font-mono focus:outline-hidden focus:bg-white text-stone-600"
                    />
                  </td>

                  {/* Cell I: Notes */}
                  <td
                    onClick={() => onSelectCell(`I${rowIndex}`, record.notes || '')}
                    className={`border-r border-stone-200 p-0 ${
                      selectedCell === `I${rowIndex}` ? 'ring-2 ring-emerald-600 z-1 bg-emerald-50/40' : ''
                    }`}
                  >
                    <input
                      type="text"
                      value={record.notes || ''}
                      onChange={(e) => onUpdateRecord(record.id, { notes: e.target.value })}
                      placeholder="備註說明..."
                      className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:outline-hidden focus:bg-white text-stone-500"
                    />
                  </td>

                  {/* Row Actions */}
                  <td className="py-1 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id)}
                      className="text-stone-300 hover:text-rose-600 p-1 rounded transition-colors"
                      title="刪除此列"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}

          {/* Quick Add Row at bottom */}
          <tr className="bg-stone-50/80 border-b border-stone-300 hover:bg-emerald-50/40 transition-colors">
            <td className="py-1 px-2 border-r border-stone-300 text-center font-mono text-stone-400 bg-stone-200/50 text-[11px]">
              +
            </td>
            <td colSpan={columns.length + 1} className="py-2 px-3">
              <button
                type="button"
                onClick={onAddRow}
                className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1.5 text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>在下方插入空白列 (Insert New Row)</span>
              </button>
            </td>
          </tr>
        </tbody>

        {/* Excel Total Row (Formula =SUM) */}
        <tfoot className="sticky bottom-0 z-10 bg-stone-100 border-t-2 border-emerald-700 shadow-xs font-semibold text-stone-900">
          <tr className="border-b border-stone-300">
            <td className="py-2 px-2 border-r border-stone-300 text-center font-mono text-stone-500 bg-stone-200/70 text-[11px]">
              ∑
            </td>
            <td colSpan={4} className="py-2 px-3 border-r border-stone-300 text-right font-mono text-xs">
              <span className="text-emerald-800 mr-2">=SUM(E2:E{records.length + 1})</span>
              <span>總計支出合計 (NT$)：</span>
            </td>
            <td className="py-2 px-2 border-r border-stone-300 text-right font-mono text-emerald-800 font-bold text-sm bg-emerald-50/50">
              ${totalSum.toLocaleString()}
            </td>
            <td colSpan={5} className="py-2 px-3 text-stone-500 text-xs font-normal">
              共計 <span className="font-semibold text-stone-800">{records.length}</span> 筆記錄
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
