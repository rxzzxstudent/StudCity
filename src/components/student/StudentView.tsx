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
  GraduationCap,
  Wrench,
  Cake,
  Globe,
  ExternalLink,
  Instagram,
  Phone
} from 'lucide-react';
import { QrModal } from './QrModal';

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Все категории', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'service', label: 'Сервис и ПК', icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: 'dessert', label: 'Торты и десерты', icon: <Cake className="w-3.5 h-3.5" /> },
  { id: 'coffee', label: 'Кофе и напитки', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'food', label: 'Обеды / Еда', icon: <Utensils className="w-3.5 h-3.5" /> },
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
      case 'service':
        return <Wrench className="w-3.5 h-3.5 text-blue-600" />;
      case 'dessert':
        return <Cake className="w-3.5 h-3.5 text-pink-600" />;
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5 text-amber-600" />;
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-orange-600" />;
      case 'print':
        return <Printer className="w-3.5 h-3.5 text-indigo-600" />;
      case 'coworking':
        return <Laptop className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 transition-all duration-300">
      
      {/* 1. Hero & Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Счастливые часы StudCity
        </h1>
        
        <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-slate-600 leading-relaxed font-normal px-2">
          Динамические студенческие скидки до <strong className="text-blue-600 font-bold">-50%</strong> в непиковые часы в любимых кофейнях, донерных, копицентрах и коворкингах около вашего кампуса.
        </p>
      </div>

      {/* 2. Compact Search & Filter Controls Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 shadow-sm mb-6 sm:mb-8 space-y-3 sm:space-y-4">
        
        {/* Top Controls Row: Search Input + Cluster + Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3">
          
          {/* Search bar */}
          <div className="sm:col-span-2 md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск заведения, капучино, донера, печати..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 pl-10 pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 focus:border-blue-600 outline-hidden transition"
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
          <div className="sm:col-span-1 md:col-span-4 relative">
            <button
              onClick={() => {
                setClusterDropdownOpen(!clusterDropdownOpen);
                setSortDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition"
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
                    <span className="truncate">{cl}</span>
                    {selectedCluster === cl && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="sm:col-span-1 md:col-span-2 relative">
            <button
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen);
                setClusterDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition"
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
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-1 pb-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
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
        </div>

      </div>

      {/* 3. Cards Grid (3 columns on Laptop / Desktop like screenshot 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer: VenueOffer) => {
          const isDisabled = !offer.happyHoursActive;

          return (
            <div
              key={offer.id}
              className={`group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden ${
                isDisabled ? 'opacity-70 grayscale-[30%]' : ''
              }`}
            >
              {/* Card Cover Image Header with Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={offer.image}
                  alt={offer.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/partners/torte-studio.jpg';
                  }}
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
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {offer.description}
                  </p>
                  
                  {/* Address & Quick Links */}
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-700">{offer.address}</span>
                    </p>

                    {/* Interactive partner badges (website, yandex maps, instagram, phone) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {offer.website && (
                        <a
                          href={offer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200/80 transition"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span>{offer.website.replace('https://', '')}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      )}

                      {offer.mapUrl && (
                        <a
                          href={offer.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/80 transition"
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          <span>Яндекс Карты</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      )}

                      {offer.instagram && (
                        <a
                          href={offer.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-md border border-pink-200/80 transition"
                        >
                          <Instagram className="w-2.5 h-2.5" />
                          <span>{offer.instagram.replace('https://instagram.com/', '@')}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      )}

                      {offer.phone && (
                        <a
                          href={`tel:${offer.phone.replace(/[^0-9+]/g, '')}`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md border border-slate-200 transition"
                        >
                          <Phone className="w-2.5 h-2.5 text-slate-500" />
                          <span>{offer.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
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
