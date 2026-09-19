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
  isAddMode?: boolean;
  onPhotoClick?: (url: string, title: string) => void;
}

const getCategoryConfig = (cat: MapSpotCategory) => {
  switch (cat) {
    case 'toilet':
      return {
        bg: 'bg-blue-600',
        emoji: '🚽',
        label: 'Туалет',
        textColor: 'text-blue-600',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
      };
    case 'wifi':
      return {
        bg: 'bg-emerald-600',
        emoji: '📶',
        label: 'Wi-Fi',
        textColor: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      };
    case 'outlet':
      return {
        bg: 'bg-purple-600',
        emoji: '⚡',
        label: 'Розетки',
        textColor: 'text-purple-600',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-100',
      };
    case 'deal':
      return {
        bg: 'bg-amber-500',
        emoji: '🔥',
        label: 'Скидка',
        textColor: 'text-amber-600',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
      };
    case 'print':
      return {
        bg: 'bg-indigo-600',
        emoji: '🖨️',
        label: 'Печать',
        textColor: 'text-indigo-600',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      };
    default:
      return {
        bg: 'bg-slate-700',
        emoji: '📍',
        label: 'Точка',
        textColor: 'text-slate-700',
        badgeBg: 'bg-slate-50 text-slate-700 border-slate-100',
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
  isAddMode = false,
  onPhotoClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tempAddMarkerRef = useRef<L.Marker | null>(null);
  const clickAddCallbackRef = useRef(onMapClickAdd);

  useEffect(() => {
    clickAddCallbackRef.current = onMapClickAdd;
  }, [onMapClickAdd]);

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
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Click handler on map to add a new spot
    map.on('click', (e: L.LeafletMouseEvent) => {
      // Put a temporary pulsating marker where clicked
      if (tempAddMarkerRef.current) {
        tempAddMarkerRef.current.remove();
        tempAddMarkerRef.current = null;
      }

      const tempIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 -ml-1 -mt-1">
            <span class="absolute w-7 h-7 bg-blue-600/30 rounded-full animate-ping"></span>
            <div class="relative flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full border border-white shadow-md text-[11px] font-bold">
              📍
            </div>
          </div>
        `,
        className: 'temp-pin',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const tempM = L.marker([e.latlng.lat, e.latlng.lng], { icon: tempIcon }).addTo(map);
      tempAddMarkerRef.current = tempM;

      if (clickAddCallbackRef.current) {
        clickAddCallbackRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update cursor style when in add mode
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (isAddMode) {
      mapContainerRef.current.style.cursor = 'crosshair';
    } else {
      mapContainerRef.current.style.cursor = '';
    }
  }, [isAddMode]);

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
        <div class="relative flex items-center justify-center w-7 h-7">
          <span class="absolute w-7 h-7 bg-blue-500/30 rounded-full animate-ping"></span>
          <span class="relative flex items-center justify-center w-4 h-4 bg-blue-600 text-white rounded-full border-2 border-white shadow-md">
            <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
          </span>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-loc-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          '<div class="p-1.5 text-xs font-bold text-slate-800">Вы здесь 📍</div>'
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

      // Clean, compact, refined pin
      const html = `
        <div class="custom-map-pin flex flex-col items-center cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        }">
          <div class="w-8 h-8 rounded-xl ${config.bg} border-2 border-white shadow-md flex items-center justify-center text-sm text-white">
            ${config.emoji}
          </div>
          <div class="w-1 h-1 bg-slate-800 rounded-full mt-0.5 opacity-40"></div>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'spot-pin',
        iconSize: [32, 38],
        iconAnchor: [16, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon });

      // Create rich, lightweight popup
      const popupDiv = document.createElement('div');
      popupDiv.className = 'w-68 max-w-[80vw] text-slate-800 p-2 font-sans';

      // Price badge
      const priceBadge = spot.isFree
        ? '<span class="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">Бесплатно</span>'
        : `<span class="bg-amber-50 text-amber-900 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">${spot.priceInfo || (spot.price ? `${spot.price} ₸` : 'Платно')}</span>`;

      // Compact Photo Preview
      const photoHtml = spot.imageUrl
        ? `
          <div id="popup-photo-${spot.id}" class="relative w-full h-24 rounded-xl overflow-hidden mb-2 shadow-2xs group cursor-pointer border border-slate-100">
            <img src="${spot.imageUrl}" alt="${spot.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <span class="absolute bottom-1.5 left-2 text-[10px] font-bold text-white flex items-center gap-1">
              📷 Фото
            </span>
          </div>
        `
        : '';

      const detailSnippet = spot.wifiSpeed
        ? `<div class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1"><span>📶</span> Скорость: ${spot.wifiSpeed}</div>`
        : spot.outletCount
        ? `<div class="text-[11px] text-purple-700 font-semibold flex items-center gap-1"><span>⚡</span> ${spot.outletCount}</div>`
        : '';

      popupDiv.innerHTML = `
        <div class="space-y-1.5">
          ${photoHtml}

          <div class="flex items-center justify-between gap-1.5">
            <span class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
              config.badgeBg
            }">
              <span>${config.emoji}</span>
              <span>${config.label}</span>
            </span>
            ${priceBadge}
          </div>

          <div>
            <h4 class="font-bold text-xs text-slate-900 leading-snug">${
              spot.title
            }</h4>
            <p class="text-[11px] text-slate-500 truncate mt-0.5">${spot.address}</p>
          </div>

          ${detailSnippet}

          <div class="pt-1.5 border-t border-slate-100 grid grid-cols-3 gap-1">
            <a 
              href="https://2gis.kz/almaty/search/${encodeURIComponent(
                spot.title + ' ' + spot.address
              )}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 rounded-lg text-[10px] font-bold transition"
            >
              2GIS ↗
            </a>
            <a 
              href="https://yandex.kz/maps/?rtext=~${spot.lat}%2C${spot.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-center bg-amber-50 hover:bg-amber-100 text-amber-800 py-1 rounded-lg text-[10px] font-bold transition"
            >
              Яндекс ↗
            </a>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${
                spot.lat
              },${spot.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 rounded-lg text-[10px] font-bold transition"
            >
              Google ↗
            </a>
          </div>

          ${
            spot.offerId
              ? `<button id="popup-offer-btn-${spot.id}" class="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1">
                   <span>🔥</span>
                   <span>Получить QR</span>
                 </button>`
              : ''
          }
        </div>
      `;

      if (spot.offerId) {
        const matchingOffer = offers.find((o) => o.id === spot.offerId);
        if (matchingOffer) {
          const btn = popupDiv.querySelector(`#popup-offer-btn-${spot.id}`);
          btn?.addEventListener('click', () => {
            onOpenOfferQr(matchingOffer);
          });
        }
      }

      if (spot.imageUrl && onPhotoClick) {
        const photoEl = popupDiv.querySelector(`#popup-photo-${spot.id}`);
        photoEl?.addEventListener('click', () => {
          onPhotoClick(spot.imageUrl!, spot.title);
        });
      }

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        onSelectSpot(spot);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [spots, selectedSpot, offers, onPhotoClick]);

  return (
    <div className="relative w-full h-full min-h-[500px] sm:min-h-[640px] rounded-3xl overflow-hidden shadow-inner border border-slate-200/80">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
