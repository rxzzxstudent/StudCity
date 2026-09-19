'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Camera, Sparkles, QrCode, CheckCircle2 } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { activeStudentCode } = useApp();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      const timer = setTimeout(() => {
        setScanning(false);
        const codeToScan = activeStudentCode ? activeStudentCode.code : 'ST-4821';
        onScanSuccess(codeToScan);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [isOpen, activeStudentCode, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-sm w-full p-6 text-center relative overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-blue-400 text-xs font-bold tracking-wide uppercase">
          <Camera className="w-4 h-4" />
          <span>Сканер терминала кассира</span>
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-4">Наведите камеру на QR студента</h3>

        {/* Viewfinder box with animated scanline */}
        <div className="relative w-64 h-64 mx-auto bg-slate-950 rounded-2xl border-2 border-blue-500/50 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
          <div className="absolute inset-0 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
          
          {/* Scanner crosshair corners */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />

          {/* Animated Laser line */}
          {scanning ? (
            <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 via-sky-300 to-blue-500 shadow-[0_0_12px_#38bdf8] animate-[bounce_1.5s_infinite]" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-emerald-400 animate-scale-up">
              <CheckCircle2 className="w-12 h-12" />
              <span className="font-bold text-sm">QR распознан!</span>
            </div>
          )}

          <QrCode className="w-28 h-28 text-slate-700/60" />
        </div>

        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {scanning ? 'Считывание студенческого токена...' : 'Применение скидки...'}
        </p>
      </div>
    </div>
  );
};
