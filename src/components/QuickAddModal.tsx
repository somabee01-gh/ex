import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, DollarSign, Tag, Store, FileText, User, Lock } from 'lucide-react';
import { ExpenseRecord, MainCategory, PersonnelId, ALL_PERSONNEL } from '../types';
import { CATEGORIES_CONFIG, MAIN_CATEGORIES } from '../data/categories';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  currentUser?: PersonnelId | null;
  onPromptLogin?: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
  currentUser,
  onPromptLogin,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<MainCategory>('伙食');
  const [subcategory, setSubcategory] = useState('午餐');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [merchant, setMerchant] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [personnel, setPersonnel] = useState<PersonnelId>(currentUser || '1號人員');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setPersonnel(currentUser);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: MainCategory) => {
    setCategory(newCat);
    const subOptions = CATEGORIES_CONFIG[newCat]?.subcategories || [];
    setSubcategory(subOptions[0] || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('新增記帳需先登入人員帳號（1-9 號人員），請先登入後再進行記錄！');
      if (onPromptLogin) {
        onPromptLogin();
      }
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('請輸入大於 0 的金額');
      return;
    }
    if (!description.trim()) {
      setError('請輸入消費明細說明');
      return;
    }

    onAddRecord({
      date,
      category,
      subcategory,
      description: description.trim(),
      amount: Number(amount),
      merchant: merchant.trim(),
      invoiceNumber: invoiceNumber.trim(),
      notes: notes.trim(),
      personnel: personnel || currentUser,
    });

    onClose();
  };

  const subcategories = CATEGORIES_CONFIG[category]?.subcategories || [];

  return (
    <div
      id="quick-add-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-2xs animate-fadeIn"
    >
      <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#107c41] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <h3 className="text-sm font-bold tracking-wide">新增一筆 EXCEL 記帳紀錄</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {!currentUser && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold">尚未登入人員身份：</span>
                  <span className="text-amber-800">新增記帳需先登入（1-9 號人員）。</span>
                </div>
              </div>
              {onPromptLogin && (
                <button
                  type="button"
                  onClick={onPromptLogin}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold shrink-0 transition-colors shadow-2xs"
                >
                  立即登入
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
              {error}
            </div>
          )}

          {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">消費日期 *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-white border border-stone-300 rounded font-mono text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">金額 (NT$) *</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-stone-400 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => {
                    setError('');
                    setAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10));
                  }}
                  placeholder="0"
                  className="w-full pl-6 pr-2 py-2 bg-white border border-stone-300 rounded font-mono font-bold text-stone-900 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Personnel Selector (1-9號) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-stone-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>記帳人員 (1-9號人員) *</span>
              </label>
              <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                目前：{personnel}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1">
              {ALL_PERSONNEL.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPersonnel(p)}
                  className={`py-1.5 px-1 rounded text-center text-xs transition-all ${
                    personnel === p
                      ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                      : 'bg-stone-50 text-stone-700 hover:bg-emerald-50 border border-stone-200'
                  }`}
                  title={p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block font-medium text-stone-700 mb-1.5">
              主類別 (Category) *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {MAIN_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`py-1.5 px-2 rounded border text-center transition-all ${
                    category === cat
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory options */}
          {subcategories.length > 0 && (
            <div>
              <label className="block font-medium text-stone-700 mb-1.5">
                子分類 (依「{category}」專屬選項)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(sub)}
                    className={`py-1 px-2.5 rounded-full border text-xs transition-all ${
                      subcategory === sub
                        ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                        : 'border-stone-300 text-stone-600 hover:border-emerald-400 bg-white'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              消費明細說明 *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => {
                setError('');
                setDescription(e.target.value);
              }}
              placeholder={CATEGORIES_CONFIG[category]?.placeholderDescription || '明細說明'}
              className="w-full p-2 bg-white border border-stone-300 rounded text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Merchant & Invoice Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">商家名稱 / 平台</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="例：台灣中油、MOMO購物"
                className="w-full p-2 bg-white border border-stone-300 rounded text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">發票號碼</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="例：AB-12345678"
                className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-mono focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-stone-700 mb-1">備註說明</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="其他備註事項..."
              className="w-full p-2 bg-white border border-stone-300 rounded text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-all ${
                !currentUser
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#107c41] hover:bg-[#0e6b37]'
              }`}
            >
              {!currentUser ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>需先登入以加入記帳</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>加入記帳表單</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
