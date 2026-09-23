import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { ExpenseRecord, MainCategory, TableViewMode, PersonnelId } from './types';
import { INITIAL_EXPENSES } from './data/mockData';
import { CATEGORIES_CONFIG } from './data/categories';
import { ExcelHeader } from './components/ExcelHeader';
import { FormulaBar } from './components/FormulaBar';
import { CategorySummary } from './components/CategorySummary';
import { ExpenseTable } from './components/ExpenseTable';
import { MultiColumnMatrixTable } from './components/MultiColumnMatrixTable';
import { ExcelSheetTabs } from './components/ExcelSheetTabs';
import { InvoiceScannerModal } from './components/InvoiceScannerModal';
import { QuickAddModal } from './components/QuickAddModal';
import { LoginModal } from './components/LoginModal';
import { exportToExcel, exportToCSV } from './utils/excelHelper';
import { getStoredCurrentUser, saveCurrentUser } from './utils/authHelper';

const STORAGE_KEY = 'excel_accounting_records_v2';

export default function App() {
  const [records, setRecords] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Auto migrate previous '機車' category to '交通工具' and assign default personnel
          return parsed.map((r: any) => ({
            ...r,
            category: r.category === '機車' ? '交通工具' : r.category,
            personnel: r.personnel || '1號人員',
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load records from localStorage', e);
    }
    return INITIAL_EXPENSES;
  });

  const [currentUser, setCurrentUser] = useState<PersonnelId | null>(() => {
    return getStoredCurrentUser();
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginReason, setLoginReason] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<'scanner' | 'quickAdd' | null>(null);
  const [filterPersonnel, setFilterPersonnel] = useState<string>('ALL');

  const [viewMode, setViewMode] = useState<TableViewMode>('standard');
  const [showSummary, setShowSummary] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaValue, setFormulaValue] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Auto-persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records]);

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesCategory =
      selectedCategory === 'ALL' || r.category === selectedCategory;
    if (!matchesCategory) return false;

    const matchesPersonnel =
      filterPersonnel === 'ALL' || (r.personnel || '1號人員') === filterPersonnel;
    if (!matchesPersonnel) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.description.toLowerCase().includes(query) ||
      (r.subcategory && r.subcategory.toLowerCase().includes(query)) ||
      (r.merchant && r.merchant.toLowerCase().includes(query)) ||
      (r.invoiceNumber && r.invoiceNumber.toLowerCase().includes(query)) ||
      (r.notes && r.notes.toLowerCase().includes(query)) ||
      (r.personnel && r.personnel.toLowerCase().includes(query)) ||
      r.category.toLowerCase().includes(query) ||
      String(r.amount).includes(query)
    );
  });

  const totalSum = filteredRecords.reduce((sum, r) => sum + r.amount, 0);

  // CRUD Operations
  const handleAddRecord = (
    newRecordData: Omit<ExpenseRecord, 'id' | 'createdAt'>
  ) => {
    const newRecord: ExpenseRecord = {
      ...newRecordData,
      personnel: newRecordData.personnel || currentUser || '1號人員',
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleUpdateRecord = (id: string, updates: Partial<ExpenseRecord>) => {
    setRecords((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddEmptyRow = () => {
    if (!currentUser) {
      setLoginReason('手動新增記帳空白列需先登入人員帳號（1-9 號人員）。');
      setIsLoginModalOpen(true);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const newRow: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: today,
      category: '伙食',
      subcategory: '早餐',
      description: '',
      amount: 0,
      personnel: currentUser,
      merchant: '',
      invoiceNumber: '',
      notes: '',
      createdAt: Date.now(),
    };
    setRecords((prev) => [...prev, newRow]);
  };

  const handleAddRowWithCategory = (category: MainCategory) => {
    if (!currentUser) {
      setLoginReason('手動新增記帳列需先登入人員帳號（1-9 號人員）。');
      setIsLoginModalOpen(true);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const defSub = CATEGORIES_CONFIG[category]?.subcategories[0] || '';
    const newRow: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: today,
      category,
      subcategory: defSub,
      description: '',
      amount: 0,
      personnel: currentUser,
      merchant: '',
      invoiceNumber: '',
      notes: '',
      createdAt: Date.now(),
    };
    setRecords((prev) => [...prev, newRow]);
  };

  const handleOpenScanner = () => {
    if (!currentUser) {
      setLoginReason('登記發票功能需要先登入人員帳號（1-9 號人員），登入後將自動為您開啟發票辨識視窗。');
      setPendingAction('scanner');
      setIsLoginModalOpen(true);
      return;
    }
    setIsScannerOpen(true);
  };

  const handleOpenAddModal = () => {
    if (!currentUser) {
      setLoginReason('新增記帳功能需要先登入人員帳號（1-9 號人員），登入後將自動為您開啟記帳視窗。');
      setPendingAction('quickAdd');
      setIsLoginModalOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleLoginSuccess = (user: PersonnelId) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    setIsLoginModalOpen(false);
    const action = pendingAction;
    setPendingAction(null);
    setLoginReason(undefined);
    if (action === 'scanner') {
      setIsScannerOpen(true);
    } else if (action === 'quickAdd') {
      setIsAddModalOpen(true);
    }
  };

  const handleLogout = () => {
    saveCurrentUser(null);
    setCurrentUser(null);
  };

  const handleResetData = () => {
    if (window.confirm('確定要將記帳表單重設為預設示範資料嗎？')) {
      setRecords(INITIAL_EXPENSES);
      setSelectedCategory('ALL');
      setFilterPersonnel('ALL');
      setSearchQuery('');
    }
  };

  const handleExportExcel = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    exportToExcel(records, `個人記帳表單_${dateStr}.xlsx`);
  };

  const handleExportCSV = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    exportToCSV(records, `個人記帳表單_${dateStr}.csv`);
  };

  const handleSelectCell = (cell: string, value: string) => {
    setSelectedCell(cell);
    setFormulaValue(value);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-100 font-sans text-stone-900">
      {/* 1. Excel Ribbon Header */}
      <ExcelHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showSummary={showSummary}
        onToggleSummary={() => setShowSummary((prev) => !prev)}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onOpenAddModal={handleOpenAddModal}
        onOpenScanner={handleOpenScanner}
        onResetData={handleResetData}
        recordCount={records.length}
        currentUser={currentUser}
        onOpenLoginModal={() => {
          setLoginReason(undefined);
          setPendingAction(null);
          setIsLoginModalOpen(true);
        }}
        filterPersonnel={filterPersonnel}
        onFilterPersonnelChange={setFilterPersonnel}
      />

      {/* Unauthenticated Notification Banner */}
      {!currentUser && (
        <div className="bg-amber-500/10 border-b border-amber-300 bg-amber-50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong>目前為未登入狀態：</strong>
              您可隨時瀏覽報表與匯出 Excel；<strong>依系統規定，需登入人員帳號（1~9 號人員）後才可以登記發票與新增消費。</strong>
              <span className="text-amber-700 ml-1">（出廠預設密碼：123456）</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoginReason('請登入 1-9 號人員帳號以登記發票與消費記錄');
              setPendingAction('scanner');
              setIsLoginModalOpen(true);
            }}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-xs shadow-xs shrink-0 cursor-pointer transition-all active:scale-95"
          >
            立即登入人員
          </button>
        </div>
      )}

      {/* 2. Excel Formula Bar */}
      <FormulaBar
        selectedCell={selectedCell}
        formulaValue={formulaValue}
        totalSum={totalSum}
        totalCount={filteredRecords.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenScanner={handleOpenScanner}
      />

      {/* 3. Category Stats Summary Banner (Toggleable) */}
      {showSummary && (
        <CategorySummary
          records={filteredRecords}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* 4. Main Spreadsheet Grid (Standard List or Matrix View) */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {viewMode === 'standard' ? (
          <ExpenseTable
            records={filteredRecords}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onAddRow={handleAddEmptyRow}
            selectedCell={selectedCell}
            onSelectCell={handleSelectCell}
          />
        ) : (
          <MultiColumnMatrixTable
            records={filteredRecords}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onAddRowWithCategory={handleAddRowWithCategory}
            selectedCell={selectedCell}
            onSelectCell={handleSelectCell}
          />
        )}
      </main>

      {/* 5. Bottom Excel Sheet Tabs & Status Bar */}
      <ExcelSheetTabs
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCategory={selectedCategory}
        onClearCategoryFilter={() => setSelectedCategory('ALL')}
        recordCount={filteredRecords.length}
        totalSum={totalSum}
      />

      {/* 6. AI Invoice Recognition Modal */}
      <InvoiceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddRecord={handleAddRecord}
        currentUser={currentUser}
        onPromptLogin={() => {
          setLoginReason('登記發票功能需先登入人員帳號（1-9 號人員），登入後即可確認填入表單。');
          setPendingAction('scanner');
          setIsLoginModalOpen(true);
        }}
      />

      {/* 7. Quick Manual Add Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
        currentUser={currentUser}
        onPromptLogin={() => {
          setLoginReason('新增記帳需先登入人員帳號（1-9 號人員），登入後即可加入記帳表單。');
          setPendingAction('quickAdd');
          setIsLoginModalOpen(true);
        }}
      />

      {/* 8. Personnel Login & Password Settings Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        loginReason={loginReason}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </div>
  );
}
