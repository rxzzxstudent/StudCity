'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapSpot, MapSpotCategory } from '@/types';
import { PRESET_SPOT_PHOTOS } from './spotsData';
import { 
  X, 
  PlusCircle, 
  MapPin, 
  Check, 
  Upload, 
  Camera, 
  Coins, 
  Wifi, 
  Zap, 
  Sparkles, 
  Image as ImageIcon,
  Clock,
  Crosshair,
  Trash2
} from 'lucide-react';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords: { lat: number; lng: number } | null;
  onAddSpot: (spot: Omit<MapSpot, 'id'>) => void;
}

const CAMPUS_PRESETS = [
  { name: 'КазНУ (ГУК)', lat: 43.2245, lng: 76.9218, address: 'Кампус КазНУ им. аль-Фараби' },
  { name: 'Satbayev (Политех)', lat: 43.2375, lng: 76.9268, address: 'ул. Сатпаева, 22' },
  { name: 'КБТУ (Центр)', lat: 43.2558, lng: 76.9435, address: 'ул. Толе би, 59' },
  { name: 'Арбат', lat: 43.2625, lng: 76.9420, address: 'ул. Жибек Жолы (Арбат)' },
  { name: 'Dostyk Plaza', lat: 43.2335, lng: 76.9568, address: 'мкр. Самал-2, 111' },
];

const TOILET_AMENITIES = [
  'Туалетная бумага',
  'Мыло',
  'Сушилка для рук',
  'Зеркало',
  'Горячая вода',
  'Доступ для инвалидов',
];

const PAYMENT_OPTIONS = ['Kaspi QR', 'Банковская карта', 'Наличные', 'По чеку кафе'];

export const AddSpotModal: React.FC<AddSpotModalProps> = ({
  isOpen,
  onClose,
  initialCoords,
  onAddSpot,
}) => {
  const [category, setCategory] = useState<MapSpotCategory>('toilet');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initialCoords);
  const [isLocating, setIsLocating] = useState(false);

  // Price state
  const [isFree, setIsFree] = useState(true);
  const [numericPrice, setNumericPrice] = useState<number>(50);
  const [priceCustomText, setPriceCustomText] = useState('');
  const [selectedPayments, setSelectedPayments] = useState<string[]>(['Kaspi QR']);

  // Photo state
  const [imageUrl, setImageUrl] = useState('');
  const [photoMode, setPhotoMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category specific state
  const [hours, setHours] = useState('08:00 – 22:00');
  const [description, setDescription] = useState('');
  const [wifiSpeed, setWifiSpeed] = useState('100 Мбит/с');
  const [wifiPassword, setWifiPassword] = useState('Без пароля (открытая)');
  const [outletCount, setOutletCount] = useState('У каждого стола');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Туалетная бумага', 'Мыло']);

  useEffect(() => {
    if (initialCoords) {
      setCoords(initialCoords);
    }
  }, [initialCoords]);

  // Set default photo when category changes if no custom uploaded photo
  useEffect(() => {
    if (photoMode === 'preset') {
      const presets = PRESET_SPOT_PHOTOS[category];
      if (presets && presets.length > 0) {
        setImageUrl(presets[0].url);
      }
    }
  }, [category, photoMode]);

  if (!isOpen) return null;

  // Handle GPS location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const newC = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newC);
      },
      (err) => {
        setIsLocating(false);
        alert('Не удалось получить геопозицию: ' + err.message);
      },
      { timeout: 8000 }
    );
  };

  // Handle file upload -> base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Размер фото не должен превышать 4 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setPhotoMode('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const togglePayment = (method: string) => {
    setSelectedPayments((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !coords) return;

    const categoryLabels: Record<MapSpotCategory, string> = {
      toilet: 'Туалет',
      wifi: 'Бесплатный Wi-Fi',
      outlet: 'Розетки / Учеба',
      deal: 'Скидка StudCity',
      print: 'Копицентр / Печать',
    };

    let formattedPrice = 'Бесплатно';
    if (!isFree) {
      if (priceCustomText.trim()) {
        formattedPrice = priceCustomText.trim();
      } else {
        const payStr = selectedPayments.length > 0 ? ` (${selectedPayments.join(', ')})` : '';
        formattedPrice = `${numericPrice} ₸${payStr}`;
      }
    }

    onAddSpot({
      title: title.trim(),
      category,
      categoryLabel: categoryLabels[category],
      lat: coords.lat,
      lng: coords.lng,
      address: address.trim() || 'Алматы, точка на карте OpenStreetMap',
      isFree,
      price: isFree ? 0 : numericPrice,
      priceInfo: formattedPrice,
      hours: hours.trim(),
      description:
        description.trim() ||
        `${categoryLabels[category]} добавлено студентом через приложение StudCity`,
      imageUrl: imageUrl.trim() || undefined,
      wifiSpeed: category === 'wifi' ? wifiSpeed : undefined,
      wifiPassword: category === 'wifi' ? wifiPassword : undefined,
      outletCount: category === 'outlet' ? outletCount : undefined,
      amenities: category === 'toilet' ? selectedAmenities : undefined,
      paymentMethods: isFree ? ['Бесплатно'] : selectedPayments,
      tags: ['Добавлено студентом', categoryLabels[category]],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 sm:p-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Добавить точку на карту
              </h3>
              <p className="text-xs text-slate-500">
                Поделитесь проверенным местом (туалет, Wi-Fi, розетка, фото и цена)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              1. Выберите категорию объекта *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setCategory('toilet')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 ${
                  category === 'toilet'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.03]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">🚽</span>
                <span>Туалет</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('wifi')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 ${
                  category === 'wifi'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.03]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">📶</span>
                <span>Wi-Fi</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('outlet')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 ${
                  category === 'outlet'
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20 scale-[1.03]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">⚡</span>
                <span>Розетки</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('print')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 ${
                  category === 'print'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.03]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">🖨️</span>
                <span>Печать</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('deal')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 col-span-2 sm:col-span-1 ${
                  category === 'deal'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 border-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.03]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">🔥</span>
                <span>Скидка</span>
              </button>
            </div>
          </div>

          {/* 2. Title & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Название места *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  category === 'toilet'
                    ? 'Например: Санузел в ТРЦ Forum 2 эт.'
                    : category === 'wifi'
                    ? 'Например: Wi-Fi в читальном зале'
                    : 'Например: Зона с розетками в холле'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Адрес / Ориентир
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ул. Сейфуллина, 617 или кампус Политеха"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition"
              />
            </div>
          </div>

          {/* Location & Coordinates Picker */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>
                  Координаты:{' '}
                  <span className="font-mono text-blue-700 font-semibold">
                    {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Не выбраны'}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs transition"
              >
                <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Поиск...' : 'Мое местоположение'}</span>
              </button>
            </div>

            {/* Quick preset locations */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">Кампусы:</span>
              {CAMPUS_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setCoords({ lat: p.lat, lng: p.lng });
                    if (!address) setAddress(p.address);
                  }}
                  className="text-[10px] font-semibold bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-2 py-0.5 rounded-md border border-slate-200 transition shrink-0"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Photo Section (Фотография места) */}
          <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-800">
                  Фотография места (Реалистичное фото)
                </span>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPhotoMode('preset')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    photoMode === 'preset' ? 'bg-indigo-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Пресеты
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoMode('upload');
                    fileInputRef.current?.click();
                  }}
                  className={`px-2 py-0.5 rounded-md transition ${
                    photoMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Загрузить
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    photoMode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Ссылка
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Presets Gallery */}
            {photoMode === 'preset' && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 font-medium">
                  Выберите подходящее качественное фото в один клик:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(PRESET_SPOT_PHOTOS[category] || []).map((preset, idx) => {
                    const isSelected = imageUrl === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`group relative rounded-xl overflow-hidden border-2 transition aspect-video text-left ${
                          isSelected
                            ? 'border-indigo-600 shadow-md ring-2 ring-indigo-400/30'
                            : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[9px] font-bold text-white leading-tight line-clamp-1">
                            {preset.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Area */}
            {photoMode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white rounded-2xl p-4 text-center transition flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-indigo-500" />
                <p className="text-xs font-bold text-slate-700">
                  Нажмите, чтобы загрузить фото с устройства
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WebP до 4 МБ</p>
              </div>
            )}

            {/* URL Input */}
            {photoMode === 'url' && (
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 outline-hidden transition"
                />
              </div>
            )}

            {/* Current Image Preview */}
            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black/5 flex items-center justify-between p-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={imageUrl}
                    alt="Предпросмотр"
                    className="w-16 h-12 rounded-lg object-cover border border-white shadow-xs shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      Фото прикреплено
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Будет отображаться в карточке
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                  title="Удалить фото"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 4. Price Indication (Указание цены) */}
          <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-extrabold text-slate-800">
                  Стоимость и условия доступа *
                </span>
              </div>

              {/* Free vs Paid Toggle */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFree(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                    isFree
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Бесплатно
                </button>
                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                    !isFree
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Платно (₸)
                </button>
              </div>
            </div>

            {/* Paid settings */}
            {!isFree && (
              <div className="space-y-2.5 pt-1">
                {/* Fast price chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500">Быстрый выбор:</span>
                  {[50, 100, 150, 200].map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => {
                        setNumericPrice(pr);
                        setPriceCustomText('');
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                        numericPrice === pr && !priceCustomText
                          ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pr} ₸
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setPriceCustomText('По чеку в заведении');
                      setNumericPrice(0);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                      priceCustomText === 'По чеку в заведении'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    По чеку
                  </button>
                </div>

                {/* Exact Numeric Price input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Цена в тенге (₸)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={numericPrice || ''}
                        onChange={(e) => {
                          setNumericPrice(Number(e.target.value) || 0);
                          setPriceCustomText('');
                        }}
                        placeholder="50"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-900 focus:border-amber-500 outline-hidden font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        ₸
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Особое условие (опционально)
                    </label>
                    <input
                      type="text"
                      value={priceCustomText}
                      onChange={(e) => setPriceCustomText(e.target.value)}
                      placeholder="Например: 50 ₸ или по чеку кафе"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:border-amber-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Способы оплаты:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const isSel = selectedPayments.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => togglePayment(opt)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                            isSel
                              ? 'bg-amber-500 border-amber-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Category-Specific Fields */}
          {category === 'toilet' && (
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Удобства в санузле:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {TOILET_AMENITIES.map((am) => {
                  const active = selectedAmenities.includes(am);
                  return (
                    <button
                      key={am}
                      type="button"
                      onClick={() => toggleAmenity(am)}
                      className={`text-left text-[11px] font-semibold px-2 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                        active
                          ? 'bg-blue-50 border-blue-400 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs">{active ? '✓' : '•'}</span>
                      <span className="truncate">{am}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {category === 'wifi' && (
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Скорость Wi-Fi
                </label>
                <div className="flex items-center gap-1">
                  {['50 Мбит/с', '100 Мбит/с', '200+ Мбит/с'].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setWifiSpeed(spd)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                        wifiSpeed === spd
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Пароль / Доступ
                </label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Без пароля или ввести пароль"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>
          )}

          {category === 'outlet' && (
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Количество и доступность розеток:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['У каждого стола', '10+ розеток', '5-10 розеток', 'Вдоль стен'].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setOutletCount(cnt)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                      outletCount === cnt
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. Hours & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Часы работы
              </label>
              <div className="flex items-center gap-1 mb-1">
                <button
                  type="button"
                  onClick={() => setHours('Круглосуточно (24/7)')}
                  className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                >
                  24/7
                </button>
                <button
                  type="button"
                  onClick={() => setHours('08:00 – 22:00')}
                  className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                >
                  08:00 – 22:00
                </button>
                <button
                  type="button"
                  onClick={() => setHours('10:00 – 22:00')}
                  className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                >
                  ТРЦ
                </button>
              </div>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="08:00 – 22:00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Комментарий / Как найти
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Этаж, чистота, код двери, как быстрее пройти..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить точку на карте</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
