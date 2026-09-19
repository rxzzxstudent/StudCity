export type Role = 'student' | 'cashier';

export type StudentTab = 'offers' | 'map';

export type MapSpotCategory = 'toilet' | 'wifi' | 'outlet' | 'deal' | 'print';

export interface MapSpot {
  id: string;
  title: string;
  category: MapSpotCategory;
  categoryLabel: string;
  lat: number;
  lng: number;
  address: string;
  isFree: boolean;
  price?: number; // Numeric price in ₸ (0 if free)
  priceInfo?: string;
  hours?: string;
  description: string;
  imageUrl?: string;
  wifiSpeed?: string;
  wifiPassword?: string;
  outletCount?: string;
  dealDiscount?: number;
  offerId?: string;
  amenities?: string[];
  paymentMethods?: string[];
  tags?: string[];
  isUserAdded?: boolean;
}

export type Category = 'all' | 'coffee' | 'food' | 'print' | 'coworking';

export interface VenueOffer {
  id: string;
  name: string;
  category: Category;
  categoryLabel: string;
  address: string;
  distance: string;
  cluster: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  happyHoursActive: boolean;
  happyHoursEnd: string; // e.g. "17:00"
  remainingSeconds: number; // For live countdown
  image: string;
  iconName: string;
  isControlledByCashier?: boolean; // URBO coffee
}

export interface StudentCode {
  code: string;
  venueId: string;
  venueName: string;
  discountPercent: number;
  finalPrice: number;
  originalPrice: number;
  createdAt: number;
  expiresInSeconds: number;
  studentName: string;
  studentUni: string;
  isValid: boolean;
}

export interface RedemptionLog {
  id: string;
  code: string;
  venueName: string;
  studentUni: string;
  amount: number;
  savedAmount: number;
  timestamp: string;
}

export interface B2BMetrics {
  studentsToday: number;
  additionalRevenue: number;
  repeatConversionPercent: number;
  currentCapacity: number; // e.g. 22%
}
