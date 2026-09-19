'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { GraduationCap, Store, Sparkles, Smartphone, Monitor, RotateCcw } from 'lucide-react';

export const Header: React.FC = () => {
  const { role, setRole, viewMode, setViewMode, resetDemoData } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Stud<span className="text-blue-600">City</span>
                </span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Студенческий Yield Management & Счастливые часы
              </p>
            </div>
          </div>

          {/* Center: Main Role Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setRole('student')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                role === 'student'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Студент</span>
            </button>

            <button
              onClick={() => setRole('cashier')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                role === 'cashier'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden xs:inline">Кассир / Заведение</span>
              <span className="xs:hidden">Кассир</span>
            </button>
          </div>

          {/* Right: Actions (View Mode & Reset) */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle (on Desktop) */}
            {role === 'student' && (
              <button
                onClick={() => setViewMode(viewMode === 'responsive' ? 'mobile-frame' : 'responsive')}
                title={viewMode === 'responsive' ? 'Включить рамку смартфона' : 'Полноэкранный режим'}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition"
              >
                {viewMode === 'responsive' ? (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mobile Frame</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-blue-600" />
                    <span>Full View</span>
                  </>
                )}
              </button>
            )}

            {/* Reset Demo Button */}
            <button
              onClick={resetDemoData}
              title="Сбросить демо-данные"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
