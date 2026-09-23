import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileImage,
  RefreshCw,
  Store,
  Calendar,
  DollarSign,
  Tag,
  Receipt,
  Layers,
  ArrowRight,
  User,
  Lock,
  Download,
  FlipHorizontal,
  Video,
  RotateCcw,
} from 'lucide-react';
import { ExpenseRecord, InvoiceRecognitionResult, MainCategory, PersonnelId, ALL_PERSONNEL } from '../types';
import { CATEGORIES_CONFIG, MAIN_CATEGORIES } from '../data/categories';
import { SAMPLE_RECEIPT_PRESETS } from '../data/mockData';

interface InvoiceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  currentUser?: PersonnelId | null;
  onPromptLogin?: () => void;
}

export const InvoiceScannerModal: React.FC<InvoiceScannerModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
  currentUser,
  onPromptLogin,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<InvoiceRecognitionResult | null>(null);

  // Live computer camera stream state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Editable fields before confirming
  const [editDate, setEditDate] = useState<string>('');
  const [editCategory, setEditCategory] = useState<MainCategory>('伙食');
  const [editSubcategory, setEditSubcategory] = useState<string>('早餐');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editMerchant, setEditMerchant] = useState<string>('');
  const [editInvoiceNumber, setEditInvoiceNumber] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editPersonnel, setEditPersonnel] = useState<PersonnelId>(currentUser || '1號人員');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setEditPersonnel(currentUser);
    }
  }, [currentUser, isOpen]);

  // Clean up camera stream when modal unmounts or closes
  const stopCamera = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn('Error stopping camera track:', e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('此瀏覽器環境不支援直接開啟攝影機，請使用檔案上傳或更換現代瀏覽器。');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        });
      } catch (e) {
        // Fallback for computer webcams where facingMode constraint is unsupported
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play error:', playErr);
        }
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      let msg = '無法啟動電腦相機：';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = '瀏覽器尚未允許使用相機。請在網址列左側（或右上角）點選允許使用相機權限後再試。';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = '未偵測到相機或視訊鏡頭設備。若為桌上型電腦，請確認已插妥 USB 攝影機。';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = '相機鏡頭正被其他程式（如 Zoom、Google Meet、Teams 或其他分頁）佔用，請先關閉後重試。';
      } else {
        msg += err.message || '請確認相機設備與存取權限。';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const handleToggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMsg('相機鏡頭尚未完全啟動，請稍候片刻再點擊拍照。');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw current camera frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop live camera stream after snapping photo
    stopCamera();

    // Set preview and trigger AI OCR
    setSelectedImage(dataUrl);
    setMimeType('image/jpeg');
    setRecognitionResult(null);
    setErrorMsg(null);
    processImageRecognition(dataUrl, 'image/jpeg');
  };

  const handleDownloadPhoto = () => {
    if (!selectedImage) return;
    const link = document.createElement('a');
    link.href = selectedImage;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `發票照片_${editInvoiceNumber || timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    setRecognitionResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
      setMimeType(file.type || 'image/jpeg');
      // Automatically trigger recognition
      processImageRecognition(dataUrl, file.type || 'image/jpeg');
    };
    reader.onerror = () => {
      setErrorMsg('讀取圖片檔案失敗，請重試。');
    };
    reader.readAsDataURL(file);
  };

  const processImageRecognition = async (imageBase64: string, type: string) => {
    setIsRecognizing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/recognize-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: type,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || '發票辨識失敗');
      }

      const result: InvoiceRecognitionResult = json.data;
      applyRecognitionResult(result);
    } catch (err: any) {
      console.warn('AI recognition error:', err);
      let message = err?.message || '辨識連線失敗';
      try {
        if (message.includes('{') && message.includes('}')) {
          const parsed = JSON.parse(message.substring(message.indexOf('{')));
          if (parsed?.error?.message) {
            message = parsed.error.message;
          }
        }
      } catch (e) {
        // ignore parse error
      }

      if (message.includes('503') || message.includes('high demand') || message.includes('UNAVAILABLE')) {
        setErrorMsg('AI 服務目前全球瞬間連線需求較大 (503 High Demand)。系統已為您準備好備援通道，請直接點擊下方「立即重新辨識」按鈕！');
      } else if (message.includes('GEMINI_API_KEY')) {
        setErrorMsg('系統尚未偵測到 GEMINI_API_KEY，您可於 Settings > Secrets 設定；或點選下方「示範發票」體驗自動辨識填表流程！');
      } else {
        setErrorMsg(`辨識提示：${message}`);
      }
    } finally {
      setIsRecognizing(false);
    }
  };

  const applyRecognitionResult = (res: InvoiceRecognitionResult) => {
    setRecognitionResult(res);
    setEditDate(res.date || new Date().toISOString().split('T')[0]);
    const validCat: MainCategory = MAIN_CATEGORIES.includes(res.category as MainCategory)
      ? (res.category as MainCategory)
      : '伙食';
    setEditCategory(validCat);

    const allowedSub = CATEGORIES_CONFIG[validCat]?.subcategories || [];
    if (allowedSub.includes(res.subcategory)) {
      setEditSubcategory(res.subcategory);
    } else {
      setEditSubcategory(allowedSub[0] || '');
    }

    setEditDescription(res.description || res.merchant || '發票消費項目');
    setEditAmount(res.totalAmount || 0);
    setEditMerchant(res.merchant || '');
    setEditInvoiceNumber(res.invoiceNumber || '');
    setEditNotes(res.notes || '');
  };

  const handleApplyPreset = (preset: (typeof SAMPLE_RECEIPT_PRESETS)[0]) => {
    setErrorMsg(null);
    setSelectedImage(null);
    applyRecognitionResult(preset.result);
  };

  const handleConfirmAdd = () => {
    if (!currentUser) {
      setErrorMsg('登記發票需先登入人員帳號（1-9 號人員），請先登入後再進行登記！');
      if (onPromptLogin) {
        onPromptLogin();
      }
      return;
    }

    if (editAmount <= 0) {
      setErrorMsg('請填寫大於 0 的金額');
      return;
    }

    onAddRecord({
      date: editDate || new Date().toISOString().split('T')[0],
      category: editCategory,
      subcategory: editSubcategory,
      description: editDescription || '發票消費',
      amount: editAmount,
      merchant: editMerchant,
      invoiceNumber: editInvoiceNumber,
      notes: editNotes,
      personnel: editPersonnel || currentUser,
    });

    handleClose();
  };

  return (
    <div
      id="invoice-scanner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-white/10">
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300/30" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide">
                發票／收據智能辨識 (AI OCR)
              </h2>
              <p className="text-xs text-emerald-200">
                電腦相機即時拍照或上傳發票，自動分析金額、日期、商家並歸入記帳分類
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Unauthenticated Alert Banner */}
          {!currentUser && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded bg-amber-200 text-amber-900">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold">尚未登入人員身份：</span>
                  <span className="text-amber-800">登記發票需先登入（1-9 號人員）才能將發票登記至帳本。</span>
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

          {/* Upload and Capture Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Box: Live Camera Viewfinder OR Upload Trigger & Preview */}
            <div className="flex flex-col gap-3">
              {/* Camera Error Message */}
              {cameraError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-start gap-2 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">相機啟動提示</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">{cameraError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCameraError(null)}
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* LIVE CAMERA VIEWFINDER */}
              {isCameraActive ? (
                <div className="relative w-full aspect-4/3 bg-stone-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-emerald-500 shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Top overlay badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/20 shadow">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>電腦相機即時取景中</span>
                  </div>

                  {/* Framing guideline for receipts */}
                  <div className="absolute inset-5 sm:inset-6 border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] sm:text-[11px] font-medium text-emerald-100 bg-black/75 backdrop-blur-xs py-1 px-2.5 rounded-full shadow border border-emerald-500/40 inline-block">
                        請將發票或收據對準此框內
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  </div>

                  {/* Camera Action Controls Overlay */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                    <button
                      type="button"
                      onClick={handleToggleCameraFacing}
                      className="px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs text-xs flex items-center gap-1 border border-white/20 transition-all active:scale-95"
                      title="切換相機鏡頭"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">切換鏡頭</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 border-2 border-white ring-2 ring-emerald-400/50 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>拍照並辨識</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs text-xs flex items-center gap-1 border border-white/20 transition-all active:scale-95"
                      title="關閉相機"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">關閉</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* PREVIEW OR DROPZONE */
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden min-h-[190px] ${
                    selectedImage
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-stone-300 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50/30'
                  }`}
                >
                  {selectedImage ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img
                        src={selectedImage}
                        alt="Invoice preview"
                        className="max-h-44 object-contain rounded-md shadow-xs border border-stone-200"
                      />
                      <div className="mt-2 text-xs font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>已取得發票照片</span>
                      </div>
                      {/* Photo management buttons */}
                      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 w-full">
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                        >
                          <Camera className="w-3 h-3" />
                          <span>重新開啟相機拍照</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadPhoto}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                          title="將此發票相片儲存至您的電腦硬碟"
                        >
                          <Download className="w-3 h-3" />
                          <span>儲存照片至電腦</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <FileImage className="w-3 h-3 text-stone-500" />
                          <span>更換檔案</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer py-4"
                      onClick={() => startCamera()}
                    >
                      <div className="p-3 bg-emerald-100/80 text-emerald-800 rounded-full mb-2.5 inline-flex">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-stone-800 block">
                        點擊立即開啟「電腦相機拍照」
                      </span>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        直接使用視訊鏡頭或外接相機拍照；亦可拖曳圖片檔案至此
                      </span>
                    </div>
                  )}

                  {/* Laser scanning effect when recognizing */}
                  {isRecognizing && (
                    <div className="absolute inset-0 bg-emerald-900/15 flex flex-col items-center justify-center backdrop-blur-2xs">
                      <div className="w-full h-0.5 bg-emerald-500 shadow-md shadow-emerald-400 animate-pulse absolute top-1/2 -translate-y-1/2" />
                      <div className="bg-white/95 px-3.5 py-2 rounded-full shadow-md text-xs font-semibold text-emerald-800 flex items-center gap-2 z-10 border border-emerald-200">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>Gemini AI 發票智慧辨識中...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action trigger buttons (When camera is not actively running) */}
              {!isCameraActive && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>相機拍照</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileImage className="w-4 h-4 text-stone-500" />
                    <span>瀏覽圖片檔案</span>
                  </button>
                </div>
              )}

              {/* Quick Sample Presets */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                  快速體驗示範發票（無相片亦可測試）：
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {SAMPLE_RECEIPT_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-left p-1.5 rounded border border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors cursor-pointer"
                    >
                      <div className="text-[11px] font-semibold text-stone-800 truncate">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        {preset.badge}・${preset.result.totalAmount}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Box: Extracted Data Review & Edit Form */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-stone-800">
                      辨識結果與填表確認
                    </span>
                  </div>
                  {recognitionResult && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      辨識完成
                    </span>
                  )}
                </div>

                {errorMsg && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-2">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{errorMsg}</span>
                    </div>

                    {selectedImage && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => processImageRecognition(selectedImage, mimeType)}
                          disabled={isRecognizing}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRecognizing ? 'animate-spin' : ''}`} />
                          <span>{isRecognizing ? '辨識連線中...' : '🔄 點此立即重新辨識此發票'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-2.5 text-xs">
                  {/* Personnel selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span>記帳歸屬人員 (1-9號)</span>
                      </label>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        目前：{editPersonnel}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-9 gap-1">
                      {ALL_PERSONNEL.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setEditPersonnel(p)}
                          className={`py-1 rounded text-center text-[11px] transition-all ${
                            editPersonnel === p
                              ? 'bg-emerald-700 text-white font-bold'
                              : 'bg-stone-100 text-stone-700 hover:bg-emerald-50'
                          }`}
                        >
                          {p.replace('人員', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category & Subcategory */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        主類別 (Category)
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => {
                          const cat = e.target.value as MainCategory;
                          setEditCategory(cat);
                          setEditSubcategory(CATEGORIES_CONFIG[cat]?.subcategories[0] || '');
                        }}
                        className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      >
                        {MAIN_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        子分類 (Subcategory)
                      </label>
                      {CATEGORIES_CONFIG[editCategory]?.subcategories.length > 0 ? (
                        <select
                          value={editSubcategory}
                          onChange={(e) => setEditSubcategory(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-semibold text-emerald-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        >
                          {CATEGORIES_CONFIG[editCategory].subcategories.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editSubcategory}
                          onChange={(e) => setEditSubcategory(e.target.value)}
                          placeholder="無子分類 (或自由備註)"
                          className="w-full p-2 bg-white border border-stone-300 rounded text-xs text-stone-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Amount & Date */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        金額 (NT$) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-stone-400 font-semibold">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={editAmount || ''}
                          onChange={(e) => setEditAmount(parseInt(e.target.value, 10) || 0)}
                          placeholder="0"
                          className="w-full pl-6 pr-2 py-2 bg-white border border-stone-300 rounded text-xs font-mono font-bold text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        日期 (Date)
                      </label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      消費明細項目
                    </label>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="例：95無鉛汽油、蛋餅大溫奶"
                      className="w-full p-2 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Merchant & Invoice Number */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        商家名稱
                      </label>
                      <input
                        type="text"
                        value={editMerchant}
                        onChange={(e) => setEditMerchant(e.target.value)}
                        placeholder="例：7-11、台灣中油"
                        className="w-full p-2 bg-white border border-stone-300 rounded text-xs text-stone-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        發票號碼
                      </label>
                      <input
                        type="text"
                        value={editInvoiceNumber}
                        onChange={(e) => setEditInvoiceNumber(e.target.value)}
                        placeholder="AB-12345678"
                        className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-mono text-stone-700"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      備註說明
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="額外說明..."
                      className="w-full p-2 bg-white border border-stone-300 rounded text-xs text-stone-600"
                    />
                  </div>
                </div>
              </div>

              {/* Confirm Add Button */}
              <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  取消
                </button>
                <button
                  id="confirm-insert-sheet-btn"
                  type="button"
                  onClick={handleConfirmAdd}
                  className={`px-4 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                    !currentUser
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#107c41] hover:bg-[#0e6b37] text-white'
                  }`}
                >
                  {!currentUser ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>需先登入人員帳號以登記發票</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>以【{currentUser}】身分確認並填入 EXCEL 表單</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
