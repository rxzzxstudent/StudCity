'use client';

import React, { useState, useMemo } from 'react';
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
  Info, 
  Check, 
  ChevronRight, 
  Navigation,
  Image as ImageIcon,
  Trash2,
  Filter,
  CheckCircle2,
  Maximize2,
  X,
  Coins,
  Wifi,
  Zap,
  Tag
} from 'lucide-react';
import { AddSpotModal } from './AddSpotModal';

// Dynamically import LeafletMapInner with SSR disabled
const LeafletMapInner = dynamic(
  () => import('./LeafletMapInner').then((mod) => mod.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] sm:h-[650px] rounded-3xl bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
          <Layers className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-600">Загрузка интерактивной карты OpenStreetMap...</p>
        <p className="text-xs text-slate-400">Алматы: Туалеты, Wi-Fi, Розетки, Скидки</p>
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
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(false);
  const [onlyMySpots, setOnlyMySpots] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return mapSpots.filter((spot) => {
      // Category filter
      if (!activeMapFilters.includes(spot.category)) {
        return false;
      }
      // Price filter
      if (priceFilter === 'free' && !spot.isFree) {
        return false;
      }
      if (priceFilter === 'paid' && spot.isFree) {
        return false;
      }
      // Photo filter
      if (onlyWithPhoto && !spot.imageUrl) {
        return false;
      }
      // My spots filter
      if (onlyMySpots && !spot.isUserAdded) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = spot.title.toLowerCase().includes(q);
        const matchAddr = spot.address.toLowerCase().includes(q);
        const matchDesc = spot.description.toLowerCase().includes(q);
        const matchPrice = (spot.priceInfo || '').toLowerCase().includes(q);
        const matchTags = (spot.tags || []).some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchAddr || matchDesc || matchPrice || matchTags;
      }
      return true;
    });
  }, [mapSpots, activeMapFilters, priceFilter, onlyWithPhoto, onlyMySpots, searchQuery]);

  // Counts for badge indicators
  const counts = useMemo(() => {
    return {
      toilet: mapSpots.filter((s) => s.category === 'toilet').length,
      wifi: mapSpots.filter((s) => s.category === 'wifi').length,
      outlet: mapSpots.filter((s) => s.category === 'outlet').length,
      deal: mapSpots.filter((s) => s.category === 'deal').length,
      print: mapSpots.filter((s) => s.category === 'print').length,
      mySpots: mapSpots.filter((s) => s.isUserAdded).length,
      withPhoto: mapSpots.filter((s) => Boolean(s.imageUrl)).length,
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
        console.warn('Geolocation error:', err.message);
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
    <div
      className={`mx-auto transition-all duration-300 ${
        viewMode === 'mobile-frame'
          ? 'max-w-md my-6 p-4 bg-slate-900/5 rounded-[44px] border-8 border-slate-800 shadow-2xl'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>OpenStreetMap Алматы • Студенческая сеть удобств</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Карта удобств, туалетов и розеток
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Единая городская карта для студентов: общественные туалеты, открытый Wi-Fi, розетки для учебы, скидки, реальные фото и точные цены.
          </p>
        </div>

        {/* Action Buttons: Add spot + Add mode toggle + Locate me */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-xs"
            title="Определить мое местоположение"
          >
            <Crosshair className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Поиск...' : 'Где я'}</span>
          </button>

          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs border ${
              isAddMode
                ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Включить установку метки кликом на карте"
          >
            <span>📍</span>
            <span>{isAddMode ? 'Кликните на карту...' : 'Поставить точку кликом'}</span>
          </button>

          <button
            onClick={() => {
              setAddCoords({ lat: 43.2389, lng: 76.9287 });
              setAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white active:scale-95 transition shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить точку</span>
          </button>
        </div>
      </div>

      {/* Add Mode active banner */}
      {isAddMode && (
        <div className="bg-amber-500 text-white px-4 py-3 rounded-2xl mb-4 text-xs font-bold flex items-center justify-between shadow-lg shadow-amber-500/20 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span>
              Режим добавления активен! Нажмите в любое место на карте OpenStreetMap, чтобы поставить метку (туалет, Wi-Fi, розетки).
            </span>
          </div>
          <button
            onClick={() => setIsAddMode(false)}
            className="text-white hover:text-amber-100 underline text-xs ml-3 shrink-0"
          >
            Отменить
          </button>
        </div>
      )}

      {/* 2. Interactive Filter Chips Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm mb-5 space-y-3.5">
        {/* Main Category Toggles (Toilet, Wi-Fi, Outlet, Deal, Print) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Toilet Filter Button */}
          <button
            onClick={() => toggleMapFilter('toilet')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
              activeMapFilters.includes('toilet')
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-[1.02]'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">🚽</span>
            <span>Туалеты</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeMapFilters.includes('toilet')
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.toilet}
            </span>
          </button>

          {/* Wi-Fi Filter Button */}
          <button
            onClick={() => toggleMapFilter('wifi')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
              activeMapFilters.includes('wifi')
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm scale-[1.02]'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">📶</span>
            <span>Бесплатный Wi-Fi</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeMapFilters.includes('wifi')
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.wifi}
            </span>
          </button>

          {/* Outlets Filter Button */}
          <button
            onClick={() => toggleMapFilter('outlet')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
              activeMapFilters.includes('outlet')
                ? 'bg-purple-600 border-purple-600 text-white shadow-sm scale-[1.02]'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">⚡</span>
            <span>Розетки / Учеба</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeMapFilters.includes('outlet')
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.outlet}
            </span>
          </button>

          {/* StudCity Deals Filter Button */}
          <button
            onClick={() => toggleMapFilter('deal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
              activeMapFilters.includes('deal')
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 border-amber-500 text-white shadow-sm scale-[1.02]'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">🔥</span>
            <span>Скидки StudCity</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeMapFilters.includes('deal')
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.deal}
            </span>
          </button>

          {/* Print Filter Button */}
          <button
            onClick={() => toggleMapFilter('print')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
              activeMapFilters.includes('print')
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm scale-[1.02]'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">🖨️</span>
            <span>Копицентры</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeMapFilters.includes('print')
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.print}
            </span>
          </button>

          {/* Reset / All Button */}
          <button
            onClick={() => {
              if (activeMapFilters.length === 5) {
                setAllMapFilters(['toilet', 'wifi', 'outlet']);
              } else {
                setAllMapFilters(['toilet', 'wifi', 'outlet', 'deal', 'print']);
              }
            }}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 px-2 py-1 transition shrink-0 ml-auto"
          >
            {activeMapFilters.length === 5 ? 'Только базовые удобства' : 'Выбрать все'}
          </button>
        </div>

        {/* Price & Photo Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Price Filters: All / Free / Paid */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>Цена:</span>
            </span>
            <button
              onClick={() => setPriceFilter('all')}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                priceFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Все цены
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                priceFilter === 'free'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Бесплатно (0 ₸)
            </button>
            <button
              onClick={() => setPriceFilter('paid')}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                priceFilter === 'paid'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Платно
            </button>
          </div>

          {/* Photo toggle & My spots toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyWithPhoto(!onlyWithPhoto)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                onlyWithPhoto
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Только с фото ({counts.withPhoto})</span>
            </button>

            {counts.mySpots > 0 && (
              <button
                onClick={() => setOnlyMySpots(!onlyMySpots)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                  onlyMySpots
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <span>Мои точки ({counts.mySpots})</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Fast Campus Jump Presets */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по карте (название, улица, ТРЦ, цена)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition"
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

          {/* Quick presets for campus navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Быстро:</span>
            {CLUSTER_PRESETS.map((cluster) => (
              <button
                key={cluster.name}
                onClick={() => setCenterCoords({ lat: cluster.lat, lng: cluster.lng, zoom: cluster.zoom })}
                className="text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-xl transition shrink-0 border border-transparent hover:border-blue-200"
              >
                {cluster.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. OpenStreetMap Map View + Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Map Container (col-span-8) */}
        <div className="lg:col-span-8 relative">
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

          {/* Tip overlay on map bottom */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 pointer-events-none z-20 border border-white/10">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Кликните на любое место на карте, чтобы добавить точку или посмотреть детали и фото
            </span>
          </div>
        </div>

        {/* Right Sidebar: Selected Spot Details + Visible Spots list */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Selected Spot Details Card */}
          {selectedMapSpot ? (
            <div className="bg-white rounded-3xl p-5 border-2 border-blue-500 shadow-xl animate-fade-in space-y-3.5">
              {/* Photo Banner if available */}
              {selectedMapSpot.imageUrl && (
                <div
                  onClick={() =>
                    setLightboxPhoto({
                      url: selectedMapSpot.imageUrl!,
                      title: selectedMapSpot.title,
                    })
                  }
                  className="relative w-full h-44 rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200/80"
                >
                  <img
                    src={selectedMapSpot.imageUrl}
                    alt={selectedMapSpot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-xl opacity-90 group-hover:opacity-100 transition">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Фото объекта</span>
                    </span>
                    <span className="text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md">
                      Нажмите для полного размера
                    </span>
                  </div>
                </div>
              )}

              {/* Category & Price Headers */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedMapSpot.category === 'toilet' && '🚽 Туалет'}
                  {selectedMapSpot.category === 'wifi' && '📶 Бесплатный Wi-Fi'}
                  {selectedMapSpot.category === 'outlet' && '⚡ Розетки / Учеба'}
                  {selectedMapSpot.category === 'deal' && '🔥 Скидка StudCity'}
                  {selectedMapSpot.category === 'print' && '🖨️ Копицентр'}
                </span>

                {/* Prominent Price Badge */}
                {selectedMapSpot.isFree ? (
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300">
                    Бесплатно
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-950 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-700" />
                    <span>
                      {selectedMapSpot.priceInfo ||
                        (selectedMapSpot.price ? `${selectedMapSpot.price} ₸` : 'Платно')}
                    </span>
                  </span>
                )}
              </div>

              {/* Title & Address */}
              <div>
                <h3 className="font-black text-lg text-slate-900 leading-snug">
                  {selectedMapSpot.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{selectedMapSpot.address}</span>
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                {selectedMapSpot.description}
              </p>

              {/* Amenities for Toilets */}
              {selectedMapSpot.amenities && selectedMapSpot.amenities.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">Удобства:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedMapSpot.amenities.map((am) => (
                      <span
                        key={am}
                        className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-100"
                      >
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Wi-Fi Details */}
              {selectedMapSpot.wifiSpeed && (
                <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" /> Скорость сети:
                  </span>
                  <span className="font-bold font-mono">{selectedMapSpot.wifiSpeed}</span>
                </div>
              )}

              {selectedMapSpot.wifiPassword && (
                <div className="text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Пароль / Доступ:</span>
                  <span className="font-bold font-mono text-emerald-700">
                    {selectedMapSpot.wifiPassword}
                  </span>
                </div>
              )}

              {/* Outlet Details */}
              {selectedMapSpot.outletCount && (
                <div className="text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-xl border border-purple-200 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Розетки:
                  </span>
                  <span className="font-bold">{selectedMapSpot.outletCount}</span>
                </div>
              )}

              {/* Payment Methods */}
              {selectedMapSpot.paymentMethods && selectedMapSpot.paymentMethods.length > 0 && !selectedMapSpot.isFree && (
                <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-bold">Оплата:</span>
                  <span>{selectedMapSpot.paymentMethods.join(', ')}</span>
                </div>
              )}

              {/* Route Buttons */}
              <div className="pt-2 grid grid-cols-3 gap-2">
                <a
                  href={`https://2gis.kz/almaty/search/${encodeURIComponent(
                    selectedMapSpot.title + ' ' + selectedMapSpot.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-2 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2GIS</span>
                </a>
                <a
                  href={`https://yandex.kz/maps/?rtext=~${selectedMapSpot.lat}%2C${selectedMapSpot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 py-2 px-2 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1"
                >
                  <span>Яндекс</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMapSpot.lat},${selectedMapSpot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-2 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google</span>
                </a>
              </div>

              {/* Offer button if mapped to a StudCity deal */}
              {selectedMapSpot.offerId && (
                <button
                  onClick={() => {
                    const match = offers.find((o) => o.id === selectedMapSpot.offerId);
                    if (match) openQrModal(match);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>🔥</span>
                  <span>Получить студенческий QR со скидкой</span>
                </button>
              )}

              {/* Delete user-added spot */}
              {selectedMapSpot.isUserAdded && (
                <button
                  onClick={() => handleDeleteSpot(selectedMapSpot.id, selectedMapSpot.title)}
                  className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center gap-1.5 border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить мою добавленную точку</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md">
              <div className="flex items-center gap-2 text-white/90 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Найдено на карте</span>
              </div>
              <h4 className="text-2xl font-black">{filteredSpots.length} локаций</h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                Нажмите на любой маркер на карте, чтобы посмотреть фотографии, цены, скорость сети, розетки и проложить маршрут.
              </p>
            </div>
          )}

          {/* Quick List of Nearby Spots */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm flex-1 flex flex-col max-h-[460px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Локации в списке ({filteredSpots.length})
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold">
                Сортировка по типу
              </span>
            </div>

            <div className="overflow-y-auto space-y-2 pt-3 pr-1">
              {filteredSpots.map((spot) => {
                const isSelected = selectedMapSpot?.id === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => {
                      setSelectedMapSpot(spot);
                      setCenterCoords({ lat: spot.lat, lng: spot.lng, zoom: 16 });
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition border flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/70 text-slate-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200/80">
                      {spot.imageUrl ? (
                        <img
                          src={spot.imageUrl}
                          alt={spot.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg bg-blue-100">
                          {spot.category === 'toilet' && '🚽'}
                          {spot.category === 'wifi' && '📶'}
                          {spot.category === 'outlet' && '⚡'}
                          {spot.category === 'deal' && '🔥'}
                          {spot.category === 'print' && '🖨️'}
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center font-bold leading-tight">
                        {spot.category === 'toilet' && 'WC'}
                        {spot.category === 'wifi' && 'WiFi'}
                        {spot.category === 'outlet' && '220V'}
                        {spot.category === 'deal' && 'Deal'}
                        {spot.category === 'print' && 'Print'}
                      </div>
                    </div>

                    {/* Spot info */}
                    <div className="space-y-0.5 truncate flex-1">
                      <h5 className="font-extrabold text-xs text-slate-900 truncate">
                        {spot.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 truncate">{spot.address}</p>
                    </div>

                    {/* Price and chevron */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {spot.isFree ? (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          0 ₸
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {spot.price ? `${spot.price} ₸` : spot.priceInfo || 'Платно'}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Spot Modal */}
      <AddSpotModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        initialCoords={addCoords}
        onAddSpot={(newSpot) => {
          addMapSpot(newSpot);
          setCenterCoords({ lat: newSpot.lat, lng: newSpot.lng, zoom: 16 });
          showToast(`Точка "${newSpot.title}" успешно добавлена на карту!`);
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
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setLightboxPhoto(null)}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.title}
              className="w-full max-h-[80vh] object-contain"
            />
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm">{lightboxPhoto.title}</span>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
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
