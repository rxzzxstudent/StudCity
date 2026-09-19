'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { X, Clock, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const QrModal: React.FC = () => {
  const {
    activeOfferForQr,
    activeStudentCode,
    closeQrModal,
    generateNewCode,
    codeTimeRemaining,
    setRole,
  } = useApp();

  if (!activeOfferForQr || !activeStudentCode) return null;

  const progressPercent = Math.max(0, (codeTimeRemaining / 30) * 100);
  const isExpired = codeTimeRemaining <= 0;

  const handleDemoToCashier = () => {
    closeQrModal();
    setRole('cashier');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white relative">
          <button
            onClick={closeQrModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
              Студенческий QR-купон
            </span>
          </div>
          <h3 className="text-xl font-bold">{activeOfferForQr.name}</h3>
          <p className="text-xs text-blue-100 mt-0.5">{activeOfferForQr.title}</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center">
          
          {/* Price & Discount callout */}
          <div className="flex items-center justify-between bg-blue-50/80 rounded-2xl p-3 mb-5 border border-blue-100">
            <div className="text-left">
              <span className="text-[11px] text-slate-500 font-medium block">Итоговая цена:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-blue-700">
                  {activeOfferForQr.discountedPrice.toLocaleString()} ₸
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {activeOfferForQr.originalPrice.toLocaleString()} ₸
                </span>
              </div>
            </div>
            <div className="bg-blue-600 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl shadow-xs">
              -{activeOfferForQr.discountPercent}%
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="relative inline-flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-slate-200/80 shadow-inner">
            {!isExpired ? (
              <QRCodeSVG
                value={`STUDCITY:${activeStudentCode.code}:${activeOfferForQr.id}:${activeStudentCode.finalPrice}`}
                size={180}
                level="H"
                includeMargin={false}
                className="rounded-lg"
              />
            ) : (
              <div className="w-[180px] h-[180px] flex flex-col items-center justify-center bg-slate-50 rounded-lg text-slate-400">
                <Clock className="w-10 h-10 mb-2 text-slate-300 animate-pulse" />
                <span className="text-xs font-semibold">Срок действия истек</span>
              </div>
            )}

            {/* Student 4-digit code */}
            <div className="mt-3 bg-slate-900 text-white font-mono font-black text-xl tracking-wider px-4 py-1.5 rounded-xl shadow-xs flex items-center gap-2">
              <span>{activeStudentCode.code}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Progress Bar & Timer */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {isExpired ? (
                  <span className="text-red-500 font-semibold">Время вышло</span>
                ) : (
                  <span>Обновление через: <strong className="text-slate-900">{codeTimeRemaining} сек</strong></span>
                )}
              </span>
              <button
                onClick={generateNewCode}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Обновить</span>
              </button>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  codeTimeRemaining > 10 ? 'bg-blue-600' : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-[12px] text-slate-500 mt-4 leading-relaxed font-normal">
            Покажите этот экран кассиру <span className="font-semibold text-slate-800">до {activeOfferForQr.happyHoursEnd}</span> для применения скидки.
          </p>

          {/* Student details verified */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>КазНУ им. аль-Фараби (ID подтвержден)</span>
          </div>

          {/* Quick Demo Action to Jump to Cashier */}
          <div className="mt-5">
            <button
              onClick={handleDemoToCashier}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Демо: Проверить на кассе ({activeStudentCode.code})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
