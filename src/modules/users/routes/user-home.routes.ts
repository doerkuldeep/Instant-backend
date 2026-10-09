import { Router } from 'express';
import {
  getHomePageFeed,
  getScreenLayout,
  getHomePagePreview,
  getBanners,
  getCategories,
  getFeaturedMachines,
  getSegments,
  getPromotions,
  getTrustMarkers,
  getTestimonials,
  getTrendingSearches,
} from '../controllers/user-home.controller';
import {
  userHomeQuerySchema,
  userHomeCategoriesQuerySchema,
  userHomeFeaturedQuerySchema,
} from '../schemas/user-home.schema';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { optionalAuthenticate } from '../../../shared/middlewares/authenticate';
import { validate } from '../../../shared/middlewares/validate';

const router = Router();

// 1. Unified full homepage feed (supports optional Bearer token)
// GET /api/user/home & GET /api/user/home/feed
router.get(
  '/',
  optionalAuthenticate,
  validate({ query: userHomeQuerySchema }),
  asyncHandler(getHomePageFeed),
);
router.get(
  '/feed',
  optionalAuthenticate,
  validate({ query: userHomeQuerySchema }),
  asyncHandler(getHomePageFeed),
);

// 2. Server-Driven UI (SDUI) Screen Layout & Schema
// GET /api/user/home/sdui & GET /api/user/home/layout
router.get(
  '/sdui',
  optionalAuthenticate,
  validate({ query: userHomeQuerySchema }),
  asyncHandler(getScreenLayout),
);
router.get(
  '/layout',
  optionalAuthenticate,
  validate({ query: userHomeQuerySchema }),
  asyncHandler(getScreenLayout),
);

// 3. Live Server-Rendered HTML Web App Preview
// GET /api/user/home/preview
router.get(
  '/preview',
  optionalAuthenticate,
  validate({ query: userHomeQuerySchema }),
  asyncHandler(getHomePagePreview),
);

// 2. Hero banners & promotional carousel
// GET /api/user/home/banners
router.get(
  '/banners',
  validate({ query: userHomeQuerySchema }),
  asyncHandler(getBanners),
);

// 3. Curated top categories
// GET /api/user/home/categories
router.get(
  '/categories',
  validate({ query: userHomeCategoriesQuerySchema }),
  asyncHandler(getCategories),
);

// 4. Featured & iconic rental machines
// GET /api/user/home/featured
router.get(
  '/featured',
  validate({ query: userHomeFeaturedQuerySchema }),
  asyncHandler(getFeaturedMachines),
);

// 5. Machinery segments overview (LIGHT, HEAVY, OTHER)
// GET /api/user/home/segments
router.get('/segments', asyncHandler(getSegments));

// 6. Active promotional discounts & coupon offers
// GET /api/user/home/promotions
router.get('/promotions', asyncHandler(getPromotions));

// 7. Trust indicators & value propositions
// GET /api/user/home/trust-markers
router.get('/trust-markers', asyncHandler(getTrustMarkers));

// 8. Contractor testimonials & verified reviews
// GET /api/user/home/testimonials
router.get('/testimonials', asyncHandler(getTestimonials));

// 9. Trending search keywords
// GET /api/user/home/search-trends
router.get('/search-trends', asyncHandler(getTrendingSearches));

export const userHomeRoutes = router;
export default userHomeRoutes;
