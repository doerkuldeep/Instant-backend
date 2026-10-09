import { Request, Response } from 'express';
import { userHomeService } from '../services/user-home.service';
import { renderUserHomeHtml } from '../services/user-home-html.renderer';

/**
 * GET /api/user/home (or /api/user/home/feed)
 * Aggregated customer homepage feed.
 * Supports optional Bearer JWT for personalized greeting & context.
 * Pass ?format=sdui or ?format=layout for Server-Driven UI JSON contract.
 * Pass ?format=html or Accept: text/html for live rendered web page preview.
 */
export async function getHomePageFeed(req: Request, res: Response): Promise<void> {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : undefined;
  const userId = req.user?.id;
  const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : undefined;
  const acceptsHtml = req.headers.accept?.includes('text/html');

  if (format === 'html' || (acceptsHtml && format !== 'json')) {
    const layout = await userHomeService.getScreenLayout({ city, userId });
    const html = renderUserHomeHtml(layout);
    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    return;
  }

  if (format === 'sdui' || format === 'layout') {
    const layout = await userHomeService.getScreenLayout({ city, userId });
    res.status(200).json({
      success: true,
      data: layout,
    });
    return;
  }

  const feed = await userHomeService.getHomePageFeed({ city, userId });

  res.status(200).json({
    success: true,
    data: feed,
  });
}

/**
 * GET /api/user/home/sdui (or /api/user/home/layout)
 * Full Server-Driven UI (SDUI) dynamic screen schema.
 * Defines screen layout, ordered UI component widgets, design tokens, action deep-links, and responsive rules.
 */
export async function getScreenLayout(req: Request, res: Response): Promise<void> {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : undefined;
  const userId = req.user?.id;

  const layout = await userHomeService.getScreenLayout({ city, userId });

  res.status(200).json({
    success: true,
    data: layout,
  });
}

/**
 * GET /api/user/home/preview (or /api/user/home/render)
 * Live rendered HTML preview of the Server-Driven UI homepage.
 */
export async function getHomePagePreview(req: Request, res: Response): Promise<void> {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : undefined;
  const userId = req.user?.id;

  const layout = await userHomeService.getScreenLayout({ city, userId });
  const html = renderUserHomeHtml(layout);

  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
}

/**
 * GET /api/user/home/banners
 * Promotional hero banners / carousel slides for mobile & web.
 */
export async function getBanners(req: Request, res: Response): Promise<void> {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : undefined;
  const banners = await userHomeService.getBanners(city);

  res.status(200).json({
    success: true,
    data: banners,
  });
}

/**
 * GET /api/user/home/categories
 * Curated top categories with machine counts and popular flags.
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 12;
  const categories = await userHomeService.getCategories(Number.isNaN(limit) ? 12 : limit);

  res.status(200).json({
    success: true,
    data: categories,
  });
}

/**
 * GET /api/user/home/featured
 * Curated iconic & trending rental machines across segments.
 */
export async function getFeaturedMachines(req: Request, res: Response): Promise<void> {
  const segment =
    typeof req.query.segment === 'string' &&
    ['LIGHT', 'HEAVY', 'OTHER'].includes(req.query.segment.toUpperCase())
      ? (req.query.segment.toUpperCase() as 'LIGHT' | 'HEAVY' | 'OTHER')
      : undefined;

  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 8;

  const featured = await userHomeService.getFeaturedMachines({
    segment,
    limit: Number.isNaN(limit) ? 8 : limit,
  });

  res.status(200).json({
    success: true,
    data: featured,
  });
}

/**
 * GET /api/user/home/segments
 * Overview of LIGHT, HEAVY, and OTHER machinery segments with starting rates.
 */
export async function getSegments(_req: Request, res: Response): Promise<void> {
  const segments = await userHomeService.getSegments();

  res.status(200).json({
    success: true,
    data: segments,
  });
}

/**
 * GET /api/user/home/promotions
 * Active platform promotional discount codes and rental offers.
 */
export async function getPromotions(_req: Request, res: Response): Promise<void> {
  const promotions = await userHomeService.getPromotions();

  res.status(200).json({
    success: true,
    data: promotions,
  });
}

/**
 * GET /api/user/home/trust-markers
 * Customer trust indicators and platform guarantees.
 */
export async function getTrustMarkers(_req: Request, res: Response): Promise<void> {
  const trustMarkers = await userHomeService.getTrustMarkers();

  res.status(200).json({
    success: true,
    data: trustMarkers,
  });
}

/**
 * GET /api/user/home/testimonials
 * Verified contractor reviews and customer project stories.
 */
export async function getTestimonials(_req: Request, res: Response): Promise<void> {
  const testimonials = await userHomeService.getTestimonials();

  res.status(200).json({
    success: true,
    data: testimonials,
  });
}

/**
 * GET /api/user/home/search-trends
 * Fast search suggestions & trending machinery keywords.
 */
export async function getTrendingSearches(_req: Request, res: Response): Promise<void> {
  const trends = await userHomeService.getTrendingSearches();

  res.status(200).json({
    success: true,
    data: trends,
  });
}

export const userHomeController = {
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
};

export default userHomeController;

