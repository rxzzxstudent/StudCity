'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, Category, VenueOffer, StudentCode, RedemptionLog, B2BMetrics, StudentTab, MapSpot, MapSpotCategory } from '@/types';
import { INITIAL_MAP_SPOTS } from '@/components/map/spotsData';

export type SortOption = 'popular' | 'discount' | 'distance' | 'expiring';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  studentTab: StudentTab;
  setStudentTab: (tab: StudentTab) => void;
  viewMode: 'mobile-frame' | 'responsive';
  setViewMode: (mode: 'mobile-frame' | 'responsive') => void;
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  selectedCluster: string;
  setSelectedCluster: (cluster: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  offers: VenueOffer[];
  mapSpots: MapSpot[];
  addMapSpot: (spot: Omit<MapSpot, 'id'>) => void;
  deleteMapSpot: (id: string) => void;
  activeMapFilters: MapSpotCategory[];
  toggleMapFilter: (cat: MapSpotCategory) => void;
  setAllMapFilters: (cats: MapSpotCategory[]) => void;
  selectedMapSpot: MapSpot | null;
  setSelectedMapSpot: (spot: MapSpot | null) => void;
  activeStudentCode: StudentCode | null;
  activeOfferForQr: VenueOffer | null;
  openQrModal: (offer: VenueOffer) => void;
  closeQrModal: () => void;
  generateNewCode: () => void;
  codeTimeRemaining: number;
  urboHappyHoursActive: boolean;
  setUrboHappyHoursActive: (active: boolean) => void;
  toggleUrboHappyHours: () => void;
  b2bMetrics: B2BMetrics;
  redemptionLogs: RedemptionLog[];
  validateCode: (codeToValidate: string) => { success: boolean; message: string; codeData?: StudentCode };
  lastValidatedCode: { success: boolean; message: string; codeData?: StudentCode } | null;
  clearLastValidation: () => void;
  resetDemoData: () => void;
}

const INITIAL_OFFERS: VenueOffer[] = [
  {
    id: 'coffeemoon-cafe',
    name: 'Coffee Moon — Cafe & Wine',
    category: 'coffee',
    categoryLabel: 'Кафе и бар',
    address: 'ул. Манаса, 51',
    distance: '150 м от МУИТ / Polytech',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Любой лимонад/айс ти в подарок к любому блюду',
    description: 'Coffee Moon Cafe & Wine на Манаса 51 — первый партнер StudCity! Подарок для студентов: любой авторский лимонад или освежающий айс ти к любому блюду из меню.',
    originalPrice: 2800,
    discountedPrice: 1600,
    discountPercent: 40,
    happyHoursActive: true,
    happyHoursEnd: '21:00',
    remainingSeconds: 16800,
    image: '/partners/coffeemoon.png',
    iconName: 'Coffee',
    isControlledByCashier: true,
    phone: '+7 708 180 2182',
    badge: 'Манаса, 51 • Подарок к блюду',
  },
  {
    id: 'smart-service',
    name: 'Smart Service',
    category: 'service',
    categoryLabel: 'Ремонт и сервис',
    address: 'проспект Абая, 52В, офис 320 (БЦ Bayzak, 3 этаж)',
    distance: '200 м от Polytech / МУИТ',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Скидка 10-20% на ремонт ноутбуков, чистку и сервис ПК',
    description: 'Smart Service — продажа, ремонт и обслуживание ноутбуков и компьютеров в Алматы. Скидка 10-20% на услуги сервис-центра для студентов.',
    originalPrice: 6000,
    discountedPrice: 4800,
    discountPercent: 20,
    happyHoursActive: true,
    happyHoursEnd: '19:00',
    remainingSeconds: 13500,
    image: '/partners/smartservice.webp',
    iconName: 'Laptop',
    isControlledByCashier: false,
    website: 'https://smartservice.kz',
    mapUrl: 'https://yandex.kz/maps/ru/-/CHb34OK1',
    phone: '+7 (707) 320-52-00',
    badge: 'SMARTSERVICE.KZ',
  },
  {
    id: 'de-tulp-pancakes',
    name: 'De Tulp Dutch Pancake House',
    category: 'dessert',
    categoryLabel: 'Кафе и десерты',
    address: 'ул. Жибек Жолы, 53 (Зеленый Базар)',
    distance: '350 м от КБТУ (Арбат)',
    cluster: 'Кластер Толе би — Абылай хана (КБТУ/КазНАУ)',
    title: 'Скидка 10% на все традиционные голландские панкейки',
    description: 'Traditional Dutch Pancake House в историческом центре Алматы. Аутентичные голландские панкейки, кофе и десерты со скидкой 10% для студентов.',
    originalPrice: 2800,
    discountedPrice: 2520,
    discountPercent: 10,
    happyHoursActive: true,
    happyHoursEnd: '18:00',
    remainingSeconds: 9600,
    image: '/partners/de-tulp.jpg',
    iconName: 'Utensils',
    isControlledByCashier: false,
    instagram: 'https://instagram.com/de_tulp_kazakhstan',
    phone: '+7 707 730 0810',
    badge: '@de_tulp_kazakhstan',
  },
  {
    id: 'sandi-cakes',
    name: 'Sandi Cakes',
    category: 'dessert',
    categoryLabel: 'Кондитерская / Бенто',
    address: 'ул. Сатпаева / район студенческих кампусов',
    distance: '120 м от кампуса',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Комбо «Кофе + пирожное за 1 800 ₸» или -10% на бенто-торты',
    description: 'Любимые бенто-торты студентов на праздники и дни рождения. Специальное комбо «Кофе + пирожное» с 12:00 до 16:00 со скидкой!',
    originalPrice: 2500,
    discountedPrice: 1800,
    discountPercent: 28,
    happyHoursActive: true,
    happyHoursEnd: '16:00',
    remainingSeconds: 2700,
    image: '/partners/sandi-cakes.jpg',
    iconName: 'Coffee',
    isControlledByCashier: false,
    phone: '+7 777 555 1234',
    badge: 'С 12:00 до 16:00',
  },
  {
    id: 'torte-studio-atakent',
    name: 'Torte Studio (Атакент)',
    category: 'dessert',
    categoryLabel: 'Торты и сладости',
    address: 'Район Атакент / ул. Тимирязева, 42',
    distance: '200 м от кампуса КазНУ',
    cluster: 'Кампус КазНУ (ГУК)',
    title: 'Скидка 10% на авторские торты и клубнику в шоколаде',
    description: 'Свадебные и тематические торты с индивидуальным дизайном, свежая клубника в шоколаде @leila_strawberry со студенческой скидкой 10%.',
    originalPrice: 5000,
    discountedPrice: 4500,
    discountPercent: 10,
    happyHoursActive: true,
    happyHoursEnd: '20:00',
    remainingSeconds: 15400,
    image: '/partners/torte-studio.jpg',
    iconName: 'Sparkles',
    isControlledByCashier: false,
    instagram: 'https://instagram.com/aigerim_saduakasovna',
    phone: '+7 776 712 1998',
    badge: '@aigerim_saduakasovna',
  },
];

const INITIAL_LOGS: RedemptionLog[] = [
  {
    id: 'log-1',
    code: 'ST-3190',
    venueName: 'Coffee Moon — Cafe & Wine',
    studentUni: 'КазНУ им. аль-Фараби',
    amount: 1600,
    savedAmount: 1200,
    timestamp: '14:48',
  },
  {
    id: 'log-2',
    code: 'ST-8812',
    venueName: 'Coffee Moon — Cafe & Wine',
    studentUni: 'Satbayev University',
    amount: 1600,
    savedAmount: 1200,
    timestamp: '14:25',
  },
  {
    id: 'log-3',
    code: 'ST-5044',
    venueName: 'Smart Service',
    studentUni: 'МУИТ (IITU)',
    amount: 4800,
    savedAmount: 1200,
    timestamp: '13:50',
  },
];

const INITIAL_METRICS: B2BMetrics = {
  studentsToday: 14,
  additionalRevenue: 18200,
  repeatConversionPercent: 28,
  currentCapacity: 22,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('student');
  const [studentTab, setStudentTab] = useState<StudentTab>('offers');
  const [viewMode, setViewMode] = useState<'mobile-frame' | 'responsive'>('responsive');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedCluster, setSelectedCluster] = useState<string>('Кластер Сатпаева — Байтурсынова');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Map state
  const [mapSpots, setMapSpots] = useState<MapSpot[]>(INITIAL_MAP_SPOTS);
  const [activeMapFilters, setActiveMapFilters] = useState<MapSpotCategory[]>([
    'toilet',
    'wifi',
    'outlet',
    'deal',
    'print',
  ]);
  const [selectedMapSpot, setSelectedMapSpot] = useState<MapSpot | null>(null);

  // Load user spots from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('studcity_user_spots');
        if (saved) {
          const parsed: MapSpot[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMapSpots([...INITIAL_MAP_SPOTS, ...parsed]);
          }
        }
      } catch {
        // ignore JSON parse error
      }
    }
  }, []);

  const addMapSpot = (spotData: Omit<MapSpot, 'id'>) => {
    const newSpot: MapSpot = {
      ...spotData,
      id: `user-spot-${Date.now()}`,
      isUserAdded: true,
    };
    setMapSpots((prev) => {
      const updated = [newSpot, ...prev];
      if (typeof window !== 'undefined') {
        const userAddedOnly = updated.filter((s) => s.isUserAdded);
        localStorage.setItem('studcity_user_spots', JSON.stringify(userAddedOnly));
      }
      return updated;
    });
  };

  const deleteMapSpot = (id: string) => {
    setMapSpots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (typeof window !== 'undefined') {
        const userAddedOnly = updated.filter((s) => s.isUserAdded);
        localStorage.setItem('studcity_user_spots', JSON.stringify(userAddedOnly));
      }
      return updated;
    });
    if (selectedMapSpot?.id === id) {
      setSelectedMapSpot(null);
    }
  };

  const toggleMapFilter = (category: MapSpotCategory) => {
    setActiveMapFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const setAllMapFilters = (categories: MapSpotCategory[]) => {
    setActiveMapFilters(categories);
  };

  const [urboHappyHoursActive, setUrboHappyHoursActive] = useState<boolean>(true);
  const [offers, setOffers] = useState<VenueOffer[]>(INITIAL_OFFERS);

  const [activeOfferForQr, setActiveOfferForQr] = useState<VenueOffer | null>(null);
  const [activeStudentCode, setActiveStudentCode] = useState<StudentCode | null>(null);
  const [codeTimeRemaining, setCodeTimeRemaining] = useState<number>(30);

  const [b2bMetrics, setB2bMetrics] = useState<B2BMetrics>(INITIAL_METRICS);
  const [redemptionLogs, setRedemptionLogs] = useState<RedemptionLog[]>(INITIAL_LOGS);
  const [lastValidatedCode, setLastValidatedCode] = useState<{
    success: boolean;
    message: string;
    codeData?: StudentCode;
  } | null>(null);

  // Sync Cashier Happy hours toggle for Coffee Moon
  useEffect(() => {
    setOffers((prevOffers) =>
      prevOffers.map((off) =>
        off.id === 'coffeemoon-cafe'
          ? { ...off, happyHoursActive: urboHappyHoursActive }
          : off
      )
    );
  }, [urboHappyHoursActive]);

  // Global Happy Hours countdown ticker for offers
  useEffect(() => {
    const timer = setInterval(() => {
      setOffers((prev) =>
        prev.map((off) => ({
          ...off,
          remainingSeconds: Math.max(0, off.remainingSeconds - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 30s countdown for active student QR code
  useEffect(() => {
    let qrTimer: NodeJS.Timeout;
    if (activeStudentCode && codeTimeRemaining > 0) {
      qrTimer = setInterval(() => {
        setCodeTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (qrTimer) clearInterval(qrTimer);
    };
  }, [activeStudentCode, codeTimeRemaining]);

  const generateRandomCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `ST-${num}`;
  };

  const openQrModal = (offer: VenueOffer) => {
    setActiveOfferForQr(offer);
    const newCode: StudentCode = {
      code: generateRandomCode(),
      venueId: offer.id,
      venueName: offer.name,
      discountPercent: offer.discountPercent,
      finalPrice: offer.discountedPrice,
      originalPrice: offer.originalPrice,
      createdAt: Date.now(),
      expiresInSeconds: 30,
      studentName: 'Алихан Сейткали',
      studentUni: 'КазНУ им. аль-Фараби',
      isValid: true,
    };
    setActiveStudentCode(newCode);
    setCodeTimeRemaining(30);
  };

  const closeQrModal = () => {
    setActiveOfferForQr(null);
  };

  const generateNewCode = () => {
    if (!activeOfferForQr) return;
    const newCode: StudentCode = {
      code: generateRandomCode(),
      venueId: activeOfferForQr.id,
      venueName: activeOfferForQr.name,
      discountPercent: activeOfferForQr.discountPercent,
      finalPrice: activeOfferForQr.discountedPrice,
      originalPrice: activeOfferForQr.originalPrice,
      createdAt: Date.now(),
      expiresInSeconds: 30,
      studentName: 'Алихан Сейткали',
      studentUni: 'КазНУ им. аль-Фараби',
      isValid: true,
    };
    setActiveStudentCode(newCode);
    setCodeTimeRemaining(30);
  };

  const toggleUrboHappyHours = () => {
    setUrboHappyHoursActive((prev) => !prev);
  };

  const validateCode = (codeToValidate: string) => {
    const trimmed = codeToValidate.trim().toUpperCase();
    if (!trimmed) {
      const res = { success: false, message: 'Пожалуйста, введите код студента (например, ST-4821)' };
      setLastValidatedCode(res);
      return res;
    }

    let matchedCodeData: StudentCode;

    if (activeStudentCode && activeStudentCode.code === trimmed) {
      matchedCodeData = activeStudentCode;
    } else {
      matchedCodeData = {
        code: trimmed,
        venueId: 'coffeemoon-cafe',
        venueName: 'Coffee Moon — Cafe & Wine',
        discountPercent: 40,
        finalPrice: 1600,
        originalPrice: 2800,
        createdAt: Date.now(),
        expiresInSeconds: 30,
        studentName: 'Алихан Сейткали',
        studentUni: 'КазНУ им. аль-Фараби',
        isValid: true,
      };
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newLog: RedemptionLog = {
      id: `log-${Date.now()}`,
      code: matchedCodeData.code,
      venueName: matchedCodeData.venueName,
      studentUni: matchedCodeData.studentUni,
      amount: matchedCodeData.finalPrice,
      savedAmount: matchedCodeData.originalPrice - matchedCodeData.finalPrice,
      timestamp: timeStr,
    };

    setRedemptionLogs((prev) => [newLog, ...prev]);
    setB2bMetrics((prev) => ({
      ...prev,
      studentsToday: prev.studentsToday + 1,
      additionalRevenue: prev.additionalRevenue + matchedCodeData.finalPrice,
    }));

    const res = {
      success: true,
      message: `Код ${matchedCodeData.code} валиден! Скидка ${matchedCodeData.discountPercent}% применена. Сумма к оплате: ${matchedCodeData.finalPrice.toLocaleString()} ₸`,
      codeData: matchedCodeData,
    };

    setLastValidatedCode(res);
    return res;
  };

  const clearLastValidation = () => {
    setLastValidatedCode(null);
  };

  const resetDemoData = () => {
    setOffers(INITIAL_OFFERS);
    setMapSpots(INITIAL_MAP_SPOTS);
    setActiveMapFilters(['toilet', 'wifi', 'outlet', 'deal', 'print']);
    setSelectedMapSpot(null);
    setStudentTab('offers');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studcity_user_spots');
    }
    setUrboHappyHoursActive(true);
    setB2bMetrics(INITIAL_METRICS);
    setRedemptionLogs(INITIAL_LOGS);
    setLastValidatedCode(null);
    setActiveStudentCode(null);
    setActiveOfferForQr(null);
    setSearchQuery('');
    setSortBy('popular');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        studentTab,
        setStudentTab,
        viewMode,
        setViewMode,
        selectedCategory,
        setSelectedCategory,
        selectedCluster,
        setSelectedCluster,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        offers,
        mapSpots,
        addMapSpot,
        deleteMapSpot,
        activeMapFilters,
        toggleMapFilter,
        setAllMapFilters,
        selectedMapSpot,
        setSelectedMapSpot,
        activeStudentCode,
        activeOfferForQr,
        openQrModal,
        closeQrModal,
        generateNewCode,
        codeTimeRemaining,
        urboHappyHoursActive,
        setUrboHappyHoursActive,
        toggleUrboHappyHours,
        b2bMetrics,
        redemptionLogs,
        validateCode,
        lastValidatedCode,
        clearLastValidation,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
