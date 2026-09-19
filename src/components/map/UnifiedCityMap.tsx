'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { MapSpot, MapSpotCategory, VenueOffer } from '@/types';
import { 
  Search, 
  MapPin, 
  Plus, 
  Crosshair, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  Check, 
  ChevronRight, 
  Navigation,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Maximize2,
  X,
  Coins,
  Wifi,
  Zap,
  ChevronDown,
  ListFilter,
  List
} from 'lucide-react';
import { AddSpotModal } from './AddSpotModal';

// Dynamically import LeafletMapInner with SSR disabled
const LeafletMapInner = dynamic(
  () => import('./LeafletMapInner').then((mod) => mod.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] sm:h-[680px] rounded-3xl bg-slate-100/80 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Layers className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs font-bold text-slate-600">Загрузка интерактивной карты...</p>
      </div>
    ),
  }
);

const CLUSTER_PRESETS = [
  { name: 'Кампус КазНУ', lat: 43.2245, lng: 76.9218, zoom: 15 },
  { name: 'Satbayev / Политех', lat: 43.2375, lng: 76.9268, zoom: 16 },
  { name: 'КБТУ / Панфилова', lat: 43.2530, lng: 76.9458, zoom: 15 },
  { name: 'Dostyk Plaza', lat: 43.2335, lng: 76.9568, zoom: 16 },
  { name: 'МЕГА Алматы', lat: 43.2030, lng: 76.8925, zoom: 15 },
];

export const UnifiedCityMap: React.FC = () => {
  const {
    mapSpots,
    addMapSpot,
    deleteMapSpot,
    activeMapFilters,
    toggleMapFilter,
    setAllMapFilters,
    selectedMapSpot,
    setSelectedMapSpot,
    offers,
    openQrModal,
    viewMode,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showListDrawer, setShowListDrawer] = useState(false);
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Add Spot Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addCoords, setAddCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Photo Lightbox modal
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string } | null>(null);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const campusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (campusDropdownRef.current && !campusDropdownRef.current.contains(e.target as Node)) {
        setCampusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return mapSpots.filter((spot) => {
      if (!activeMapFilters.includes(spot.category)) return false;
      if (onlyFree && !spot.isFree) return false;
      if (onlyWithPhoto && !spot.imageUrl) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = spot.title.toLowerCase().includes(q);
        const matchAddr = spot.address.toLowerCase().includes(q);
        const matchDesc = spot.description.toLowerCase().includes(q);
        const matchPrice = (spot.priceInfo || '').toLowerCase().includes(q);
        return matchTitle || matchAddr || matchDesc || matchPrice;
      }
      return true;
    });
  }, [mapSpots, activeMapFilters, onlyFree, onlyWithPhoto, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    return {
      toilet: mapSpots.filter((s) => s.category === 'toilet').length,
      wifi: mapSpots.filter((s) => s.category === 'wifi').length,
      outlet: mapSpots.filter((s) => s.category === 'outlet').length,
      deal: mapSpots.filter((s) => s.category === 'deal').length,
      print: mapSpots.filter((s) => s.category === 'print').length,
    };
  }, [mapSpots]);

  // Locate User
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setCenterCoords({ ...loc, zoom: 16 });
        showToast('Ваше местоположение определено 📍');
      },
      (err) => {
        setIsLocating(false);
        const fallback = { lat: 43.2389, lng: 76.9287 };
        setUserLocation(fallback);
        setCenterCoords({ ...fallback, zoom: 15 });
      },
      { timeout: 8000 }
    );
  };

  const handleMapClickAdd = (coords: { lat: number; lng: number }) => {
    setAddCoords(coords);
    setAddModalOpen(true);
    setIsAddMode(false);
  };

  const handleDeleteSpot = (id: string, title: string) => {
    if (confirm(`Удалить точку "${title}" с карты?`)) {
      deleteMapSpot(id);
      showToast('Точка удалена с карты');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 transition-all duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Compact Unified Control Bar (Lightweight & Uncluttered) */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200 shadow-xs mb-3 space-y-2">
        {/* Top Row: Search, Campus Jump, Quick Toggles & Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск мест, улиц, цен..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-hidden transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Actions & Toggles */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-between sm:justify-end">
            {/* Campus Dropdown */}
            <div className="relative shrink-0" ref={campusDropdownRef}>
              <button
                type="button"
                onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition"
              >
                <span>Кампусы</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {campusDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 animate-fade-in space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Быстрый переход:
                  </div>
                  {CLUSTER_PRESETS.map((cluster) => (
                    <button
                      key={cluster.name}
                      onClick={() => {
                        setCenterCoords({ lat: cluster.lat, lng: cluster.lng, zoom: cluster.zoom });
                        setCampusDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      {cluster.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Only Free pill */}
            <button
              onClick={() => setOnlyFree(!onlyFree)}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition shrink-0 ${
                onlyFree
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              Только 0 ₸
            </button>

            {/* List Drawer Toggle Button */}
            <button
              onClick={() => setShowListDrawer(!showListDrawer)}
              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition shrink-0 ${
                showListDrawer
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
              }`}
              title="Открыть список локаций"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Список</span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
                {filteredSpots.length}
              </span>
            </button>

            {/* Add Point Main Button */}
            <button
              onClick={() => {
                setAddCoords({ lat: 43.2389, lng: 76.9287 });
                setAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Minimalist Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          <button
            onClick={() => toggleMapFilter('toilet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 border ${
              activeMapFilters.includes('toilet')
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:text-slate-800'
            }`}
          >
            <span>🚽</span>
            <span>Туалеты</span>
            <span className="text-[10px] opacity-70 font-semibold">{counts.toilet}</span>
          </button>

          <button
            onClick={() => toggleMapFilter('wifi')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 border ${
              activeMapFilters.includes('wifi')
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:text-slate-800'
            }`}
          >
            <span>📶</span>
            <span>Wi-Fi</span>
            <span className="text-[10px] opacity-70 font-semibold">{counts.wifi}</span>
          </button>

          <button
            onClick={() => toggleMapFilter('outlet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 border ${
              activeMapFilters.includes('outlet')
                ? 'bg-purple-50 text-purple-700 border-purple-300'
                : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:text-slate-800'
            }`}
          >
            <span>⚡</span>
            <span>Розетки</span>
            <span className="text-[10px] opacity-70 font-semibold">{counts.outlet}</span>
          </button>

          <button
            onClick={() => toggleMapFilter('deal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 border ${
              activeMapFilters.includes('deal')
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:text-slate-800'
            }`}
          >
            <span>🔥</span>
            <span>Скидки</span>
            <span className="text-[10px] opacity-70 font-semibold">{counts.deal}</span>
          </button>

          <button
            onClick={() => toggleMapFilter('print')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 border ${
              activeMapFilters.includes('print')
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:text-slate-800'
            }`}
          >
            <span>🖨️</span>
            <span>Печать</span>
            <span className="text-[10px] opacity-70 font-semibold">{counts.print}</span>
          </button>

          {/* With photo pill */}
          <button
            onClick={() => setOnlyWithPhoto(!onlyWithPhoto)}
            className={`ml-auto flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition shrink-0 ${
              onlyWithPhoto
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-indigo-600" />
            <span>С фото</span>
          </button>
        </div>
      </div>

      {/* 2. Main Map Canvas (Full-Width, Unobstructed, Spacious) */}
      <div className="relative w-full h-[580px] sm:h-[680px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <LeafletMapInner
          spots={filteredSpots}
          selectedSpot={selectedMapSpot}
          onSelectSpot={(s) => setSelectedMapSpot(s)}
          onMapClickAdd={handleMapClickAdd}
          userLocation={userLocation}
          offers={offers}
          onOpenOfferQr={(off) => openQrModal(off)}
          centerCoords={centerCoords}
          isAddMode={isAddMode}
          onPhotoClick={(url, title) => setLightboxPhoto({ url, title })}
        />

        {/* Floating Add Mode Banner on top of map (minimalist pill) */}
        {isAddMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-white/20 flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Кликните в любое место на карте для установки точки</span>
            <button
              onClick={() => setIsAddMode(false)}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Floating Action Buttons on Map (Bottom-Right) */}
        <div className="absolute bottom-5 right-4 z-20 flex flex-col gap-2">
          {/* Add Pin by Click toggle button */}
          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg transition active:scale-95 border ${
              isAddMode
                ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
                : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-white'
            }`}
            title="Поставить точку кликом"
          >
            📍
          </button>

          {/* Locate Me FAB */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-white flex items-center justify-center shadow-lg transition active:scale-95"
            title="Определить мое местоположение"
          >
            <Crosshair className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 3. Floating Selected Spot Card (Non-intrusive, dismissible) */}
        {selectedMapSpot && (
          <div className="absolute bottom-4 left-3 right-3 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:max-w-sm w-auto z-30 bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-slate-200/80 animate-fade-in space-y-2.5 max-h-[85%] overflow-y-auto">
            {/* Card Header: Category, Price & Close */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {selectedMapSpot.category === 'toilet' && '🚽 Туалет'}
                {selectedMapSpot.category === 'wifi' && '📶 Бесплатный Wi-Fi'}
                {selectedMapSpot.category === 'outlet' && '⚡ Розетки'}
                {selectedMapSpot.category === 'deal' && '🔥 Скидка StudCity'}
                {selectedMapSpot.category === 'print' && '🖨️ Копицентр'}
              </span>

              <div className="flex items-center gap-1.5">
                {selectedMapSpot.isFree ? (
                  <span className="bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                    Бесплатно
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-900 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                    💰 {selectedMapSpot.priceInfo || `${selectedMapSpot.price} ₸`}
                  </span>
                )}
                <button
                  onClick={() => setSelectedMapSpot(null)}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                  title="Закрыть"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Photo Preview if exists */}
            {selectedMapSpot.imageUrl && (
              <div
                onClick={() =>
                  setLightboxPhoto({
                    url: selectedMapSpot.imageUrl!,
                    title: selectedMapSpot.title,
                  })
                }
                className="relative w-full h-28 rounded-2xl overflow-hidden cursor-pointer group shadow-2xs border border-slate-100"
              >
                <img
                  src={selectedMapSpot.imageUrl}
                  alt={selectedMapSpot.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white font-bold">
                  <span>📷 Посмотреть фото</span>
                  <Maximize2 className="w-3 h-3" />
                </div>
              </div>
            )}

            {/* Title & Address */}
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                {selectedMapSpot.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
                <MapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{selectedMapSpot.address}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
              {selectedMapSpot.description}
            </p>

            {/* Specifics: Wi-Fi, Outlets, Toilet amenities */}
            {selectedMapSpot.wifiSpeed && (
              <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold flex items-center justify-between">
                <span>Скорость сети:</span>
                <span className="font-bold font-mono">{selectedMapSpot.wifiSpeed}</span>
              </div>
            )}

            {selectedMapSpot.outletCount && (
              <div className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 font-semibold flex items-center justify-between">
                <span>Количество розеток:</span>
                <span className="font-bold">{selectedMapSpot.outletCount}</span>
              </div>
            )}

            {selectedMapSpot.amenities && selectedMapSpot.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedMapSpot.amenities.map((am) => (
                  <span
                    key={am}
                    className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-100"
                  >
                    ✓ {am}
                  </span>
                ))}
              </div>
            )}

            {/* Route buttons */}
            <div className="pt-1 grid grid-cols-3 gap-1.5">
              <a
                href={`https://2gis.kz/almaty/search/${encodeURIComponent(
                  selectedMapSpot.title + ' ' + selectedMapSpot.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>2GIS</span>
              </a>
              <a
                href={`https://yandex.kz/maps/?rtext=~${selectedMapSpot.lat}%2C${selectedMapSpot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center bg-amber-50 hover:bg-amber-100 text-amber-800 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>Яндекс</span>
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMapSpot.lat},${selectedMapSpot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>Google</span>
              </a>
            </div>

            {/* Offer button if applicable */}
            {selectedMapSpot.offerId && (
              <button
                onClick={() => {
                  const match = offers.find((o) => o.id === selectedMapSpot.offerId);
                  if (match) openQrModal(match);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <span>🔥</span>
                <span>Получить QR со скидкой</span>
              </button>
            )}

            {/* Delete button for user-added spots */}
            {selectedMapSpot.isUserAdded && (
              <button
                onClick={() => handleDeleteSpot(selectedMapSpot.id, selectedMapSpot.title)}
                className="w-full py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить мою точку</span>
              </button>
            )}
          </div>
        )}

        {/* 4. Slide-over Drawer for Spots List (Clean & Lightweight) */}
        {showListDrawer && (
          <div className="absolute inset-y-0 right-0 w-full sm:w-80 bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200 z-30 flex flex-col animate-fade-in">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Локации ({filteredSpots.length})
              </h4>
              <button
                onClick={() => setShowListDrawer(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => {
                    setSelectedMapSpot(spot);
                    setCenterCoords({ lat: spot.lat, lng: spot.lng, zoom: 16 });
                    if (window.innerWidth < 640) setShowListDrawer(false);
                  }}
                  className="w-full text-left p-2 rounded-xl transition border border-slate-100 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base shrink-0">
                      {spot.category === 'toilet' && '🚽'}
                      {spot.category === 'wifi' && '📶'}
                      {spot.category === 'outlet' && '⚡'}
                      {spot.category === 'deal' && '🔥'}
                      {spot.category === 'print' && '🖨️'}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 truncate">{spot.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{spot.address}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold shrink-0 text-slate-700 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                    {spot.isFree ? '0 ₸' : spot.price ? `${spot.price} ₸` : 'Платно'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Spot Modal */}
      <AddSpotModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        initialCoords={addCoords}
        onAddSpot={(newSpot) => {
          addMapSpot(newSpot);
          setCenterCoords({ lat: newSpot.lat, lng: newSpot.lng, zoom: 16 });
          showToast(`Точка "${newSpot.title}" добавлена на карту!`);
        }}
      />

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div 
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setLightboxPhoto(null)}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.title}
              className="w-full max-h-[75vh] object-contain"
            />
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs">{lightboxPhoto.title}</span>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
