'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { GraduationCap, Store, Sparkles, Smartphone, Monitor, RotateCcw, CheckCircle2, Search } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    role, 
    setRole, 
    viewMode, 
    setViewMode, 
    resetDemoData,
    searchQuery,
    setSearchQuery,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-slate-900">
                Stud<span className="text-blue-600">City</span>
              </span>
              <span className="hidden sm:inline-flex bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                MVP Almaty
              </span>
            </div>
          </div>

          {/* Search Bar in Header (for Student View on Laptop) */}
          {role === 'student' && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск заведения, кофе, комбо-ланча..."
                  className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs text-slate-900 pl-10 pr-4 py-2 rounded-xl border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Center / Right: Main Role Switcher */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setRole('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  role === 'student'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Студент</span>
              </button>

              <button
                onClick={() => setRole('cashier')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  role === 'cashier'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Кассир / B2B</span>
                <span className="sm:hidden">Кассир</span>
              </button>
            </div>

            {/* Student Verified Mini-Badge */}
            {role === 'student' && (
              <div className="hidden xl:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium px-2.5 py-1.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>КазНУ ID</span>
              </div>
            )}

            {/* Desktop View Mode Toggle (Mobile frame / Full) */}
            {role === 'student' && (
              <button
                onClick={() => setViewMode(viewMode === 'responsive' ? 'mobile-frame' : 'responsive')}
                title={viewMode === 'responsive' ? 'Показать в рамке смартфона' : 'Полноэкранный вид (Laptop Grid)'}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
              >
                {viewMode === 'responsive' ? (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mobile Frame</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-blue-600" />
                    <span>Laptop Grid</span>
                  </>
                )}
              </button>
            )}

            {/* Reset Button */}
            <button
              onClick={resetDemoData}
              title="Сбросить демо-данные"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
