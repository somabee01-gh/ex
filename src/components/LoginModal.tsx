import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  LogIn,
  X,
  Users,
} from 'lucide-react';
import { PersonnelId, ALL_PERSONNEL } from '../types';
import {
  verifyPassword,
  savePersonnelPassword,
  resetPersonnelPassword,
  saveCurrentUser,
  DEFAULT_PASSWORD,
} from '../utils/authHelper';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: PersonnelId | null;
  onLoginSuccess: (user: PersonnelId) => void;
  onLogout?: () => void;
  isEnforced?: boolean; // If true, user must log in to proceed (cannot close modal)
  loginReason?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  isEnforced = false,
  loginReason,
}) => {
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelId>(
    currentUser || '1號人員'
  );
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [mode, setMode] = useState<'login' | 'changePassword'>('login');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fields for Change Password
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      setSelectedPersonnel(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  }, [selectedPersonnel, mode, isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!password) {
      setErrorMessage('請輸入登入密碼（預設為 123456）');
      return;
    }

    const isValid = verifyPassword(selectedPersonnel, password);
    if (!isValid) {
      setErrorMessage('密碼錯誤！若未曾修改，預設密碼為 123456');
      return;
    }

    saveCurrentUser(selectedPersonnel);
    onLoginSuccess(selectedPersonnel);
    setPassword('');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPasswordInput) {
      setErrorMessage('請輸入目前舊密碼（若未修改過，預設為 123456）');
      return;
    }

    const isOldValid = verifyPassword(selectedPersonnel, currentPasswordInput);
    if (!isOldValid) {
      setErrorMessage('目前舊密碼輸入錯誤，請重新確認');
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setErrorMessage('新密碼長度至少需要 4 碼以上');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMessage('兩次輸入的新密碼不相符，請再次確認');
      return;
    }

    savePersonnelPassword(selectedPersonnel, newPasswordInput);
    setSuccessMessage(`【${selectedPersonnel}】密碼已成功變更！請使用新密碼登入。`);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setTimeout(() => {
      setMode('login');
      setSuccessMessage('');
    }, 1500);
  };

  const handleResetToDefault = () => {
    if (window.confirm(`確定要將【${selectedPersonnel}】密碼重設為預設值「${DEFAULT_PASSWORD}」嗎？`)) {
      resetPersonnelPassword(selectedPersonnel);
      setSuccessMessage(`【${selectedPersonnel}】密碼已重設為預設值：${DEFAULT_PASSWORD}`);
      setErrorMessage('');
    }
  };

  const handleFastFillDefault = () => {
    setPassword(DEFAULT_PASSWORD);
  };

  return (
    <div
      id="personnel-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10 text-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide">
                {mode === 'login' ? '使用者人員登入' : '設定 / 修改人員密碼'}
              </h2>
              <p className="text-[11px] text-emerald-200">
                1-9 號人員身份切換・預設密碼：{DEFAULT_PASSWORD}
              </p>
            </div>
          </div>
          {!isEnforced && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mode === 'login'
                ? 'border-emerald-700 text-emerald-800 bg-white shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>人員登入</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('changePassword')}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mode === 'changePassword'
                ? 'border-emerald-700 text-emerald-800 bg-white shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>設定 / 修改密碼</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Reason Notification if triggered by an action requiring login */}
          {loginReason && mode === 'login' && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div>
                <p className="font-bold text-amber-900">需要登入身分</p>
                <p className="text-[11px] text-amber-800 mt-0.5">{loginReason}</p>
              </div>
            </div>
          )}

          {/* Status Notifications */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Personnel Quick Selector (1-9 號人員) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>請選擇記帳人員 (1-9 號)：</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                目前選定：{selectedPersonnel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {ALL_PERSONNEL.map((p, idx) => {
                const isCurrentActive = currentUser === p;
                const isSelected = selectedPersonnel === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPersonnel(p)}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-700 text-white shadow-xs font-bold'
                        : 'border-stone-200 bg-stone-50 hover:bg-emerald-50/50 text-stone-700 hover:border-emerald-400'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isSelected ? 'bg-white text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span>{p}</span>
                    {isCurrentActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 ml-0.5" title="已登入" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-stone-500" />
                    <span>輸入【{selectedPersonnel}】密碼：</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleFastFillDefault}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium underline"
                  >
                    帶入預設密碼 (123456)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼（預設 123456）"
                    autoFocus
                    className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono tracking-wider focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                  提示：系統預設密碼為 <code className="font-bold text-stone-700 bg-stone-100 px-1 py-0.5 rounded">123456</code>，可於登入後或上方分頁自行修改。
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#107c41] hover:bg-[#0e6b37] text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>以【{selectedPersonnel}】登入</span>
                </button>

                {currentUser && onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setSuccessMessage('已登出當前帳號');
                    }}
                    className="w-full py-2 border border-stone-300 hover:bg-stone-50 text-stone-600 rounded-lg text-xs font-medium"
                  >
                    登出當前使用者 ({currentUser})
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* Change Password Form */
            <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  原舊密碼 *
                </label>
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="若未修改過，預設為 123456"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  設定新密碼 *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="請輸入欲設定的新密碼（至少 4 碼）"
                    className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  再次確認新密碼 *
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="請再次輸入相同的新密碼"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#107c41] hover:bg-[#0e6b37] text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>確認設定【{selectedPersonnel}】新密碼</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="w-full py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>恢復此人員密碼為預設值 (123456)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
