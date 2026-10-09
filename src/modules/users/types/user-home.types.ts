export type BannerActionType =
  | 'CATEGORY'
  | 'MACHINE'
  | 'SEGMENT'
  | 'PROMOTION'
  | 'EXTERNAL';

export interface HomeBannerDto {
  id: string;
  title: string;
  subtitle: string;
  tag?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  webImageUrl?: string;
  ctaText: string;
  actionType: BannerActionType;
  actionTarget: string;
  backgroundColor?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface HomeCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  displayOrder: number;
  machinesCount: number;
  isPopular?: boolean;
}

export interface HomeFeaturedMachineDto {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  segment: 'LIGHT' | 'HEAVY' | 'OTHER' | null;
  imageUrl: string | null;
  startingDailyRateInr?: number;
  startingHourlyRateInr?: number;
  minBooking?: string;
  popularBrands: string[];
  tag?: string;
  rating: number;
  reviewsCount: number;
}

export interface HomeSegmentOverviewDto {
  segment: 'LIGHT' | 'HEAVY' | 'OTHER';
  title: string;
  description: string;
  badge: string;
  keyFeatures: string[];
  startingDailyRateInr: number | null;
  machineCount: number;
  popularMachines: Array<{ name: string; slug: string }>;
}

export interface HomePromotionDto {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxDiscountInr?: number;
  minOrderValueInr?: number;
  validUntil?: string;
  termsSummary: string;
  badge?: string;
}

export interface HomeTrustMarkerDto {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface HomeTestimonialDto {
  id: string;
  authorName: string;
  roleOrCompany: string;
  city: string;
  rating: number;
  content: string;
  machineUsed: string;
  avatarUrl?: string;
}

export interface HomeUserContextDto {
  id: string;
  firstName: string | null;
  phone: string | null;
  referralCode: string | null;
  hasActiveBookings: boolean;
  pendingReconsentsCount: number;
}

export interface UserHomePageFeedDto {
  greeting: string;
  heroBanners: HomeBannerDto[];
  categories: HomeCategoryDto[];
  featuredMachines: HomeFeaturedMachineDto[];
  segments: HomeSegmentOverviewDto[];
  promotions: HomePromotionDto[];
  trustMarkers: HomeTrustMarkerDto[];
  testimonials: HomeTestimonialDto[];
  trendingSearches: string[];
  user: HomeUserContextDto | null;
}
