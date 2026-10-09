import { prisma } from '../../../database/prisma';
import {
  HomeBannerDto,
  HomePromotionDto,
  HomeTrustMarkerDto,
  HomeTestimonialDto,
  HomeUserContextDto,
} from '../types/user-home.types';
import { userConsentRepository } from './user-consent.repository';
import { userLegalService } from '../services/user-legal.service';

const DEFAULT_BANNERS: HomeBannerDto[] = [
  {
    id: 'banner-monsoon-prep',
    title: 'Monsoon Site Protection Sale',
    subtitle: 'Flat 15% off on dewatering pumps, compactors & diesel generators',
    tag: 'SEASONAL OFFER',
    imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    webImageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Rent Light Tools',
    actionType: 'CATEGORY',
    actionTarget: 'light-construction-tools',
    backgroundColor: '#1E3A8A',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'banner-heavy-earthmoving',
    title: 'Pan-India Heavy Earthmoving Fleet',
    subtitle: 'Hydraulic excavators, backhoe loaders & motor graders with certified operators',
    tag: 'VERIFIED OPERATORS',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    webImageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Book Heavy Machines',
    actionType: 'SEGMENT',
    actionTarget: 'HEAVY',
    backgroundColor: '#D97706',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'banner-first-rental',
    title: 'Flat ₹1,000 Off on First Equipment Booking',
    subtitle: 'Use promo code EQUIP1000 at checkout on any equipment rental',
    tag: 'NEW USER BONUS',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    webImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Claim Offer',
    actionType: 'PROMOTION',
    actionTarget: 'EQUIP1000',
    backgroundColor: '#047857',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'banner-zero-downtime',
    title: 'Guaranteed 4-Hour On-Site Mobilization',
    subtitle: 'Pre-inspected machinery delivered right to your commercial or residential project job-site',
    tag: 'RAPID DISPATCH',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80',
    webImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Fleet',
    actionType: 'CATEGORY',
    actionTarget: 'earthmoving-excavation',
    backgroundColor: '#4338CA',
    displayOrder: 4,
    isActive: true,
  },
];

const DEFAULT_PROMOTIONS: HomePromotionDto[] = [
  {
    id: 'promo-first1000',
    code: 'EQUIP1000',
    title: 'Flat ₹1,000 Off on First Rental',
    description: 'Get ₹1,000 off on your first machinery hire across all categories.',
    discountType: 'FLAT',
    discountValue: 1000,
    minOrderValueInr: 5000,
    validUntil: '2026-12-31',
    termsSummary: 'Valid once per verified user on rental contracts >= ₹5,000.',
    badge: 'NEW USER',
  },
  {
    id: 'promo-weekly15',
    code: 'WEEKLY15',
    title: '15% Off on Weekly Bookings',
    description: 'Enjoy 15% discount on continuous machinery hire of 7 days or more.',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscountInr: 15000,
    minOrderValueInr: 10000,
    validUntil: '2026-12-31',
    termsSummary: 'Applies to rental duration of 7 consecutive days or longer.',
    badge: 'MOST POPULAR',
  },
  {
    id: 'promo-monthly25',
    code: 'MONTHLY25',
    title: '25% Industrial Monthly Discount',
    description: 'Long-term site deployment discount on 30+ days rentals with free scheduled maintenance.',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    maxDiscountInr: 50000,
    minOrderValueInr: 40000,
    validUntil: '2026-12-31',
    termsSummary: 'Subject to 30 days minimum tenure and site safety verification.',
    badge: 'LONG TERM',
  },
  {
    id: 'promo-zerodeposit',
    code: 'ZERODEPOSIT',
    title: 'Zero Security Deposit for GST Registered Entities',
    description: 'Waiver of advance security deposit for verified business contractors.',
    discountType: 'FLAT',
    discountValue: 0,
    validUntil: '2026-12-31',
    termsSummary: 'Valid after GSTIN verification and corporate agreement execution.',
    badge: 'B2B EXCLUSIVE',
  },
];

const DEFAULT_TRUST_MARKERS: HomeTrustMarkerDto[] = [
  {
    id: 'trust-verified-fleet',
    icon: 'shield-check',
    title: '100% Certified Fleet',
    description: 'Every machine passes a mandatory 50-point mechanical & safety audit before dispatch.',
  },
  {
    id: 'trust-operators',
    icon: 'user-check',
    title: 'Certified Operators',
    description: 'Skilled, police-verified operators available on demand for heavy earthmoving equipment.',
  },
  {
    id: 'trust-transparent-pricing',
    icon: 'tag',
    title: 'Transparent Pricing',
    description: 'All-inclusive hourly, daily, and monthly rates with zero hidden site charges.',
  },
  {
    id: 'trust-rapid-dispatch',
    icon: 'truck',
    title: 'Doorstep Jobsite Delivery',
    description: 'Rapid mobilization within 4 hours in metro areas and same-day across tier-2 cities.',
  },
  {
    id: 'trust-gst-support',
    icon: 'receipt',
    title: 'GST Invoicing & 24/7 Support',
    description: 'Full statutory compliance with dedicated project coordinators on call round the clock.',
  },
];

const DEFAULT_TESTIMONIALS: HomeTestimonialDto[] = [
  {
    id: 'test-1',
    authorName: 'Rajesh Varma',
    roleOrCompany: 'Managing Director, Varma Infra Projects',
    city: 'Bangalore',
    rating: 5.0,
    content:
      'We rented two 20T hydraulic excavators for our metro line project. Mobilization was on time, operators were professional, and machine uptime was 100%. Highly recommended!',
    machineUsed: '20 Ton Hydraulic Excavator',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'test-2',
    authorName: 'Sunita Deshmukh',
    roleOrCompany: 'Project Head, GreenScape Residential',
    city: 'Pune',
    rating: 4.9,
    content:
      'Needed concrete mixers, needle vibrators, and scaffolding on short notice for a villa project. EquipShare delivered within 3 hours directly to our job-site.',
    machineUsed: 'Concrete Mixer & Site Tools',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'test-3',
    authorName: 'Amitabh Sen',
    roleOrCompany: 'Site Supervisor, Eastern Roadworks',
    city: 'Kolkata',
    rating: 4.8,
    content:
      'Rented a JCB 3DX and vibratory road roller for 45 days. The monthly discount structure and transparent fuel logs made billing seamless for our audit.',
    machineUsed: 'JCB 3DX Backhoe Loader',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
];

const TRENDING_SEARCHES: string[] = [
  'JCB 3DX Backhoe Loader',
  '20 Ton Excavator',
  'Concrete Mixer Half Bag',
  'Scaffolding Rental',
  'Diesel Generator 62.5 kVA',
  'Hydra Crane 14T',
  'Mini Tipper',
  'Demolition Breaker',
];

export class UserHomeRepository {
  private banners: HomeBannerDto[] = [...DEFAULT_BANNERS];
  private promotions: HomePromotionDto[] = [...DEFAULT_PROMOTIONS];
  private trustMarkers: HomeTrustMarkerDto[] = [...DEFAULT_TRUST_MARKERS];
  private testimonials: HomeTestimonialDto[] = [...DEFAULT_TESTIMONIALS];
  private trendingSearches: string[] = [...TRENDING_SEARCHES];

  public async getBanners(_city?: string): Promise<HomeBannerDto[]> {
    return this.banners.filter((b) => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public async getPromotions(): Promise<HomePromotionDto[]> {
    return this.promotions;
  }

  public async getTrustMarkers(): Promise<HomeTrustMarkerDto[]> {
    return this.trustMarkers;
  }

  public async getTestimonials(): Promise<HomeTestimonialDto[]> {
    return this.testimonials;
  }

  public async getTrendingSearches(): Promise<string[]> {
    return this.trendingSearches;
  }

  public async getUserContext(userId: string): Promise<HomeUserContextDto | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          phone: true,
          referralCode: true,
        },
      });

      if (!user) {
        return null;
      }

      // Check pending reconsents
      const pendingReconsents = await userLegalService.checkRequiresReconsent(user.id);

      return {
        id: user.id,
        firstName: user.firstName,
        phone: user.phone,
        referralCode: user.referralCode,
        hasActiveBookings: false,
        pendingReconsentsCount: pendingReconsents.length,
      };
    } catch {
      return null;
    }
  }

  // Helper for test isolation
  public resetToDefaults(): void {
    this.banners = [...DEFAULT_BANNERS];
    this.promotions = [...DEFAULT_PROMOTIONS];
    this.trustMarkers = [...DEFAULT_TRUST_MARKERS];
    this.testimonials = [...DEFAULT_TESTIMONIALS];
    this.trendingSearches = [...TRENDING_SEARCHES];
  }
}

export const userHomeRepository = new UserHomeRepository();
export default userHomeRepository;
