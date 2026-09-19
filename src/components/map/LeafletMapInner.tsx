'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapSpot, MapSpotCategory, VenueOffer } from '@/types';

interface LeafletMapInnerProps {
  spots: MapSpot[];
  selectedSpot: MapSpot | null;
  onSelectSpot: (spot: MapSpot | null) => void;
  onMapClickAdd?: (coords: { lat: number; lng: number }) => void;
  userLocation: { lat: number; lng: number } | null;
  offers: VenueOffer[];
  onOpenOfferQr: (offer: VenueOffer) => void;
  centerCoords?: { lat: number; lng: number; zoom?: number } | null;
}

const getCategoryConfig = (cat: MapSpotCategory) => {
  switch (cat) {
    case 'toilet':
      return {
        bg: 'bg-blue-600',
        border: 'border-blue-300',
        shadow: 'shadow-blue-500/40',
        emoji: '🚽',
        label: 'Туалет',
        textColor: 'text-blue-600',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'wifi':
      return {
        bg: 'bg-emerald-600',
        border: 'border-emerald-300',
        shadow: 'shadow-emerald-500/40',
        emoji: '📶',
        label: 'Wi-Fi',
        textColor: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'outlet':
      return {
        bg: 'bg-purple-600',
        border: 'border-purple-300',
        shadow: 'shadow-purple-500/40',
        emoji: '⚡',
        label: 'Розетки',
        textColor: 'text-purple-600',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    case 'deal':
      return {
        bg: 'bg-gradient-to-tr from-amber-500 to-rose-500',
        border: 'border-amber-300',
        shadow: 'shadow-amber-500/40',
        emoji: '🔥',
        label: 'Скидка',
        textColor: 'text-amber-600',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'print':
      return {
        bg: 'bg-indigo-600',
        border: 'border-indigo-300',
        shadow: 'shadow-indigo-500/40',
        emoji: '🖨️',
        label: 'Печать',
        textColor: 'text-indigo-600',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    default:
      return {
        bg: 'bg-slate-700',
        border: 'border-slate-300',
        shadow: 'shadow-slate-500/40',
        emoji: '📍',
        label: 'Точка',
        textColor: 'text-slate-700',
        badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
};

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  onMapClickAdd,
  userLocation,
  offers,
  onOpenOfferQr,
  centerCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Almaty center coordinates
    const almatyCenter: [number, number] = [43.238949, 76.928709];
    const map = L.map(mapContainerRef.current, {
      center: almatyCenter,
      zoom: 14,
      zoomControl: true,
      minZoom: 11,
      maxZoom: 19,
    });

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Click handler on map to add a new spot
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickAdd) {
        onMapClickAdd({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when requested
  useEffect(() => {
    if (!mapInstanceRef.current || !centerCoords) return;
    mapInstanceRef.current.flyTo(
      [centerCoords.lat, centerCoords.lng],
      centerCoords.zoom || 16,
      { duration: 0.8 }
    );
  }, [centerCoords]);

  // Update User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></span>
          <span class="relative flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full border-2 border-white shadow-lg">
            <span class="w-2 h-2 bg-white rounded-full"></span>
          </span>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-loc-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          '<div class="p-2 text-xs font-bold text-slate-800">Вы находитесь здесь 📍</div>'
        );

      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  // Render Spots Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    spots.forEach((spot) => {
      const config = getCategoryConfig(spot.category);
      const isSelected = selectedSpot?.id === spot.id;

      const html = `
        <div class="custom-map-pin flex flex-col items-center cursor-pointer ${
          isSelected ? 'scale-125 z-50' : ''
        }">
          <div class="w-10 h-10 rounded-2xl ${config.bg} ${config.border} border-2 shadow-md ${
            config.shadow
          } flex items-center justify-center text-lg text-white transition-transform">
            ${config.emoji}
          </div>
          <div class="w-1.5 h-1.5 bg-slate-800 rounded-full mt-0.5 opacity-60"></div>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'spot-pin',
        iconSize: [40, 46],
        iconAnchor: [20, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon });

      // Create rich popup DOM element
      const popupDiv = document.createElement('div');
      popupDiv.className = 'w-72 max-w-[85vw] text-slate-800 p-4 font-sans';

      const tagsHtml = (spot.tags || [])
        .map(
          (t) =>
            `<span class="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md mr-1 mb-1">${t}</span>`
        )
        .join('');

      const priceBadge = spot.isFree
        ? '<span class="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Бесплатно</span>'
        : spot.priceInfo
        ? `<span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">${spot.priceInfo}</span>`
        : '';

      const wifiHtml = spot.wifiSpeed
        ? `<div class="mt-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold flex items-center justify-between">
             <span>Скорость сети:</span>
             <span class="font-bold font-mono">${spot.wifiSpeed}</span>
           </div>`
        : '';

      const outletHtml = spot.outletCount
        ? `<div class="mt-2 text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 font-semibold flex items-center justify-between">
             <span>Розетки:</span>
             <span class="font-bold">${spot.outletCount}</span>
           </div>`
        : '';

      popupDiv.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              config.badgeBg
            }">
              <span>${config.emoji}</span>
              <span>${config.label}</span>
            </span>
            ${priceBadge}
          </div>

          <div>
            <h4 class="font-bold text-sm text-slate-900 leading-snug">${
              spot.title
            }</h4>
            <p class="text-xs text-slate-500 mt-1 flex items-start gap-1">
              <span>📍</span>
              <span>${spot.address}</span>
            </p>
          </div>

          ${wifiHtml}
          ${outletHtml}

          <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
            ${spot.description}
          </p>

          ${
            spot.hours
              ? `<div class="text-[11px] text-slate-500 flex items-center gap-1">
                   <span>🕒</span>
                   <span>${spot.hours}</span>
                 </div>`
              : ''
          }

          <div class="pt-1 flex flex-wrap">
            ${tagsHtml}
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
            <a 
              href="https://2gis.kz/almaty/search/${encodeURIComponent(
                spot.title + ' ' + spot.address
              )}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2 rounded-xl text-xs font-bold transition"
            >
              2GIS Маршрут ↗
            </a>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${
                spot.lat
              },${spot.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 px-2 rounded-xl text-xs font-bold transition"
            >
              Google Карты ↗
            </a>
          </div>
          ${
            spot.offerId
              ? `<button id="popup-offer-btn-${spot.id}" class="w-full mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5">
                   <span>🔥</span>
                   <span>Получить QR со скидкой</span>
                 </button>`
              : ''
          }
        </div>
      `;

      // Handle QR button click if linked to a StudCity offer
      if (spot.offerId) {
        const matchingOffer = offers.find((o) => o.id === spot.offerId);
        if (matchingOffer) {
          const btn = popupDiv.querySelector(`#popup-offer-btn-${spot.id}`);
          btn?.addEventListener('click', () => {
            onOpenOfferQr(matchingOffer);
          });
        }
      }

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        onSelectSpot(spot);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [spots, selectedSpot, offers]);

  return (
    <div className="relative w-full h-full min-h-[500px] sm:min-h-[620px] rounded-3xl overflow-hidden shadow-inner border border-slate-200/80">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
