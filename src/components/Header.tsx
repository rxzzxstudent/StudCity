'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { GraduationCap, Store, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    role, 
    setRole, 
    studentTab,
    setStudentTab,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
              Stud<span className="text-blue-600">City</span>
            </span>
          </div>

          {/* Student Sub-navigation: Offers vs Map */}
          {role === 'student' && (
            <div className="flex items-center bg-slate-100/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setStudentTab('offers')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 ${
                  studentTab === 'offers'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <span>🔥</span>
                <span>Скидки</span>
              </button>

              <button
                onClick={() => setStudentTab('map')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 ${
                  studentTab === 'map'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <span>🗺️</span>
                <span>Карта города</span>
              </button>
            </div>
          )}

          {/* Center / Right: Main Role Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setRole('student')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
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
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
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
          </div>

        </div>
      </div>
    </header>
  );
};
