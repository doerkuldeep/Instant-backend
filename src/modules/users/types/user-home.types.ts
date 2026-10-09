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

// ============================================================================
// Server-Driven UI (SDUI) - Layout & Dynamic Component Schemas
// ============================================================================

export type UiActionType =
  | 'NAVIGATE'
  | 'DEEP_LINK'
  | 'MODAL'
  | 'COPY_CLIPBOARD'
  | 'PHONE_CALL'
  | 'SEARCH_FILTER';

export interface UiAction {
  type: UiActionType;
  target: string;
  label?: string;
  payload?: Record<string, unknown>;
}

export type UiComponentType =
  | 'HERO_CAROUSEL'
  | 'QUICK_ACTIONS'
  | 'SEARCH_SUGGESTIONS_TICKER'
  | 'CATEGORY_GRID'
  | 'SEGMENT_SHOWCASE'
  | 'FEATURED_MACHINES_HORIZONTAL'
  | 'PROMOTION_BANNER_STRIP'
  | 'TRUST_MARKERS_GRID'
  | 'TESTIMONIALS_CAROUSEL'
  | 'CALL_TO_ACTION_BANNER';

export type UiLayoutType =
  | 'CAROUSEL'
  | 'GRID'
  | 'HORIZONTAL_LIST'
  | 'VERTICAL_LIST'
  | 'TABS'
  | 'BANNER'
  | 'CHIP_WRAP';

export interface UiLayoutConfig {
  layoutType: UiLayoutType;
  columns?: number;
  itemSpacing?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  aspectRatio?: string;
  backgroundColor?: string;
  snapAlignment?: 'start' | 'center' | 'none';
  autoScrollMs?: number;
  responsive?: {
    mobile: {
      layoutType: UiLayoutType;
      columns?: number;
      snapAlignment?: 'start' | 'center' | 'none';
      cardWidthPx?: number;
    };
    desktop: {
      layoutType: UiLayoutType;
      columns?: number;
    };
  };
}

export interface UiComponentHeader {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: {
    text: string;
    action: UiAction;
  };
}

export interface UiComponentDto<TData = unknown> {
  id: string;
  type: UiComponentType;
  order: number;
  header?: UiComponentHeader;
  layout: UiLayoutConfig;
  data: TData;
  analytics?: {
    sectionName: string;
    impressionEvent: string;
  };
}

export interface UiAppBarDto {
  type: 'SEARCH_HEADER';
  brandTitle: string;
  brandTagline: string;
  locationSelector: {
    currentCity: string;
    label: string;
    action: UiAction;
  };
  searchBar: {
    placeholder: string;
    tickerSuggestions: string[];
    action: UiAction;
  };
  notificationAction: {
    badgeCount: number;
    action: UiAction;
  };
  userAction: {
    title: string;
    avatarUrl?: string | null;
    action: UiAction;
  };
}

export interface UiBottomNavigationItemDto {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  isActive: boolean;
  action: UiAction;
}

export interface UiScreenDto {
  screenId: 'USER_HOME';
  title: string;
  version: string;
  targetPlatform: 'all' | 'app' | 'web';
  mobileWebBehavior: 'NATIVE_APP_SHELL';
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
  };
  appBar: UiAppBarDto;
  sections: UiComponentDto[];
  bottomNavigation: UiBottomNavigationItemDto[];
  user: HomeUserContextDto | null;
}

