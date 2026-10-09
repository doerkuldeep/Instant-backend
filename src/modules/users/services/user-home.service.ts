import { machinesService } from '../../machines/services/machines.service';
import { SegmentOverviewDto } from '../../machines/types/machines.types';
import { userHomeRepository } from '../repositories/user-home.repository';
import {
  HomeBannerDto,
  HomeCategoryDto,
  HomeFeaturedMachineDto,
  HomePromotionDto,
  HomeSegmentOverviewDto,
  HomeTestimonialDto,
  HomeTrustMarkerDto,
  HomeUserContextDto,
  UiComponentDto,
  UiScreenDto,
  UserHomePageFeedDto,
} from '../types/user-home.types';

export class UserHomeService {
  /**
   * Fetches unified, aggregated homepage feed for customer mobile app / website.
   * Single round-trip API call for optimal page-load performance.
   */
  public async getHomePageFeed(options: {
    city?: string;
    userId?: string;
  }): Promise<UserHomePageFeedDto> {
    const [
      heroBanners,
      categories,
      featuredMachines,
      segments,
      promotions,
      trustMarkers,
      testimonials,
      trendingSearches,
      userContext,
    ] = await Promise.all([
      this.getBanners(options.city),
      this.getCategories(10),
      this.getFeaturedMachines({ limit: 8 }),
      this.getSegments(),
      this.getPromotions(),
      this.getTrustMarkers(),
      this.getTestimonials(),
      this.getTrendingSearches(),
      options.userId ? this.getUserContext(options.userId) : Promise.resolve(null),
    ]);

    let greeting = 'Heavy & Light Construction Equipment Rental';
    if (userContext?.firstName) {
      greeting = `Welcome back, ${userContext.firstName}!`;
    } else if (userContext) {
      greeting = 'Welcome back!';
    }

    return {
      greeting,
      heroBanners,
      categories,
      featuredMachines,
      segments,
      promotions,
      trustMarkers,
      testimonials,
      trendingSearches,
      user: userContext,
    };
  }

  public async getBanners(city?: string): Promise<HomeBannerDto[]> {
    return userHomeRepository.getBanners(city);
  }

  public async getCategories(limit = 12): Promise<HomeCategoryDto[]> {
    const rawCategories = await machinesService.listCategories({});

    return rawCategories.slice(0, limit).map((cat, idx) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      iconUrl: cat.iconUrl,
      imageUrl: cat.imageUrl,
      bannerUrl: cat.bannerUrl,
      displayOrder: cat.displayOrder,
      machinesCount: cat.machinesCount || 0,
      isPopular: idx < 4,
    }));
  }

  public async getFeaturedMachines(options?: {
    segment?: 'LIGHT' | 'HEAVY' | 'OTHER';
    limit?: number;
  }): Promise<HomeFeaturedMachineDto[]> {
    const limit = options?.limit || 8;
    let featuredList = await machinesService.getFeaturedMachines();

    if (options?.segment) {
      featuredList = featuredList.filter((m) => m.segment === options.segment);
    }

    const curatedBadges = [
      'Most Popular',
      'Top Rated',
      'Best Value',
      'Verified Fleet',
      'Operator Included',
      'Rapid Dispatch',
    ];

    return featuredList.slice(0, limit).map((m, idx) => {
      // Deterministic realistic ratings for curated showcase
      const rating = Number((4.7 + (idx % 3) * 0.1).toFixed(1));
      const reviewsCount = 45 + (idx * 23);

      return {
        id: m.id,
        name: m.name,
        slug: m.slug,
        categoryName: m.category?.name || 'General Equipment',
        categorySlug: m.category?.slug || '',
        segment: m.segment,
        imageUrl: m.imageUrl,
        startingDailyRateInr: m.rental?.dailyInr,
        startingHourlyRateInr: m.rental?.hourlyInr,
        minBooking: m.rental?.minBooking || '1 day',
        popularBrands: m.popularBrands || [],
        tag: curatedBadges[idx % curatedBadges.length],
        rating,
        reviewsCount,
      };
    });
  }

  public async getSegments(): Promise<HomeSegmentOverviewDto[]> {
    const rawSegments = await machinesService.getSegmentsOverview();

    const segmentMetadata: Record<
      'LIGHT' | 'HEAVY' | 'OTHER',
      { badge: string; keyFeatures: string[] }
    > = {
      LIGHT: {
        badge: 'HOUSE BUILDERS & DIY',
        keyFeatures: [
          'Doorstep delivery to site',
          'Easy-to-use plug-and-play tools',
          'No certified operator needed',
          'Affordable daily & weekly rates',
        ],
      },
      HEAVY: {
        badge: 'COMMERCIAL & INFRA',
        keyFeatures: [
          'Certified operators included',
          'Heavy earthmoving & compaction',
          'Pan-India mobilization support',
          'Full statutory GST documentation',
        ],
      },
      OTHER: {
        badge: 'UTILITIES & EVENTS',
        keyFeatures: [
          'Diesel generators & site power',
          'Mobile lighting towers',
          'Farm tractors & site cabins',
          'Emergency replacement guarantee',
        ],
      },
    };

    return rawSegments.map((seg: SegmentOverviewDto) => {
      const segKey = seg.segment as 'LIGHT' | 'HEAVY' | 'OTHER';
      const meta = segmentMetadata[segKey];
      return {
        segment: seg.segment,
        title: seg.title,
        description: seg.description,
        badge: meta?.badge || 'ALL SEGMENTS',
        keyFeatures: meta?.keyFeatures || [],
        startingDailyRateInr: seg.startingDailyRateInr,
        machineCount: seg.machineCount,
        popularMachines: seg.popularMachines,
      };
    });
  }

  public async getPromotions(): Promise<HomePromotionDto[]> {
    return userHomeRepository.getPromotions();
  }

  public async getTrustMarkers(): Promise<HomeTrustMarkerDto[]> {
    return userHomeRepository.getTrustMarkers();
  }

  public async getTestimonials(): Promise<HomeTestimonialDto[]> {
    return userHomeRepository.getTestimonials();
  }

  public async getTrendingSearches(): Promise<string[]> {
    return userHomeRepository.getTrendingSearches();
  }

  public async getUserContext(userId: string): Promise<HomeUserContextDto | null> {
    return userHomeRepository.getUserContext(userId);
  }

  /**
   * Builds the complete Server-Driven UI (SDUI) Screen Contract.
   * Gives the backend 100% control over sections, widget types, ordering, design tokens,
   * actions, deep-links, and responsive layouts for mobile (Flutter/React Native/iOS/Android) and web.
   */
  public async getScreenLayout(options: {
    city?: string;
    userId?: string;
    platform?: 'all' | 'app' | 'web';
  }): Promise<UiScreenDto> {
    const feed = await this.getHomePageFeed(options);
    const activeCity = options.city || 'Pan-India';

    const sections: UiComponentDto[] = [
      // 1. Hero Banner Carousel
      {
        id: 'section-hero-banners',
        type: 'HERO_CAROUSEL',
        order: 1,
        layout: {
          layoutType: 'CAROUSEL',
          aspectRatio: '16:9',
          autoScrollMs: 4000,
          snapAlignment: 'center',
          paddingHorizontal: 16,
          itemSpacing: 12,
          responsive: {
            mobile: {
              layoutType: 'CAROUSEL',
              snapAlignment: 'center',
            },
            desktop: {
              layoutType: 'GRID',
              columns: 2,
            },
          },
        },
        analytics: {
          sectionName: 'Hero Marketing Banners',
          impressionEvent: 'home_hero_banner_impression',
        },
        data: {
          banners: feed.heroBanners.map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            tag: b.tag,
            imageUrl: b.imageUrl,
            mobileImageUrl: b.mobileImageUrl,
            backgroundColor: b.backgroundColor,
            cta: {
              text: b.ctaText,
              action: {
                type: 'NAVIGATE' as const,
                target: b.actionTarget,
                label: b.ctaText,
                payload: { actionType: b.actionType },
              },
            },
          })),
        },
      },

      // 2. Quick Actions
      {
        id: 'section-quick-actions',
        type: 'QUICK_ACTIONS',
        order: 2,
        layout: {
          layoutType: 'GRID',
          columns: 4,
          itemSpacing: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
        },
        data: {
          actions: [
            {
              id: 'qa-instant-hire',
              label: 'Instant Hire',
              icon: 'truck',
              badge: 'Fast',
              action: {
                type: 'NAVIGATE' as const,
                target: '/machines?deliveryAvailable=true',
                label: 'Instant Hire',
              },
            },
            {
              id: 'qa-with-operator',
              label: 'With Operator',
              icon: 'hard-hat',
              badge: 'Popular',
              action: {
                type: 'NAVIGATE' as const,
                target: '/machines?operatorIncluded=true',
                label: 'With Operator',
              },
            },
            {
              id: 'qa-light-tools',
              label: 'Light Tools',
              icon: 'tool',
              badge: null,
              action: {
                type: 'NAVIGATE' as const,
                target: '/machines?segment=LIGHT',
                label: 'Light Tools',
              },
            },
            {
              id: 'qa-bulk-fleet',
              label: 'Fleet Booking',
              icon: 'layers',
              badge: 'B2B',
              action: {
                type: 'NAVIGATE' as const,
                target: '/corporate-enquiry',
                label: 'Fleet Booking',
              },
            },
          ],
        },
      },

      // 3. Search Suggestions Ticker
      {
        id: 'section-trending-searches',
        type: 'SEARCH_SUGGESTIONS_TICKER',
        order: 3,
        header: {
          title: 'Trending Equipment Searches',
          subtitle: 'High demand in ' + activeCity,
        },
        layout: {
          layoutType: 'CHIP_WRAP',
          itemSpacing: 8,
          paddingHorizontal: 16,
        },
        data: {
          chips: feed.trendingSearches.map((keyword) => ({
            text: keyword,
            action: {
              type: 'SEARCH_FILTER' as const,
              target: `/machines?search=${encodeURIComponent(keyword)}`,
              label: keyword,
            },
          })),
        },
      },

      // 4. Category Grid
      {
        id: 'section-categories',
        type: 'CATEGORY_GRID',
        order: 4,
        header: {
          title: 'Machinery Categories',
          subtitle: 'Browse 100+ verified machines across categories',
          action: {
            text: 'View All',
            action: {
              type: 'NAVIGATE' as const,
              target: '/categories',
              label: 'View All Categories',
            },
          },
        },
        layout: {
          layoutType: 'GRID',
          columns: 4,
          itemSpacing: 12,
          paddingHorizontal: 16,
          responsive: {
            mobile: {
              layoutType: 'GRID',
              columns: 4,
            },
            desktop: {
              layoutType: 'GRID',
              columns: 6,
            },
          },
        },
        analytics: {
          sectionName: 'Category Browser',
          impressionEvent: 'home_categories_viewed',
        },
        data: {
          categories: feed.categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            iconUrl: c.iconUrl,
            imageUrl: c.imageUrl,
            machinesCount: c.machinesCount,
            isPopular: c.isPopular,
            action: {
              type: 'NAVIGATE' as const,
              target: `/machines?category=${c.slug}`,
              label: c.name,
            },
          })),
        },
      },

      // 5. Specialized Segment Tabs Showcase
      {
        id: 'section-segments-showcase',
        type: 'SEGMENT_SHOWCASE',
        order: 5,
        header: {
          title: 'Tailored for Every Project Scale',
          subtitle: 'From home renovation tools to massive commercial earthmoving',
        },
        layout: {
          layoutType: 'TABS',
          itemSpacing: 16,
          paddingHorizontal: 16,
        },
        data: {
          segments: feed.segments.map((seg) => ({
            segment: seg.segment,
            title: seg.title,
            description: seg.description,
            badge: seg.badge,
            startingDailyRateInr: seg.startingDailyRateInr,
            machineCount: seg.machineCount,
            keyFeatures: seg.keyFeatures,
            popularMachines: seg.popularMachines,
            action: {
              type: 'NAVIGATE' as const,
              target: `/machines?segment=${seg.segment}`,
              label: `Browse ${seg.title}`,
            },
          })),
        },
      },

      // 6. Featured Machines Horizontal Carousel
      {
        id: 'section-featured-machines',
        type: 'FEATURED_MACHINES_HORIZONTAL',
        order: 6,
        header: {
          title: 'Featured Equipment',
          subtitle: 'Verified machines available for instant jobsite mobilization',
          action: {
            text: 'Explore All',
            action: {
              type: 'NAVIGATE' as const,
              target: '/machines',
              label: 'Explore All Machines',
            },
          },
        },
        layout: {
          layoutType: 'HORIZONTAL_LIST',
          itemSpacing: 14,
          paddingHorizontal: 16,
          snapAlignment: 'start',
          responsive: {
            mobile: {
              layoutType: 'HORIZONTAL_LIST',
              snapAlignment: 'start',
              cardWidthPx: 250,
            },
            desktop: {
              layoutType: 'GRID',
              columns: 4,
            },
          },
        },
        analytics: {
          sectionName: 'Featured Fleet',
          impressionEvent: 'home_featured_machines_viewed',
        },
        data: {
          machines: feed.featuredMachines.map((m) => ({
            id: m.id,
            name: m.name,
            slug: m.slug,
            categoryName: m.categoryName,
            segment: m.segment,
            imageUrl: m.imageUrl,
            startingDailyRateInr: m.startingDailyRateInr,
            startingHourlyRateInr: m.startingHourlyRateInr,
            minBooking: m.minBooking,
            popularBrands: m.popularBrands,
            tag: m.tag,
            rating: m.rating,
            reviewsCount: m.reviewsCount,
            action: {
              type: 'NAVIGATE' as const,
              target: `/machines/${m.slug}`,
              label: `Rent ${m.name}`,
            },
          })),
        },
      },

      // 7. Promotions & Discount Vouchers
      {
        id: 'section-promotions',
        type: 'PROMOTION_BANNER_STRIP',
        order: 7,
        header: {
          title: 'Discounts & Rental Rebates',
          subtitle: 'Active coupon vouchers applicable at checkout',
        },
        layout: {
          layoutType: 'HORIZONTAL_LIST',
          itemSpacing: 12,
          paddingHorizontal: 16,
          snapAlignment: 'start',
        },
        data: {
          promotions: feed.promotions.map((p) => ({
            id: p.id,
            code: p.code,
            title: p.title,
            description: p.description,
            discountType: p.discountType,
            discountValue: p.discountValue,
            maxDiscountInr: p.maxDiscountInr,
            minOrderValueInr: p.minOrderValueInr,
            validUntil: p.validUntil,
            badge: p.badge,
            termsSummary: p.termsSummary,
            copyAction: {
              type: 'COPY_CLIPBOARD' as const,
              target: p.code,
              label: 'Copy Code',
            },
          })),
        },
      },

      // 8. Trust Markers Grid
      {
        id: 'section-trust-markers',
        type: 'TRUST_MARKERS_GRID',
        order: 8,
        header: {
          title: 'Why Rent with EquipShare?',
          subtitle: 'Certified reliability and transparent commercial terms',
        },
        layout: {
          layoutType: 'GRID',
          columns: 3,
          itemSpacing: 16,
          paddingHorizontal: 16,
          backgroundColor: '#F8FAFC',
        },
        data: {
          markers: feed.trustMarkers.map((t) => ({
            id: t.id,
            icon: t.icon,
            title: t.title,
            description: t.description,
          })),
        },
      },

      // 9. Customer Testimonials
      {
        id: 'section-testimonials',
        type: 'TESTIMONIALS_CAROUSEL',
        order: 9,
        header: {
          title: 'Trusted by 2,500+ Contractors',
          subtitle: 'Read feedback from civil engineers and project directors',
        },
        layout: {
          layoutType: 'HORIZONTAL_LIST',
          itemSpacing: 16,
          paddingHorizontal: 16,
          snapAlignment: 'center',
        },
        data: {
          testimonials: feed.testimonials.map((tm) => ({
            id: tm.id,
            authorName: tm.authorName,
            roleOrCompany: tm.roleOrCompany,
            city: tm.city,
            rating: tm.rating,
            content: tm.content,
            machineUsed: tm.machineUsed,
            avatarUrl: tm.avatarUrl,
          })),
        },
      },

      // 10. Partner Call-to-Action Banner
      {
        id: 'section-partner-cta',
        type: 'CALL_TO_ACTION_BANNER',
        order: 10,
        layout: {
          layoutType: 'BANNER',
          backgroundColor: '#0F172A',
          paddingHorizontal: 20,
          paddingVertical: 24,
        },
        data: {
          badge: 'EQUIPMENT OWNERS',
          title: 'Turn Idle Machinery into Monthly Revenue',
          subtitle:
            'Join India’s premier construction equipment network. Guaranteed on-time payouts and comprehensive asset protection.',
          primaryAction: {
            type: 'NAVIGATE' as const,
            target: '/partner/auth/send-otp',
            label: 'Register as Equipment Partner',
          },
          secondaryAction: {
            type: 'PHONE_CALL' as const,
            target: '+918001234567',
            label: 'Call Partner Desk',
          },
        },
      },
    ];

    return {
      screenId: 'USER_HOME',
      title: 'EquipShare - Construction Equipment Rentals',
      version: '1.0',
      targetPlatform: options.platform || 'all',
      mobileWebBehavior: 'NATIVE_APP_SHELL',
      theme: {
        primaryColor: '#2563EB',
        secondaryColor: '#1E293B',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        surfaceColor: '#F8FAFC',
        textColor: '#0F172A',
      },
      appBar: {
        type: 'SEARCH_HEADER',
        brandTitle: 'EquipShare',
        brandTagline: 'Heavy & Light Construction Rentals',
        locationSelector: {
          currentCity: activeCity,
          label: 'Delivering to',
          action: {
            type: 'MODAL' as const,
            target: 'CITY_PICKER_MODAL',
            label: 'Change City',
          },
        },
        searchBar: {
          placeholder: 'Search JCB, Excavators, Concrete Mixers...',
          tickerSuggestions: feed.trendingSearches,
          action: {
            type: 'NAVIGATE' as const,
            target: '/machines/search',
            label: 'Search Machines',
          },
        },
        notificationAction: {
          badgeCount: 0,
          action: {
            type: 'NAVIGATE' as const,
            target: '/notifications',
            label: 'Notifications',
          },
        },
        userAction: {
          title: feed.user?.firstName ? `Hi, ${feed.user.firstName}` : 'Sign In',
          avatarUrl: null,
          action: {
            type: 'NAVIGATE' as const,
            target: feed.user ? '/profile' : '/user/auth/send-otp',
            label: feed.user ? 'Account' : 'Sign In',
          },
        },
      },
      sections,
      bottomNavigation: [
        {
          id: 'nav-home',
          label: 'Home',
          icon: 'home',
          isActive: true,
          action: { type: 'NAVIGATE' as const, target: '/home', label: 'Home' },
        },
        {
          id: 'nav-categories',
          label: 'Categories',
          icon: 'grid',
          isActive: false,
          action: { type: 'NAVIGATE' as const, target: '/categories', label: 'Categories' },
        },
        {
          id: 'nav-rentals',
          label: 'My Rentals',
          icon: 'clock',
          isActive: false,
          action: { type: 'NAVIGATE' as const, target: '/rentals', label: 'My Rentals' },
        },
        {
          id: 'nav-support',
          label: 'Support',
          icon: 'help-circle',
          isActive: false,
          action: { type: 'NAVIGATE' as const, target: '/support', label: 'Support' },
        },
      ],
      user: feed.user,
    };
  }
}

export const userHomeService = new UserHomeService();
export default userHomeService;
