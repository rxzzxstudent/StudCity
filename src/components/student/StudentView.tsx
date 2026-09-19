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
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  GraduationCap
} from 'lucide-react';
import { QrModal } from './QrModal';

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Все категории', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'coffee', label: 'Кофе и десерты', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'food', label: 'Обеды / Донеры', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'print', label: 'Копицентры', icon: <Printer className="w-3.5 h-3.5" /> },
  { id: 'coworking', label: 'Коворкинги', icon: <Laptop className="w-3.5 h-3.5" /> },
];

const CLUSTERS = [
  'Все кластеры Алматы',
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
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    offers,
    openQrModal,
    viewMode,
    setStudentTab,
  } = useApp();

  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Format seconds to hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filter & Search & Sort Logic
  const filteredOffers = offers
    .filter((offer) => {
      // Category filter
      if (selectedCategory !== 'all' && offer.category !== selectedCategory) {
        return false;
      }
      // Cluster filter
      if (selectedCluster !== 'Все кластеры Алматы' && offer.cluster !== selectedCluster) {
        // keep URBO and match if needed
      }
      // Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = offer.name.toLowerCase().includes(query);
        const matchesTitle = offer.title.toLowerCase().includes(query);
        const matchesDesc = offer.description.toLowerCase().includes(query);
        const matchesCategory = offer.categoryLabel.toLowerCase().includes(query);
        const matchesAddress = offer.address.toLowerCase().includes(query);
        return matchesName || matchesTitle || matchesDesc || matchesCategory || matchesAddress;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'expiring') return a.remainingSeconds - b.remainingSeconds;
      if (sortBy === 'distance') {
        const distA = parseInt(a.distance) || 999;
        const distB = parseInt(b.distance) || 999;
        return distA - distB;
      }
      return 0; // default order
    });

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5 text-amber-600" />;
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-orange-600" />;
      case 'print':
        return <Printer className="w-3.5 h-3.5 text-indigo-600" />;
      case 'coworking':
        return <Laptop className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <div className={`mx-auto transition-all duration-300 ${
      viewMode === 'mobile-frame' 
        ? 'max-w-md my-6 p-4 bg-slate-900/5 rounded-[44px] border-8 border-slate-800 shadow-2xl' 
        : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8'
    }`}>
      
      {/* 1. Hero & Header Banner (Lablab-style modern intro) */}
      <div className="text-center max-w-3xl mx-auto mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-700 mb-3 shadow-2xs">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span>Студент: КазНУ им. аль-Фараби</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-700 font-semibold">Подтвержден</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Счастливые часы StudCity
        </h1>
        
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Динамические студенческие скидки до <strong className="text-blue-600 font-bold">-50%</strong> в непиковые часы в любимых кофейнях, донерных, копицентрах и коворкингах около вашего кампуса.
        </p>
      </div>

      {/* 1.5 Quick City Amenities Map Callout */}
      <div 
        onClick={() => setStudentTab('map')}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-4 sm:p-5 text-white shadow-md mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition group border border-blue-400/30"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shrink-0">
            🚽
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base">Интерактивная карта Алматы</span>
              <span className="bg-white/20 text-[10px] font-extrabold px-2 py-0.5 rounded-full">OpenStreetMap</span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Общественные туалеты, открытый Wi-Fi, розетки для учебы и партнерские точки со скидками
            </p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setStudentTab('map'); }}
          className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>Открыть карту удобств</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* 2. Compact Search & Filter Controls Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm mb-8 space-y-4">
        
        {/* Top Controls Row: Search Input + Cluster + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск заведения, капучино, донера, печати..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:border-blue-600 outline-hidden transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cluster Dropdown */}
          <div className="md:col-span-4 relative">
            <button
              onClick={() => {
                setClusterDropdownOpen(!clusterDropdownOpen);
                setSortDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{selectedCluster}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${clusterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

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

          {/* Sorting Dropdown */}
          <div className="md:col-span-2 relative">
            <button
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen);
                setClusterDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition"
            >
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">
                  {sortBy === 'popular' && 'Популярные'}
                  {sortBy === 'discount' && 'Скидка %'}
                  {sortBy === 'expiring' && 'Таймер'}
                  {sortBy === 'distance' && 'Близко'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute top-full right-0 w-44 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                <button
                  onClick={() => { setSortBy('popular'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${sortBy === 'popular' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>По популярности</span>
                </button>
                <button
                  onClick={() => { setSortBy('discount'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${sortBy === 'discount' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>Макс. скидка %</span>
                </button>
                <button
                  onClick={() => { setSortBy('expiring'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${sortBy === 'expiring' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>Скоро закончатся</span>
                </button>
                <button
                  onClick={() => { setSortBy('distance'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${sortBy === 'distance' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>Ближайшие к кампусу</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Category Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setStudentTab('map')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition shrink-0 ml-auto"
          >
            <span>🚽</span>
            <span>Карта туалетов & удобств (OSM) ↗</span>
          </button>
        </div>

      </div>

      {/* 3. Cards Grid (3 columns on Laptop / Desktop like screenshot 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer: VenueOffer) => {
          const isUrboDisabled = offer.id === 'urbo-coffee' && !offer.happyHoursActive;

          return (
            <div
              key={offer.id}
              className={`group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden ${
                isUrboDisabled ? 'opacity-70 grayscale-[30%]' : ''
              }`}
            >
              {/* Card Cover Image Header with Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  
                  {/* Left status badge */}
                  {offer.happyHoursActive ? (
                    <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/30 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>LIVE Акция</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-slate-300 px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-700">
                      <span>⏸ На паузе</span>
                    </div>
                  )}

                  {/* Right distance badge */}
                  <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/10 shadow-xs">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span>{offer.distance}</span>
                  </div>
                </div>

                {/* Bottom Left Discount Chip */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm px-3 py-1 rounded-xl shadow-md flex items-center gap-1 border border-white/20">
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>-{offer.discountPercent}%</span>
                  </div>
                  <span className="text-[11px] text-white/90 font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                    {offer.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                <div>
                  {/* Category & Live Timer Row */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      {getCategoryIcon(offer.category)}
                      <span className="text-slate-900">{offer.name}</span>
                    </div>

                    {offer.happyHoursActive ? (
                      <div className="flex items-center gap-1 text-amber-600 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{formatTime(offer.remainingSeconds)}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Спад окончен</span>
                    )}
                  </div>

                  {/* Main Offer Title */}
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-blue-600 transition">
                    {offer.title}
                  </h3>

                  {/* Description Snippet */}
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {offer.description}
                  </p>
                  
                  {/* Address */}
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{offer.address}</span>
                  </p>
                </div>

                {/* Bottom Pricing & CTA Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through block leading-tight">
                      {offer.originalPrice.toLocaleString()} ₸
                    </span>
                    <span className="text-lg font-black text-blue-600 leading-none">
                      {offer.discountedPrice.toLocaleString()} ₸
                    </span>
                  </div>

                  <button
                    disabled={!offer.happyHoursActive}
                    onClick={() => openQrModal(offer)}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                      offer.happyHoursActive
                        ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-500/25'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{offer.happyHoursActive ? 'Получить QR' : 'Недоступно'}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State if no search matches */}
      {filteredOffers.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-8">
          <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Предложений не найдено</h4>
          <p className="text-xs text-slate-500 mt-1">Попробуйте изменить категорию или поисковый запрос</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* QR Modal Pop-up */}
      <QrModal />

    </div>
  );
};
