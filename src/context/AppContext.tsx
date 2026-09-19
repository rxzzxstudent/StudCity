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
    id: 'urbo-coffee',
    name: 'URBO Coffee',
    category: 'coffee',
    categoryLabel: 'Кофе и десерты',
    address: 'ул. Байтурсынова, 100 (уг. Сатпаева)',
    distance: '120 м от кампуса',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Капучино (350 мл) + Свежий круассан',
    description: 'Идеальный комбо-сет для учебы и перерыва между парами. Свежеобжаренная 100% арабика.',
    originalPrice: 1100,
    discountedPrice: 650,
    discountPercent: 40,
    happyHoursActive: true,
    happyHoursEnd: '17:00',
    remainingSeconds: 5310, // ~1h 28m 30s
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    iconName: 'Coffee',
    isControlledByCashier: true,
  },
  {
    id: 'zhekas-doner',
    name: "Zheka's Doner",
    category: 'food',
    categoryLabel: 'Обеды / Донеры',
    address: 'ул. Тимирязева, 42 (напротив КазНУ)',
    distance: '250 м от кампуса',
    cluster: 'Кампус КазНУ (ГУК)',
    title: 'Комбо-ланч: Донер с говядиной + Фри + Айран',
    description: 'Сытный горячий ланч со скидкой во время непикового интервала между лекциями.',
    originalPrice: 2000,
    discountedPrice: 1400,
    discountPercent: 30,
    happyHoursActive: true,
    happyHoursEnd: '16:30',
    remainingSeconds: 3540, // ~59m
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
    iconName: 'Utensils',
    isControlledByCashier: false,
  },
  {
    id: 'printmaster',
    name: 'PrintMaster Копицентр',
    category: 'print',
    categoryLabel: 'Копицентры',
    address: 'ул. Сатпаева, 22/1 (вход со двора)',
    distance: '80 м от Polytech',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Печать и термопереплет курсовых (до 50 стр)',
    description: 'Цветная и ч/б лазерная печать высокой четкости. Скидка действует в дневные часы спада.',
    originalPrice: 600,
    discountedPrice: 300,
    discountPercent: 50,
    happyHoursActive: true,
    happyHoursEnd: '18:00',
    remainingSeconds: 8900,
    image: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=800&q=80',
    iconName: 'Printer',
    isControlledByCashier: false,
  },
  {
    id: 'smartspace-coworking',
    name: 'SmartSpace Coworking',
    category: 'coworking',
    categoryLabel: 'Коворкинги',
    address: 'пр. Абая, 52/2 (ст. метро Байконур)',
    distance: '400 м',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Дневной билет студента (Wi-Fi 500 Мбит + Кофе)',
    description: 'Тихие зоны для подготовки к сессии, быстрый интернет 500 Мбит/с и розетки у каждого стола.',
    originalPrice: 3000,
    discountedPrice: 1950,
    discountPercent: 35,
    happyHoursActive: true,
    happyHoursEnd: '17:00',
    remainingSeconds: 5310,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    iconName: 'Laptop',
    isControlledByCashier: false,
  },
  {
    id: 'degirmen-cafe',
    name: 'Degirmen Bakery',
    category: 'coffee',
    categoryLabel: 'Кофе и десерты',
    address: 'ул. Сатпаева, 16 (уг. Достык)',
    distance: '350 м',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Сет: Турецкий чайник + Горячий симит с сыром',
    description: 'Аутентичная свежая турецкая выпечка и безлимитный чай для учебных посиделок.',
    originalPrice: 1400,
    discountedPrice: 770,
    discountPercent: 45,
    happyHoursActive: true,
    happyHoursEnd: '16:00',
    remainingSeconds: 1740,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    iconName: 'Coffee',
    isControlledByCashier: false,
  },
  {
    id: 'wok-lagman-hub',
    name: 'Wok & Lagman Hub',
    category: 'food',
    categoryLabel: 'Обеды / Донеры',
    address: 'ул. Байтурсынова, 70',
    distance: '180 м от кампуса',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Гуйру лагман ручной тяги + Облепиховый морс',
    description: 'Большая порция сочного домашнего лагмана со свежими овощами и натуральным напитком.',
    originalPrice: 1800,
    discountedPrice: 1260,
    discountPercent: 30,
    happyHoursActive: true,
    happyHoursEnd: '17:30',
    remainingSeconds: 7100,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    iconName: 'Utensils',
    isControlledByCashier: false,
  },
];

const INITIAL_LOGS: RedemptionLog[] = [
  {
    id: 'log-1',
    code: 'ST-3190',
    venueName: 'URBO Coffee',
    studentUni: 'КазНУ им. аль-Фараби',
    amount: 650,
    savedAmount: 450,
    timestamp: '14:48',
  },
  {
    id: 'log-2',
    code: 'ST-8812',
    venueName: 'URBO Coffee',
    studentUni: 'Satbayev University',
    amount: 650,
    savedAmount: 450,
    timestamp: '14:25',
  },
  {
    id: 'log-3',
    code: 'ST-5044',
    venueName: 'URBO Coffee',
    studentUni: 'МУИТ (IITU)',
    amount: 650,
    savedAmount: 450,
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

  // Sync URBO Happy hours toggle
  useEffect(() => {
    setOffers((prevOffers) =>
      prevOffers.map((off) =>
        off.id === 'urbo-coffee'
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
        venueId: 'urbo-coffee',
        venueName: 'URBO Coffee',
        discountPercent: 40,
        finalPrice: 650,
        originalPrice: 1100,
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
