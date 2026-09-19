'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { StudentView } from '@/components/student/StudentView';
import { CashierView } from '@/components/cashier/CashierView';
import { Sparkles, Heart } from 'lucide-react';

function AppContent() {
  const { role } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
        {role === 'student' ? <StudentView /> : <CashierView />}
      </main>

      <footer className="py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>StudCity MVP • Хакатон</span>
          </div>
          <p className="text-slate-400">
            Студенческий Yield Management & Счастливые часы для Алматы
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Сделано с</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>для студентов</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
