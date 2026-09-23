import * as XLSX from 'xlsx';
import { ExpenseRecord } from '../types';
import { MAIN_CATEGORIES } from '../data/categories';

export function exportToExcel(records: ExpenseRecord[], filename = '記帳表單.xlsx') {
  const wb = XLSX.utils.book_new();

  // 1. Standard Detail Sheet
  const detailData = records.map((r, idx) => ({
    序號: idx + 1,
    日期: r.date,
    主分類: r.category,
    子分類: r.subcategory || '—',
    消費明細: r.description,
    '金額 (NT$)': r.amount,
    記帳人員: r.personnel || '1號人員',
    商家名稱: r.merchant || '',
    發票號碼: r.invoiceNumber || '',
    備註說明: r.notes || '',
  }));

  const wsDetail = XLSX.utils.json_to_sheet(detailData);
  // Auto-adjust column widths
  wsDetail['!cols'] = [
    { wch: 6 }, // 序號
    { wch: 12 }, // 日期
    { wch: 10 }, // 主分類
    { wch: 12 }, // 子分類
    { wch: 28 }, // 消費明細
    { wch: 12 }, // 金額
    { wch: 14 }, // 記帳人員
    { wch: 18 }, // 商家名稱
    { wch: 15 }, // 發票號碼
    { wch: 20 }, // 備註說明
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, '記帳明細總表');

  // 2. Multi-column Matrix Sheet (Category columns as requested by user)
  const matrixData = records.map((r, idx) => {
    return {
      項次: idx + 1,
      日期: r.date,
      摘要: r.description,
      '伙食 (早餐/午餐/晚餐/飲料/點心)': r.category === '伙食' ? `${r.subcategory ? `[${r.subcategory}] ` : ''}$${r.amount}` : '',
      '交通工具 (加油/保養/停車費)': r.category === '交通工具' ? `${r.subcategory ? `[${r.subcategory}] ` : ''}$${r.amount}` : '',
      服飾: r.category === '服飾' ? `$${r.amount}` : '',
      日用品: r.category === '日用品' ? `$${r.amount}` : '',
      '網購 (蝦皮/淘寶/MOMO)': r.category === '網購' ? `${r.subcategory ? `[${r.subcategory}] ` : ''}$${r.amount}` : '',
      '書籍 (數學/物理/化學/通識/加工)': r.category === '書籍' ? `${r.subcategory ? `[${r.subcategory}] ` : ''}$${r.amount}` : '',
      其他: r.category === '其他' ? `$${r.amount}` : '',
      '總金額 (NT$)': r.amount,
      發票或憑證: r.invoiceNumber || '',
    };
  });

  const wsMatrix = XLSX.utils.json_to_sheet(matrixData);
  wsMatrix['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 25 },
    { wch: 22 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 25 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMatrix, '專屬分欄矩陣表');

  // 3. Category Summary Sheet
  const summaryMap: Record<string, { total: number; count: number }> = {};
  MAIN_CATEGORIES.forEach((cat) => {
    summaryMap[cat] = { total: 0, count: 0 };
  });

  let grandTotal = 0;
  records.forEach((r) => {
    if (!summaryMap[r.category]) {
      summaryMap[r.category] = { total: 0, count: 0 };
    }
    summaryMap[r.category].total += r.amount;
    summaryMap[r.category].count += 1;
    grandTotal += r.amount;
  });

  const summaryData = Object.entries(summaryMap).map(([category, stats]) => ({
    分類項目: category,
    '筆數': stats.count,
    '總金額 (NT$)': stats.total,
    '支出佔比': grandTotal > 0 ? `${((stats.total / grandTotal) * 100).toFixed(1)}%` : '0%',
  }));

  summaryData.push({
    分類項目: '【總計支出】',
    筆數: records.length,
    '總金額 (NT$)': grandTotal,
    支出佔比: '100.0%',
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 15 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, '分類統計彙總');

  XLSX.writeFile(wb, filename);
}

export function exportToCSV(records: ExpenseRecord[], filename = '記帳表單.csv') {
  const headers = ['日期', '主分類', '子分類', '消費明細', '金額', '記帳人員', '商家名稱', '發票號碼', '備註說明'];
  const rows = records.map((r) => [
    r.date,
    r.category,
    r.subcategory || '',
    `"${(r.description || '').replace(/"/g, '""')}"`,
    r.amount,
    `"${(r.personnel || '1號人員').replace(/"/g, '""')}"`,
    `"${(r.merchant || '').replace(/"/g, '""')}"`,
    r.invoiceNumber || '',
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
