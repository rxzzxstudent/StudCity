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
  Navigation
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Add Spot Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addCoords, setAddCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return mapSpots.filter((spot) => {
      // Category filter
      if (!activeMapFilters.includes(spot.category)) {
        return false;
      }
      // Only free filter
      if (onlyFree && !spot.isFree) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = spot.title.toLowerCase().includes(q);
        const matchAddr = spot.address.toLowerCase().includes(q);
        const matchDesc = spot.description.toLowerCase().includes(q);
        const matchTags = (spot.tags || []).some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchAddr || matchDesc || matchTags;
      }
      return true;
    });
  }, [mapSpots, activeMapFilters, onlyFree, searchQuery]);

  // Counts for badge indicators
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
      },
      (err) => {
        setIsLocating(false);
        // Fallback default position: Satbayev / Baitursynov cluster
        const fallback = { lat: 43.2389, lng: 76.9287 };
        setUserLocation(fallback);
        setCenterCoords({ ...fallback, zoom: 15 });
        console.warn('Geolocation error or permission denied:', err.message);
      },
      { timeout: 8000 }
    );
  };

  const handleMapClickAdd = (coords: { lat: number; lng: number }) => {
    setAddCoords(coords);
    setAddModalOpen(true);
  };

  return (
    <div
      className={`mx-auto transition-all duration-300 ${
        viewMode === 'mobile-frame'
          ? 'max-w-md my-6 p-4 bg-slate-900/5 rounded-[44px] border-8 border-slate-800 shadow-2xl'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6'
      }`}
    >
      {/* 1. Header & Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>OpenStreetMap Алматы • Студенческая сеть</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Карта удобств и туалетов Алматы
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Единая городская карта для студентов: общественные туалеты, открытый Wi-Fi, розетки для учебы и заведения со скидками StudCity.
          </p>
        </div>

        {/* Action Buttons: Add spot + Locate me */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-xs"
            title="Определить мое местоположение"
          >
            <Crosshair className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Поиск...' : 'Где я'}</span>
          </button>

          <button
            onClick={() => {
              setAddCoords({ lat: 43.2389, lng: 76.9287 });
              setAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить точку</span>
          </button>
        </div>
      </div>

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
                  ? 'bg-white/20 text-white'
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
                  ? 'bg-white/20 text-white'
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
                  ? 'bg-white/20 text-white'
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
                  ? 'bg-white/20 text-white'
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
                  ? 'bg-white/20 text-white'
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
                setAllMapFilters(['toilet']);
              } else {
                setAllMapFilters(['toilet', 'wifi', 'outlet', 'deal', 'print']);
              }
            }}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 px-2 py-1 transition shrink-0 ml-auto"
          >
            {activeMapFilters.length === 5 ? 'Только туалеты' : 'Все фильтры'}
          </button>
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
              placeholder="Поиск по карте (название, улица, ТРЦ)..."
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

            {/* Free only toggle */}
            <button
              onClick={() => setOnlyFree(!onlyFree)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition shrink-0 border ml-1 ${
                onlyFree
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Только бесплатные
            </button>
          </div>
        </div>
      </div>

      {/* 3. OpenStreetMap Map View + Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Map Container (col-span-8 or 12) */}
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
          />

          {/* Tip overlay on map bottom */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-medium px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none z-20 border border-white/10">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Кликните на любое место на карте OpenStreetMap, чтобы добавить точку</span>
          </div>
        </div>

        {/* Right Sidebar: List of visible spots / Selected Spot details */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Selected Spot Details Card if one is chosen */}
          {selectedMapSpot ? (
            <div className="bg-white rounded-3xl p-5 border-2 border-blue-500/80 shadow-lg animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedMapSpot.category === 'toilet' && '🚽 Туалет'}
                  {selectedMapSpot.category === 'wifi' && '📶 Бесплатный Wi-Fi'}
                  {selectedMapSpot.category === 'outlet' && '⚡ Розетки / Учеба'}
                  {selectedMapSpot.category === 'deal' && '🔥 Скидка StudCity'}
                  {selectedMapSpot.category === 'print' && '🖨️ Копицентр'}
                </span>
                {selectedMapSpot.isFree ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Бесплатно
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {selectedMapSpot.priceInfo || 'Платно'}
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                {selectedMapSpot.title}
              </h3>

              <p className="text-xs text-slate-500 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{selectedMapSpot.address}</span>
              </p>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                {selectedMapSpot.description}
              </p>

              {selectedMapSpot.wifiSpeed && (
                <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold flex items-center justify-between">
                  <span>Скорость сети:</span>
                  <span className="font-bold">{selectedMapSpot.wifiSpeed}</span>
                </div>
              )}

              {selectedMapSpot.outletCount && (
                <div className="text-xs text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 font-semibold flex items-center justify-between">
                  <span>Количество розеток:</span>
                  <span className="font-bold">{selectedMapSpot.outletCount}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`https://2gis.kz/almaty/search/${encodeURIComponent(
                    selectedMapSpot.title + ' ' + selectedMapSpot.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-3 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2GIS</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMapSpot.lat},${selectedMapSpot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google</span>
                </a>
              </div>

              {selectedMapSpot.offerId && (
                <button
                  onClick={() => {
                    const match = offers.find((o) => o.id === selectedMapSpot.offerId);
                    if (match) openQrModal(match);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <span>🔥</span>
                  <span>Получить студенческий QR</span>
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
                Нажмите на любой маркер на карте, чтобы посмотреть описание, условия входа и проложить маршрут.
              </p>
            </div>
          )}

          {/* Quick List of Nearby Spots */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm flex-1 flex flex-col max-h-[420px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Локации в списке ({filteredSpots.length})
              </h4>
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
                    className={`w-full text-left p-3 rounded-2xl transition border flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/70 text-slate-700'
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">
                          {spot.category === 'toilet' && '🚽'}
                          {spot.category === 'wifi' && '📶'}
                          {spot.category === 'outlet' && '⚡'}
                          {spot.category === 'deal' && '🔥'}
                          {spot.category === 'print' && '🖨️'}
                        </span>
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {spot.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{spot.address}</p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {spot.isFree ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          Бесплатно
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                          {spot.priceInfo || 'Платно'}
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
        }}
      />
    </div>
  );
};
