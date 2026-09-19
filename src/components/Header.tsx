'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { GraduationCap, Store, Sparkles } from 'lucide-react';
import { StudCityLogo } from './StudCityLogo';

export const Header: React.FC = () => {
  const { 
    role, 
    setRole, 
    studentTab,
    setStudentTab,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => {
              setRole('student');
              setStudentTab('offers');
            }}
            title="StudCity — Главная"
            className="flex items-center gap-2 shrink-0 group text-left focus:outline-hidden"
          >
            <StudCityLogo size="sm" layout="auto" animated={true} />
          </button>

          {/* Student Sub-navigation: Offers vs Map */}
          {role === 'student' && (
            <div className="flex items-center bg-slate-100/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 shrink-0">
              <button
                onClick={() => setStudentTab('offers')}
                title="Скидки и акции"
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 ${
                  studentTab === 'offers'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <span>🔥</span>
                <span className="hidden xs:inline">Скидки</span>
              </button>

              <button
                onClick={() => setStudentTab('map')}
                title="Карта города"
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all duration-200 ${
                  studentTab === 'map'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <span>🗺️</span>
                <span className="hidden xs:inline">Карта</span>
                <span className="hidden md:inline">города</span>
              </button>
            </div>
          )}

          {/* Center / Right: Main Role Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setRole('student')}
                title="Режим студента"
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  role === 'student'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Студент</span>
              </button>

              <button
                onClick={() => setRole('cashier')}
                title="Панель кассира"
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  role === 'cashier'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Кассир / B2B</span>
                <span className="hidden sm:inline md:hidden">Кассир</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
