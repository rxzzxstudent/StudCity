'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Category, VenueOffer } from '@/types';
import { 
  MapPin, 
  Clock, 
  ChevronDown, 
  CheckCircle2, 
  QrCode, 
  Coffee, 
  Utensils, 
  Printer, 
  Laptop, 
  Sparkles, 
  Layers, 
  Flame,
  AlertCircle
} from 'lucide-react';
import { QrModal } from './QrModal';

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Все', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'coffee', label: 'Кофе и десерты', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'food', label: 'Обеды / Донеры', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'print', label: 'Копицентры', icon: <Printer className="w-3.5 h-3.5" /> },
  { id: 'coworking', label: 'Коворкинги', icon: <Laptop className="w-3.5 h-3.5" /> },
];

const CLUSTERS = [
  'Кластер Сатпаева — Байтурсынова',
  'Кампус КазНУ (ГУК)',
  'Кластер Толе би — Абылай хана (КБТУ/КазНАУ)',
  'Кампус Satbayev University (Polytech)',
];

export const StudentView: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedCluster,
    setSelectedCluster,
    offers,
    openQrModal,
    viewMode,
  } = useApp();

  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false);

  // Format seconds to hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const filteredOffers = offers.filter((offer) => {
    if (selectedCategory === 'all') return true;
    return offer.category === selectedCategory;
  });

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'coffee':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-orange-600" />;
      case 'print':
        return <Printer className="w-4 h-4 text-indigo-600" />;
      case 'coworking':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className={`mx-auto transition-all duration-300 ${viewMode === 'mobile-frame' ? 'max-w-md my-4 p-4 bg-slate-900/5 rounded-[40px] border-8 border-slate-800 shadow-2xl' : 'max-w-4xl px-4 py-6'}`}>
      
      {/* 1. Student Verified Header & Campus Selector */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-5">
        
        {/* Top bar with Student Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
              АС
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">Алихан Сейткали</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Подтвержден
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Студент: КазНУ им. аль-Фараби</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-xl font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Непиковые скидки до -50%</span>
          </div>
        </div>

        {/* Cluster / Campus Selector */}
        <div className="relative">
          <div className="text-[11px] text-slate-500 font-medium mb-1">Текущая локация студента:</div>
          <button
            onClick={() => setClusterDropdownOpen(!clusterDropdownOpen)}
            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{selectedCluster}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${clusterDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Cluster Dropdown List */}
          {clusterDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
              {CLUSTERS.map((cl) => (
                <button
                  key={cl}
                  onClick={() => {
                    setSelectedCluster(cl);
                    setClusterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition ${
                    selectedCluster === cl ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cl}</span>
                  {selectedCluster === cl && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 2. Category Filter Pills */}
      <div className="mb-5 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Offers Feed */}
      <div className="space-y-4">
        {filteredOffers.map((offer: VenueOffer) => {
          const isUrboDisabled = offer.id === 'urbo-coffee' && !offer.happyHoursActive;

          return (
            <div
              key={offer.id}
              className={`bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 ${
                isUrboDisabled ? 'opacity-75 bg-slate-50/50' : ''
              }`}
            >
              <div className="p-4 sm:p-5">
                
                {/* Top Row: Venue Name, Category Chip & Discount Badge */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {getCategoryIcon(offer.category)}
                        {offer.categoryLabel}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {offer.distance}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                      {offer.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal">{offer.address}</p>
                  </div>

                  {/* Discount Badge */}
                  <div className={`px-3 py-1.5 rounded-2xl font-black text-sm sm:text-base flex items-center gap-1 shadow-xs ${
                    offer.happyHoursActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    <span>-{offer.discountPercent}%</span>
                  </div>
                </div>

                {/* Offer Title & Details */}
                <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 my-3">
                  <h4 className="font-bold text-sm sm:text-base text-slate-800 leading-snug">
                    {offer.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                {/* Happy Hours Status / Live Timer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  
                  {/* Left: Timer or Inactive Notice */}
                  {offer.happyHoursActive ? (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200/60 px-3 py-1.5 rounded-xl text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>Счастливые часы до {offer.happyHoursEnd}</span>
                      <span className="font-mono bg-amber-200/60 px-1.5 py-0.5 rounded text-[11px] text-amber-950 font-bold">
                        {formatTime(offer.remainingSeconds)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl text-xs font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Счастливые часы временно приостановлены</span>
                    </div>
                  )}

                  {/* Right: Prices */}
                  <div className="flex items-baseline gap-2 text-right">
                    <span className="text-xs text-slate-400 line-through">
                      {offer.originalPrice.toLocaleString()} ₸
                    </span>
                    <span className="text-lg sm:text-xl font-black text-blue-600">
                      {offer.discountedPrice.toLocaleString()} ₸
                    </span>
                  </div>

                </div>

                {/* CTA Button: Open QR */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    disabled={!offer.happyHoursActive}
                    onClick={() => openQrModal(offer)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
                      offer.happyHoursActive
                        ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{offer.happyHoursActive ? 'Получить скидку (QR-код)' : 'Скидка недоступна'}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* QR Modal Pop-up */}
      <QrModal />

    </div>
  );
};
