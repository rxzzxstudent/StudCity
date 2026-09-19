'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import confetti from 'canvas-confetti';
import { 
  Users, 
  TrendingUp, 
  Percent, 
  CheckCircle2, 
  Camera, 
  Sparkles, 
  Power, 
  Clock, 
  History, 
  BadgePercent,
  Receipt,
  ArrowRight,
  TrendingDown,
  Building2,
  Volume2
} from 'lucide-react';
import { ScannerModal } from './ScannerModal';

export const CashierView: React.FC = () => {
  const {
    urboHappyHoursActive,
    toggleUrboHappyHours,
    activeStudentCode,
    validateCode,
    lastValidatedCode,
    clearLastValidation,
    b2bMetrics,
    redemptionLogs,
  } = useApp();

  const [inputCode, setInputCode] = useState<string>(activeStudentCode ? activeStudentCode.code : 'ST-4821');
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  };

  const handleValidate = () => {
    if (!inputCode.trim()) {
      setValidationError('Пожалуйста, введите код студента (например, ST-4821)');
      return;
    }
    setValidationError(null);
    const result = validateCode(inputCode.trim());
    if (result.success) {
      triggerConfetti();
    }
  };

  const handleScanSuccess = (scannedCode: string) => {
    setInputCode(scannedCode);
    setScannerOpen(false);
    const result = validateCode(scannedCode);
    if (result.success) {
      triggerConfetti();
    }
  };

  const handleUseCurrentStudentCode = () => {
    if (activeStudentCode) {
      setInputCode(activeStudentCode.code);
    } else {
      setInputCode('ST-4821');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      
      {/* 1. Venue Header & Status Plate */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  URBO Coffee
                </h1>
                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-lg">
                  Касса №1 • Байтурсынова 100
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-0.5">
                Панель управления потоком (Yield Management)
              </p>
            </div>
          </div>

          {/* Real-time Status Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 sm:px-4 rounded-2xl">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Время: <strong>15:10</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-xl">
              <TrendingDown className="w-4 h-4 text-amber-600" />
              <span>Окно: Непиковый спад (загрузка {b2bMetrics.currentCapacity}%)</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Interactive Smart Toggle: Happy Hours */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-xs ${
        urboHappyHoursActive 
          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-blue-500'
          : 'bg-slate-800 text-slate-100 border-slate-700'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                urboHappyHoursActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                Динамическое ценообразование
              </span>
              <span className="flex items-center gap-1 text-xs text-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Студенческий трафик
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Счастливые часы StudCity
            </h2>
            
            <p className="text-xs sm:text-sm mt-1 opacity-90">
              {urboHappyHoursActive ? (
                <span>🟢 <strong>Скидка 40% активна</strong> для студентов до 17:00 (увеличивает загрузку зала)</span>
              ) : (
                <span>⏸️ <strong>Счастливые часы отключены</strong>. Скидка не отображается в приложении студентов</span>
              )}
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={toggleUrboHappyHours}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 shadow-md ${
              urboHappyHoursActive
                ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-white/10'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
            }`}
          >
            <Power className="w-5 h-5" />
            <span>{urboHappyHoursActive ? 'ВКЛЮЧЕНЫ' : 'ВКЛЮЧИТЬ СКИДКУ'}</span>
          </button>
        </div>
      </div>

      {/* 3. Main Split Section: Code Validator & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Student Code Validator */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    Валидатор студенческого купона
                  </h3>
                  <p className="text-xs text-slate-500">
                    Проверка динамического 4-значного кода студента
                  </p>
                </div>
              </div>

              <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                Кассовый терминал Ready
              </span>
            </div>

            {/* Input and Scan Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Введите 4-значный код (например, ST-4821):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="ST-XXXX"
                    className="flex-1 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-3 font-mono font-bold text-lg text-slate-900 tracking-wider transition uppercase outline-hidden"
                  />

                  <button
                    onClick={() => setScannerOpen(true)}
                    title="Сканировать QR камерой"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">Скан QR</span>
                  </button>
                </div>
              </div>

              {/* Quick Helper for Demo */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {activeStudentCode && (
                  <button
                    onClick={handleUseCurrentStudentCode}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-xl transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Вставить активный код студента ({activeStudentCode.code})</span>
                  </button>
                )}

                <span className="text-[11px] text-slate-400 font-normal">
                  Демо-режим валидации
                </span>
              </div>

              {validationError && (
                <p className="text-xs text-red-500 font-semibold">{validationError}</p>
              )}

              {/* Validate Button */}
              <button
                onClick={handleValidate}
                className="w-full mt-2 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/25"
              >
                <BadgePercent className="w-4 h-4" />
                <span>Применить студенческую скидку</span>
              </button>
            </div>
          </div>

          {/* Validation Result Box */}
          {lastValidatedCode && (
            <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 animate-scale-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-emerald-900">
                      Код {lastValidatedCode.codeData?.code || inputCode} валиден!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Скидка 40% успешно применена к чеку
                    </p>
                  </div>
                </div>

                <button
                  onClick={clearLastValidation}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  Очистить
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Студент:</span>
                  <strong className="text-slate-800">{lastValidatedCode.codeData?.studentName || 'Алихан С.'}</strong>
                  <span className="text-[11px] text-slate-500 block font-normal">КазНУ им. аль-Фараби</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Сумма к оплате:</span>
                  <strong className="text-base font-black text-emerald-700">
                    {lastValidatedCode.codeData?.finalPrice.toLocaleString() || '650'} ₸
                  </strong>
                  <span className="text-[11px] text-slate-400 line-through block">1 100 ₸</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (5 cols): Pitch Express Analytics */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Экспресс-аналитика заведения
              </h3>
              <span className="text-xs text-slate-400 font-medium">Сегодня</span>
            </div>

            {/* 3 Analytics Cards */}
            <div className="space-y-3">
              
              {/* Card 1: Students */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Привлечено студентов:</span>
                    <span className="text-lg font-black text-slate-900">
                      {b2bMetrics.studentsToday} чел.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                  +18% к ср.
                </span>
              </div>

              {/* Card 2: Revenue */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Выручка в непик:</span>
                    <span className="text-lg font-black text-emerald-700">
                      +{b2bMetrics.additionalRevenue.toLocaleString()} ₸
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                  Чистый +
                </span>
              </div>

              {/* Card 3: Conversion */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Конверсия в постоянных:</span>
                    <span className="text-lg font-black text-indigo-900">
                      {b2bMetrics.repeatConversionPercent}%
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-lg">
                  LTV ↑
                </span>
              </div>

            </div>

            {/* Yield Management Curve Visualizer */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Загрузка зала (Сглаживание спада)</span>
                <span className="text-blue-600">+45% в 14:00-17:00</span>
              </div>

              {/* Visual Bars for Hours */}
              <div className="grid grid-cols-5 gap-1.5 items-end h-16 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-slate-300 rounded-t-sm h-[85%]" title="12:00 (Обед пик)" />
                  <span className="text-[9px] text-slate-400">12:00</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-slate-300 rounded-t-sm h-[70%]" title="13:00" />
                  <span className="text-[9px] text-slate-400">13:00</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end relative">
                  <div className="w-full bg-blue-500 rounded-t-sm h-[65%]" title="14:00 (StudCity Boost)" />
                  <span className="text-[9px] font-bold text-blue-600">14:00</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end relative">
                  <div className="w-full bg-blue-600 rounded-t-sm h-[60%]" title="15:00 (StudCity Boost)" />
                  <span className="text-[9px] font-bold text-blue-600">15:00</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-blue-500 rounded-t-sm h-[55%]" title="16:00 (StudCity Boost)" />
                  <span className="text-[9px] font-bold text-blue-600">16:00</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 4. Shift Redemption History Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="font-extrabold text-base text-slate-900">
              История погашений за смену
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Всего погашено: {redemptionLogs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-2.5 font-medium">Время</th>
                <th className="pb-2.5 font-medium">Код купона</th>
                <th className="pb-2.5 font-medium">Университет</th>
                <th className="pb-2.5 font-medium text-right">Сумма чека</th>
                <th className="pb-2.5 font-medium text-right">Скидка студенту</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {redemptionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="py-3 font-mono font-bold text-slate-900">{log.code}</td>
                  <td className="py-3 text-slate-600">{log.studentUni}</td>
                  <td className="py-3 text-right font-black text-slate-900">
                    {log.amount.toLocaleString()} ₸
                  </td>
                  <td className="py-3 text-right font-semibold text-emerald-600">
                    -{log.savedAmount.toLocaleString()} ₸
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

    </div>
  );
};
