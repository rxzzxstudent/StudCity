'use client';

import React, { useState } from 'react';
import { MapSpot, MapSpotCategory } from '@/types';
import { X, PlusCircle, MapPin, Check } from 'lucide-react';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords: { lat: number; lng: number } | null;
  onAddSpot: (spot: Omit<MapSpot, 'id'>) => void;
}

export const AddSpotModal: React.FC<AddSpotModalProps> = ({
  isOpen,
  onClose,
  initialCoords,
  onAddSpot,
}) => {
  const [category, setCategory] = useState<MapSpotCategory>('toilet');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [priceInfo, setPriceInfo] = useState('');
  const [hours, setHours] = useState('08:00 – 22:00');
  const [description, setDescription] = useState('');
  const [wifiSpeed, setWifiSpeed] = useState('50 Мбит/с');
  const [outletCount, setOutletCount] = useState('10+');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !initialCoords) return;

    const categoryLabels: Record<MapSpotCategory, string> = {
      toilet: 'Туалет',
      wifi: 'Бесплатный Wi-Fi',
      outlet: 'Розетки / Учеба',
      deal: 'Скидка StudCity',
      print: 'Копицентр / Печать',
    };

    onAddSpot({
      title: title.trim(),
      category,
      categoryLabel: categoryLabels[category],
      lat: initialCoords.lat,
      lng: initialCoords.lng,
      address: address.trim() || 'Алматы, отмечено на карте',
      isFree,
      priceInfo: isFree ? 'Бесплатно' : priceInfo || 'Платно',
      hours: hours.trim(),
      description: description.trim() || 'Добавлено студентом на карту города',
      wifiSpeed: category === 'wifi' ? wifiSpeed : undefined,
      outletCount: category === 'outlet' ? outletCount : undefined,
      tags: ['Добавлено пользователем', categoryLabels[category]],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Добавить точку на карту</h3>
              <p className="text-xs text-slate-500">Поделитесь полезным местом с другими студентами</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Coordinates indicator */}
          {initialCoords && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Координаты: {initialCoords.lat.toFixed(5)}, {initialCoords.lng.toFixed(5)}</span>
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Тип места</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('toilet')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  category === 'toilet'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🚽</span>
                <span>Туалет</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('wifi')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  category === 'wifi'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>📶</span>
                <span>Wi-Fi</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('outlet')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  category === 'outlet'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>⚡</span>
                <span>Розетки</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Название / Описание объекта *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={category === 'toilet' ? 'Например: Санузел в ТРЦ Forum 2 этаж' : 'Например: Зона с розетками в фойе'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Адрес / Ориентир</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ул. Сейфуллина, 617 или кампус КазНУ"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition"
            />
          </div>

          {/* Free vs Paid Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700">Бесплатный вход / доступ?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  isFree ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}
              >
                Да
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  !isFree ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}
              >
                Платно
              </button>
            </div>
          </div>

          {!isFree && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Стоимость / Условия</label>
              <input
                type="text"
                value={priceInfo}
                onChange={(e) => setPriceInfo(e.target.value)}
                placeholder="50 ₸ / Kaspi QR или по чеку кафе"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Подробности / Комментарий</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Чистота, код на двери, как найти внутри здания..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Сохранить на карте</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
